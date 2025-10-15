"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { DataPagination } from "@/components/utils/data-pagination";
import { DataTable } from "@/components/utils/data-table";

import { usePageValidation } from "@/hooks/use-page-validation";

import { useAgentsFilters } from "@/modules/agents/hooks/use-agents-filters";
import { columns } from "@/modules/agents/ui/components/columns";

import { useTRPC } from "@/trpc/client";

export const AgentsView = () => {
  const router = useRouter();
  const trpc = useTRPC();

  const [filters, setFilters] = useAgentsFilters();

  const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    }),
  );

  usePageValidation(
    filters.page,
    (page) => setFilters({ page }),
    data.totalPages,
  );

  const title =
    filters.search.length > 0
      ? `We cannot find any agents with the name '${filters.search}'`
      : "Create your first agent";
  const description =
    filters.search.length > 0
      ? `Try modifying the keyword or create a new agent.`
      : "Create an agent to join a meeting. Each agent will follow your instructions and can interact with participants during the call.";

  return (
    <div className="flex flex-col flex-1 px-4 mt-2 mb-4 md:px-8 gap-y-4">
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
      {data.items.length === 0 ? (
        <EmptyState title={title} description={description} />
      ) : (
        <DataTable
          label="agent"
          data={data.items}
          columns={columns}
          onRowClick={(row) => router.push(`/dashboard/agents/${row.id}`)}
        />
      )}
    </div>
  );
};

export const AgentsViewLoading = () => {
  return <LoadingState loadingText="Loading agents" type="agents" />;
};

export const AgentsViewError = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const handleRetry = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.agents.getMany.queryKey(),
    });
  };

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <ErrorState
        title="An error occurred while loading agents"
        code="FAILED_TO_LOAD_AGENTS"
        showRetry={true}
        onRetry={handleRetry}
      />
    </main>
  );
};
