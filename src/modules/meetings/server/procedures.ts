import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants/pagination";

import { db } from "@/db";
import { meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

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
        })
        .from(meetings)
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
      }),
    )
    .query(async ({ input, ctx }) => {
      const { search, page, pageSize } = input;

      // First get the total count
      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
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
        })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
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
});
