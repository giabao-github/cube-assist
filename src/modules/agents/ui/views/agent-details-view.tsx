"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { useTRPC } from "@/trpc/client";

import { AgentDetailsViewHeader } from "../components/agent-details-view-header";

interface AgentDetailsViewProps {
  agentId: string;
}

export const AgentDetailsView = ({ agentId }: AgentDetailsViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-4 md:px-8 gap-y-4">
      <AgentDetailsViewHeader
        agentId={agentId}
        agentName={data.name}
        onEdit={() => {}}
        onRemove={() => {}}
      />
      <div className="bg-white border rounded-lg">
        <div className="flex flex-col col-span-5 px-4 py-5 gap-y-6">
          <div className="flex items-center gap-x-3">
            <GeneratedAvatar
              variant="botttsNeutral"
              seed={data.name}
              className="size-10"
            />
            <h2 className="text-2xl font-medium">{data.name}</h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-x-2 [&>svg]:size-4"
          >
            <VideoIcon className="text-blue-700" />
            <p className="text-blue-700">
              {data.meetingCount}{" "}
              {data.meetingCount > 1 ? "meetings" : "meeting"}
            </p>
          </Badge>
          <div className="flex flex-col gap-y-3">
            <p className="text-lg font-medium">Instructions</p>
            <p className="text-neutral-800">{data.instructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgentDetailsViewLoading = () => {
  return <LoadingState loadingText="Loading agent details" />;
};

export const AgentDetailsViewError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <ErrorState
        title="An error occurred while loading agent details"
        code="FAILED_TO_LOAD_AGENT_DETAILS"
        onRetry={handleRetry}
      />
    </main>
  );
};
