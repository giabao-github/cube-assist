import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  ne,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants/pagination";

import { generateAvatarUri } from "@/lib/avatar";
import { streamVideo } from "@/lib/stream-video";

import {
  meetingsInsertSchema,
  meetingsUpdateSchema,
} from "@/modules/meetings/zod-schema";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { MeetingStatus } from "../types";

// Test loading and error state
// await new Promise((resolve) => setTimeout(resolve, 5000));
// throw new TRPCError({ code: "BAD_REQUEST" });

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existingMeeting] = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            "duration",
          ),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        );

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting is not found",
        });
      }

      return existingMeeting;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
          ])
          .nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { search, page, pageSize, status, agentId } = input;

      // First get the total count
      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          ),
        );

      // If there are no meetings, return empty result instead of throwing
      if (totalCount === 0) {
        return {
          items: [],
          total: 0,
          totalPages: 0,
        };
      }

      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            "duration",
          ),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          ),
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;

      return {
        items: data,
        total: totalCount,
        totalPages,
      };
    }),

  // Admins or devs access only
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.auth.role !== "admin" && ctx.auth.role !== "dev") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin or developer access is required",
      });
    }
    const data = await db
      .select({
        ...getTableColumns(meetings),
      })
      .from(meetings);
    return data;
  }),

  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [createdMeeting] = await db
          .insert(meetings)
          .values({
            ...input,
            userId: ctx.auth.user.id,
          })
          .returning();

        // Create stream call, upsert stream users
        try {
          const call = streamVideo.video.call("default", createdMeeting.id);
          await call.create({
            data: {
              created_by_id: ctx.auth.user.id,
              custom: {
                meetingId: createdMeeting.id,
                meetingName: createdMeeting.name,
              },
              settings_override: {
                transcription: {
                  language: "en",
                  mode: "auto-on",
                  closed_caption_mode: "auto-on",
                },
                recording: {
                  mode: "auto-on",
                  quality: "1080p",
                },
              },
            },
          });
        } catch (streamError) {
          await db.delete(meetings).where(eq(meetings.id, createdMeeting.id));
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to initialize video call. Please try again.",
            cause: streamError,
          });
        }

        const [existingAgent] = await db
          .select()
          .from(agents)
          .where(eq(agents.id, createdMeeting.agentId));

        if (!existingAgent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "The agent associated with this meeting has been deleted or no longer available",
          });
        }

        await streamVideo.upsertUsers([
          {
            id: existingAgent.id,
            name: existingAgent.name,
            role: "user",
            image: generateAvatarUri({
              seed: existingAgent.name,
              variant: "botttsNeutral",
            }),
            ...(() => {
              const avatar = generateAvatarUri({
                seed: existingAgent.name,
                variant: "botttsNeutral",
              });
              return avatar ? { image: avatar } : {};
            })(),
          },
        ]);

        return createdMeeting;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A meeting with this name already exists",
          });
        }
        throw error;
      }
    }),

  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [conflictingMeeting] = await db
        .select({ id: meetings.id })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.name, input.name),
            ne(meetings.id, input.id),
          ),
        );

      if (conflictingMeeting) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A meeting with this name already exists",
        });
      }

      try {
        const [updatedMeeting] = await db
          .update(meetings)
          .set({
            name: input.name,
            agentId: input.agentId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(meetings.id, input.id),
              eq(meetings.userId, ctx.auth.user.id),
            ),
          )
          .returning();

        if (!updatedMeeting) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "This meeting is no longer available or you don't have permission to update it",
          });
        }

        return updatedMeeting;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A meeting with this name already exists",
          });
        }
        throw error;
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removedMeeting] = await db
        .delete(meetings)
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!removedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This meeting does not exist or has been deleted",
        });
      }

      return removedMeeting;
    }),

  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        name: ctx.auth.user.name,
        role: "admin",
        image:
          ctx.auth.user.image ??
          generateAvatarUri({ seed: ctx.auth.user.name, variant: "initials" }),
      },
    ]);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });

    return token;
  }),
});
