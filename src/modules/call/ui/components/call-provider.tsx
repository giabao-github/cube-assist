"use client";

import { LoadingState } from "@/components/states/loading-state";

import { authClient } from "@/lib/auth/auth-client";

import { CallConnect } from "@/modules/call/ui/components/call-connect";

interface CallProviderProps {
  meetingId: string;
  meetingName: string;
}

export const CallProvider = ({ meetingId, meetingName }: CallProviderProps) => {
  const { data, isPending } = authClient.useSession();

  if (!data || isPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-radial from-sidebar-accent to-sidebar">
        <LoadingState type="call" loadingText="Loading video call" />
      </div>
    );
  }

  return <CallConnect meetingId={meetingId} meetingName={meetingName} />;
};
