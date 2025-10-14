import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import {
  AgentDetailsView,
  AgentDetailsViewError,
  AgentDetailsViewLoading,
} from "@/modules/agents/ui/views/agent-details-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface AgentPageProps {
  params: Promise<{ agentId: string }>;
}

const AgentPage = async ({ params }: AgentPageProps) => {
  const { agentId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login", "replace" as RedirectType);
  }

  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(
      trpc.agents.getOne.queryOptions({ id: agentId }),
    );
  } catch (err) {
    console.error("Prefetch agent details failed:", err);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentDetailsViewLoading />}>
        <ErrorBoundary FallbackComponent={AgentDetailsViewError}>
          <AgentDetailsView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default AgentPage;
