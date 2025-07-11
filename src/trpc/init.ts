import { cache } from "react";

import { TRPCError, initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { db } from "@/db";
import { user } from "@/db/schema";

class LRUCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 1000, ttlMs = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const roleCache = new LRUCache<string>(1000, 5 * 60 * 1000);

export const createTRPCContext = cache(async () => {
  return { userId: "user_123" };
});

const t = initTRPC.create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const getUserRole = async (userId: string): Promise<string> => {
  const cachedRole = roleCache.get(userId);

  if (cachedRole) {
    return cachedRole;
  }

  const userRecord = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
    .then((res) => res[0]);

  if (!userRecord) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User is not found",
    });
  }

  roleCache.set(userId, userRecord.role);
  return userRecord.role;
};

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

  const role = await getUserRole(session.user.id);

  return next({
    ctx: {
      ...ctx,
      auth: { ...session, role: role },
    },
  });
});
