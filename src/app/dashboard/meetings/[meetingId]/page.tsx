import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

import {
  MeetingDetailsView,
  MeetingDetailsViewError,
  MeetingDetailsViewLoading,
} from "@/modules/meetings/ui/views/meeting-details-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface MeetingPageProps {
  params: Promise<{ meetingId: string }>;
}

const MeetingPage = async ({ params }: MeetingPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login", "replace" as RedirectType);
  }

  const { meetingId } = await params;

  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(
      trpc.meetings.getOne.queryOptions({ id: meetingId }),
    );
  } catch (err) {
    console.error("Prefetch meeting details failed:", err);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingDetailsViewLoading />}>
        <ErrorBoundary FallbackComponent={MeetingDetailsViewError}>
          <MeetingDetailsView meetingId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default MeetingPage;
