import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];
export type MeetingsGetMany =
  inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"];

export type Meeting = {
  id: string;
  name: string;
  userId: string;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
};
