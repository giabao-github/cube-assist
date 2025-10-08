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

import {
  agentsInsertSchema,
  agentsUpdateSchema,
} from "@/modules/agents/zod-schema";

import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// Test loading and error state
// await new Promise((resolve) => setTimeout(resolve, 5000));
// throw new TRPCError({ code: "BAD_REQUEST" });

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existingAgent] = await db
        .select({
          // TODO: Change to actual meeting count when implemented, the below prop is to fix ts error
          meetingCount: sql<number>`6`,
          ...getTableColumns(agents),
        })
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        );

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent is not found",
        });
      }

      return existingAgent;
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
      }),
    )
    .query(async ({ input, ctx }) => {
      const { search, page, pageSize } = input;

      // First get the total count
      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        );

      // If there are no agents, return empty result instead of throwing
      if (totalCount === 0) {
        return {
          items: [],
          total: 0,
          totalPages: 0,
        };
      }

      const data = await db
        .select({
          // TODO: Change to actual meeting count when implemented, the below prop is to fix ts error
          meetingCount: sql<number>`6`,
          ...getTableColumns(agents),
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
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
        // TODO: Change to actual meeting count when implemented, the below prop is to fix ts error
        meetingCount: sql<number>`6`,
        ...getTableColumns(agents),
      })
      .from(agents);
    return data;
  }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(
          and(eq(agents.name, input.name), eq(agents.userId, ctx.auth.user.id)),
        );

      if (existingAgent) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An agent with this name already exists",
        });
      }

      try {
        const [createdAgent] = await db
          .insert(agents)
          .values({
            ...input,
            userId: ctx.auth.user.id,
          })
          .returning();

        return createdAgent;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An agent with this name already exists",
          });
        }
        throw error;
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removedAgent] = await db
        .delete(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!removedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This agent does not exist or has been deleted",
        });
      }

      return removedAgent;
    }),

  update: protectedProcedure
    .input(agentsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [conflictingAgent] = await db
        .select({ id: agents.id })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            eq(agents.name, input.name),
            ne(agents.id, input.id),
          ),
        );

      if (conflictingAgent) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An agent with this name already exists",
        });
      }

      try {
        const [updatedAgent] = await db
          .update(agents)
          .set({
            name: input.name,
            instructions: input.instructions,
            updatedAt: new Date(),
          })
          .where(
            and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
          )
          .returning();

        if (!updatedAgent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This agent does not exist or has been deleted",
          });
        }

        return updatedAgent;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An agent with this name already exists",
          });
        }
        throw error;
      }
    }),
});
