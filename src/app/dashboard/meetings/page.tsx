import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { headers } from "next/headers";
import { type RedirectType, redirect } from "next/navigation";
import type { SearchParams } from "nuqs";

import { validateListFilters } from "@/hooks/use-page-validation";

import { auth } from "@/lib/auth";

import { loadSearchParams } from "@/modules/meetings/params";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import {
  MeetingsView,
  MeetingsViewError,
  MeetingsViewLoading,
} from "@/modules/meetings/ui/views/meetings-view";

import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Meetings - Cube Assist",
};

interface MeetingsPageProps {
  searchParams: Promise<SearchParams>;
}

const MeetingsPage = async ({ searchParams }: MeetingsPageProps) => {
  const filters = await loadSearchParams(searchParams);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login", "replace" as RedirectType);
  }

  const queryClient = getQueryClient();

  const validatedFilters = validateListFilters(filters);

  try {
    await queryClient.prefetchQuery(
      trpc.meetings.getMany.queryOptions(validatedFilters),
    );
  } catch (error) {
    console.error("Prefetch meetings failed:", error);
  }

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <ErrorBoundary FallbackComponent={MeetingsViewError}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default MeetingsPage;
