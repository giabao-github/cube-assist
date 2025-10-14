"use client";

import { useState } from "react";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { useConfirm } from "@/hooks/use-confirm";

import { formatTime } from "@/lib/utils";

import { MeetingDetailsViewHeader } from "@/modules/meetings/ui/components/meeting-details-view-header";
import { UpdateMeetingDialog } from "@/modules/meetings/ui/components/update-meeting-dialog";

import { useTRPC } from "@/trpc/client";

interface MeetingDetailsViewProps {
  meetingId: string;
}

export const MeetingDetailsView = ({ meetingId }: MeetingDetailsViewProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );
        // TODO: Invalidate free tier usage
        toast.success(`Meeting "${data.name}" deleted successfully`);
        router.push("/dashboard/meetings");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure you want to delete this meeting?",
    `The following action will permanently delete the "${data.name}" meeting and this action cannot be undone`,
    "Delete",
    true,
  );

  const handleRemoveMeeting = async () => {
    if (removeMeeting.isPending) {
      return;
    }

    const ok = await confirmRemove();

    if (!ok) return;

    try {
      await removeMeeting.mutateAsync({ id: meetingId });
    } catch {
      // onError already surfaces the toast
    }
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen}
        onOpenChange={setUpdateMeetingDialogOpen}
        initialValues={data}
      />
      <div className="flex flex-col flex-1 px-4 py-4 md:px-8 gap-y-4">
        <MeetingDetailsViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => setUpdateMeetingDialogOpen(true)}
          onRemove={handleRemoveMeeting}
          isRemoving={removeMeeting.isPending}
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
            <div className="flex flex-col gap-y-3">
              <p className="text-lg font-medium">Agent</p>
              <p className="text-neutral-800">{data.agent.name}</p>
            </div>
            <div className="flex flex-col gap-y-3">
              <p className="text-lg font-medium">Status</p>
              <p className="text-neutral-800">{data.status}</p>
            </div>
            <div className="flex flex-col gap-y-3">
              <p className="text-lg font-medium">Created at</p>
              <p className="text-neutral-800">{formatTime(data.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const MeetingDetailsViewLoading = () => {
  return <LoadingState loadingText="Loading meeting details" type="meetings" />;
};

export const MeetingDetailsViewError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <ErrorState
        title="An error occurred while loading meeting details"
        code="FAILED_TO_LOAD_MEETING_DETAILS"
        onRetry={handleRetry}
      />
    </main>
  );
};
