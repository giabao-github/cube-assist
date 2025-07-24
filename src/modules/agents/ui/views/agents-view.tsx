"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { columns } from "@/modules/agents/ui/components/columns";
import { DataTable } from "@/modules/agents/ui/components/data-table";

import { useTRPC } from "@/trpc/client";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return (
    <div className="flex flex-col flex-1 px-4 mt-2 mb-4 md:px-8 gap-y-4">
      {data.length === 0 ? (
        <EmptyState
          title="Create your first agent"
          description="Create an agent to join a meeting. Each agent will follow your instructions and can interact with participants during the call."
        />
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
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
