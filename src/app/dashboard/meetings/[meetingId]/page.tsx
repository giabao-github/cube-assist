import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import {
  AgentDetailsView,
  AgentDetailsViewError,
  AgentDetailsViewLoading,
} from "@/modules/agents/ui/views/agent-details-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface MeetingPageProps {
  params: Promise<{ agentId: string }>;
}

const MeetingPage = async ({ params }: MeetingPageProps) => {
  const { agentId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.agents.getOne.queryOptions({
      id: agentId,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentDetailsViewLoading />}>
        <ErrorBoundary fallback={<AgentDetailsViewError />}>
          <AgentDetailsView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default MeetingPage;
