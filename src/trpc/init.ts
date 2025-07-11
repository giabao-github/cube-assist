import { cache } from "react";

import { TRPCError, initTRPC } from "@trpc/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/session-cache";

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

  if (!session.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid session: missing user ID",
    });
  }

  const role = await getUserRole(session.user.id);

  return next({
    ctx: {
      ...ctx,
      auth: { ...session, role: role },
    },
  });
});
