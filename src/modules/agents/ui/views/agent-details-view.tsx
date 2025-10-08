"use client";

import { useState } from "react";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { useConfirm } from "@/hooks/use-confirm";

import { AgentDetailsViewHeader } from "@/modules/agents/ui/components/agent-details-view-header";
import { UpdateAgentDialog } from "@/modules/agents/ui/components/update-agent-dialog";

import { useTRPC } from "@/trpc/client";

interface AgentDetailsViewProps {
  agentId: string;
}

export const AgentDetailsView = ({ agentId }: AgentDetailsViewProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({}),
        );
        // TODO: Invalidate free tier usage
        router.push("/dashboard/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure you want to delete this agent?",
    `The following action will permanently delete ${data.name} and its ${data.meetingCount} associated ${data.meetingCount > 1 ? "meetings" : "meeting"}`,
    "Delete",
    true,
  );

  const handleRemoveAgent = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    try {
      await removeAgent.mutateAsync({ id: agentId });
    } catch {
      // onError already surfaces the toast
    }
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateAgentDialog
        open={updateAgentDialogOpen}
        onOpenChange={setUpdateAgentDialogOpen}
        initialValues={data}
      />
      <div className="flex flex-col flex-1 px-4 py-4 md:px-8 gap-y-4">
        <AgentDetailsViewHeader
          agentId={agentId}
          agentName={data.name}
          onEdit={() => setUpdateAgentDialogOpen(true)}
          onRemove={handleRemoveAgent}
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
    </>
  );
};

export const AgentDetailsViewLoading = () => {
  return <LoadingState loadingText="Loading agent details" type="agents" />;
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
