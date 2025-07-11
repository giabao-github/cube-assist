import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { LRUCache } from "lru-cache";

import { db } from "@/db";
import { user } from "@/db/schema";

const roleCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 5 * 60 * 1000,
});

const pendingRoleRequests = new Map<string, Promise<string>>();

export const fetchUserRole = async (userId: string): Promise<string> => {
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

  return userRecord.role;
};

export const invalidateUserRole = (userId: string) => {
  roleCache.delete(userId);
};

export const clearRoleCache = () => {
  roleCache.clear();
};

export const getUserRole = async (userId: string): Promise<string> => {
  const cachedRole = roleCache.get(userId);

  if (cachedRole) {
    return cachedRole;
  }

  // Check if there's already a pending request for this user
  const pendingRequest = pendingRoleRequests.get(userId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const rolePromise = fetchUserRole(userId);
  pendingRoleRequests.set(userId, rolePromise);

  try {
    const role = await rolePromise;
    roleCache.set(userId, role);
    return role;
  } finally {
    pendingRoleRequests.delete(userId);
  }
};
