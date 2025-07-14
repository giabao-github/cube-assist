import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

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
        .select()
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        );
      return existingAgent;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const data = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.auth.user.id));
    return data;
  }),

  // Admins or devs access only
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.auth.role !== "admin" && ctx.auth.role !== "dev") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin or developer access is required",
      });
    }
    const data = await db.select().from(agents);
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
