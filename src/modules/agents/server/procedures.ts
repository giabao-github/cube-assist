import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants/pagination";

import { agentsInsertSchema } from "@/modules/agents/zod-schema";

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
        page: z.number().default(DEFAULT_PAGE),
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

      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        );

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

      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdAgent;
    }),
});
