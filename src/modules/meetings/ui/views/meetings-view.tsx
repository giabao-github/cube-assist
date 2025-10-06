"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { useTRPC } from "@/trpc/client";

export const MeetingsView = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));

  return (
    <div className="flex flex-col flex-1 px-4 mt-2 mb-4 md:px-8 gap-y-4">
      {/* TODO: implement actual meetings table */}
      {JSON.stringify(data, null, 2)}
    </div>
  );
};

export const MeetingsViewLoading = () => {
  return <LoadingState loadingText="Loading meetings" type="meetings" />;
};

export const MeetingsViewError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <ErrorState
        title="An error occurred while loading meetings"
        code="FAILED_TO_LOAD_MEETINGS"
        onRetry={handleRetry}
      />
    </main>
  );
};
