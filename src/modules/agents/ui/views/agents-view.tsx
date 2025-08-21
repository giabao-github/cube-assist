"use client";

import { useEffect } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { DEFAULT_PAGE } from "@/constants/pagination";

import { useAgentsFilters } from "@/modules/agents/hooks/use-agents-filters";
import { columns } from "@/modules/agents/ui/components/columns";
import { DataPagination } from "@/modules/agents/ui/components/data-pagination";
import { DataTable } from "@/modules/agents/ui/components/data-table";

import { useTRPC } from "@/trpc/client";

export const AgentsView = () => {
  const trpc = useTRPC();

  // First query to get total pages
  const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      page: DEFAULT_PAGE,
    }),
  );

  // Then use filters with total pages for validation
  const [filters, setFilters] = useAgentsFilters({
    totalPages: data.totalPages,
  });

  useEffect(() => {
    // Validate against both lower and upper bounds
    const validPage = Math.min(
      Math.max(1, filters.page || DEFAULT_PAGE),
      data.totalPages,
    );
    if (validPage !== filters.page) {
      setFilters({ page: validPage }, { history: "replace" });
    }
  }, [filters.page, setFilters, data.totalPages]);

  // Use the validated filters for the main query
  const { data: pageData } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
      page: Math.min(
        Math.max(
          DEFAULT_PAGE,
          filters.page && isNaN(filters.page) ? filters.page : DEFAULT_PAGE,
        ),
        data.totalPages,
      ),
    }),
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
      {pageData.items.length === 0 ? (
        <EmptyState title={title} description={description} />
      ) : (
        <DataTable data={pageData.items} columns={columns} />
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
      queryKey: trpc.agents.getMany.queryOptions({}).queryKey,
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
