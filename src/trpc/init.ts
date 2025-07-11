import { cache } from "react";

import { TRPCError, initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { db } from "@/db";
import { user } from "@/db/schema";

export const createTRPCContext = cache(async () => {
  return { userId: "user_123" };
});

const t = initTRPC.create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const userRecord = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
    .then((res) => res[0]);

  if (!userRecord) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User is not found or unverified",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: { ...session, role: userRecord.role },
    },
  });
});
