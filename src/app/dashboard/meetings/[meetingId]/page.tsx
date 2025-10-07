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
  params: Promise<{ meetingId: string }>;
}

const MeetingPage = async ({ params }: MeetingPageProps) => {
  const { meetingId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({
      id: meetingId,
    }),
  );

  {
    /* TODO: change to meeting view, loading and error */
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentDetailsViewLoading />}>
        <ErrorBoundary fallback={<AgentDetailsViewError />}>
          <AgentDetailsView agentId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default MeetingPage;
