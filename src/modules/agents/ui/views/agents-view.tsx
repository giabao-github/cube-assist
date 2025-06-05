"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { useTRPC } from "@/trpc/client";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return <div>{JSON.stringify(data, null, 2)}</div>;
};

export const AgentsViewLoading = () => {
  return <LoadingState loadingText="Loading agents" />;
};

export const AgentsViewError = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.agents.getMany.queryOptions().queryKey,
    });
  };

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <ErrorState
        title="An error occurred while loading agents"
        code="FAILED_TO_LOAD_AGENTS"
        onRetry={handleRetry}
      />
    </main>
  );
};
