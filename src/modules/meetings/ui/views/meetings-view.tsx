"use client";

import { useEffect, useRef } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { DataTable } from "@/components/utils/data-table";

import { useMeetingsFilters } from "@/modules/meetings/hooks/use-meetings-filters";
import { columns } from "@/modules/meetings/ui/components/columns";
import { DataPagination } from "@/modules/meetings/ui/components/data-pagination";

import { useTRPC } from "@/trpc/client";

interface MeetingsViewProps {
  initialFilters: { page: number; pageSize?: number; search?: string | null };
}

export const MeetingsView = ({ initialFilters }: MeetingsViewProps) => {
  const router = useRouter();
  const trpc = useTRPC();

  const [filters, setFilters] = useMeetingsFilters();

  const hasValidated = useRef(false);

  useEffect(() => {
    if (hasValidated.current) return;
    hasValidated.current = true;

    if (filters.page < 1) {
      setFilters({ page: 1 });
    }
  }, []);

  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...initialFilters,
      search: filters.search || undefined,
      page: Math.max(1, filters.page),
    }),
  );

  useEffect(() => {
    if (data.totalPages > 0 && filters.page > data.totalPages) {
      setFilters({ page: data.totalPages });
    }
  }, [data.totalPages, filters.page, setFilters]);

  const title =
    filters.search.length > 0
      ? `We cannot find any meetings with the name '${filters.search}'`
      : "Create a new meeting";
  const description =
    filters.search.length > 0
      ? `Try modifying the keyword or create a new meeting.`
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
