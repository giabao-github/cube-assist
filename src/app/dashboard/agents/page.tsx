import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { headers } from "next/headers";
import { type RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  AgentsView,
  AgentsViewError,
  AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Agents - Cube Assist",
};

const AgentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/", "replace" as RedirectType);
  }

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());
  } catch (error) {
    console.error("Prefetch failed:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentsViewLoading />}>
        <ErrorBoundary fallback={<AgentsViewError />}>
          <AgentsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default AgentsPage;
