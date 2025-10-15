import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

import {
  CallView,
  CallViewError,
  CallViewLoading,
} from "@/modules/call/ui/views/call-view";

import { getQueryClient, trpc } from "@/trpc/server";

interface CallPageProps {
  params: Promise<{ meetingId: string }>;
}

const CallPage = async ({ params }: CallPageProps) => {
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
      <Suspense fallback={<CallViewLoading />}>
        <ErrorBoundary FallbackComponent={CallViewError}>
          <CallView meetingId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default CallPage;
