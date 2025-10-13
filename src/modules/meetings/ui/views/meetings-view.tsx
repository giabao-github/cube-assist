"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { DataPagination } from "@/components/utils/data-pagination";
import { DataTable } from "@/components/utils/data-table";

import { usePageValidation } from "@/hooks/use-page-validation";

import { useMeetingsFilters } from "@/modules/meetings/hooks/use-meetings-filters";
import { columns } from "@/modules/meetings/ui/components/columns";

import { useTRPC } from "@/trpc/client";

export const MeetingsView = () => {
  const router = useRouter();
  const trpc = useTRPC();

  const [filters, setFilters] = useMeetingsFilters();

  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    }),
  );

  usePageValidation(
    filters.page,
    (page) => setFilters({ page }),
    data.totalPages,
  );

  const title =
    filters.search.length > 0 || !!filters.status || !!filters.agentId
      ? `We cannot find any meetings matched your filter(s)`
      : "Create a new meeting";
  const description =
    filters.search.length > 0 || !!filters.status || !!filters.agentId
      ? `Try modifying your filter(s) or create a new meeting.`
      : "Create a meeting to join. You can pick a meeting-specified agent which can interact with participants during the call.";

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
          label="meeting"
          data={data.items}
          columns={columns}
          onRowClick={(row) => router.push(`/dashboard/meetings/${row.id}`)}
        />
      )}
    </div>
  );
};

export const MeetingsViewLoading = () => {
  return <LoadingState loadingText="Loading meetings" type="meetings" />;
};

export const MeetingsViewError = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const handleRetry = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.meetings.getMany.queryKey(),
    });
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
