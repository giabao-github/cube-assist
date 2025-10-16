"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";

import { CallProvider } from "@/modules/call/ui/components/call-provider";

import { useTRPC } from "@/trpc/client";

interface CallViewProps {
  meetingId: string;
}

export const CallView = ({ meetingId }: CallViewProps) => {
  const router = useRouter();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({
      id: meetingId,
    }),
  );

  if (data.status === "completed") {
    return (
      <div className="flex items-center justify-center h-screen">
        <ErrorState
          title="This meeting has ended"
          description="Consider joining another meeting"
          showAction={true}
          actionLabel="Go back"
          onAction={() => router.push("/dashboard/meetings")}
        />
      </div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};

export const CallViewLoading = () => {
  return <LoadingState loadingText="Loading call" type="call" />;
};

export const CallViewError = ({ meetingId }: { meetingId: string }) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const handleRetry = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.meetings.getOne.queryKey({ id: meetingId }),
    });
  };

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <ErrorState
        title="An error occurred while loading call"
        code="FAILED_TO_LOAD_CALL"
        onRetry={handleRetry}
      />
    </main>
  );
};
