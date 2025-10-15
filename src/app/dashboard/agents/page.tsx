import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { headers } from "next/headers";
import { type RedirectType, redirect } from "next/navigation";
import type { SearchParams } from "nuqs";

import { auth } from "@/lib/auth/auth";

import { loadSearchParams } from "@/modules/agents/params";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import {
  AgentsView,
  AgentsViewError,
  AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";

import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Agents - Cube Assist",
};

interface AgentsPageProps {
  searchParams: Promise<SearchParams>;
}

const AgentsPage = async ({ searchParams }: AgentsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login", "replace" as RedirectType);
  }

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(
      trpc.agents.getMany.queryOptions({ ...filters }),
    );
  } catch (error) {
    console.error("Prefetch agents failed:", error);
  }

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary FallbackComponent={AgentsViewError}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default AgentsPage;
