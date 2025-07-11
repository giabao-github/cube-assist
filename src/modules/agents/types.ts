import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

export type AgentGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];

export type Agent = {
  id: string;
  name: string;
  userId: string;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
};
