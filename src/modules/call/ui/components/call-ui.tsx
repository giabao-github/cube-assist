"use client";

import { useCallback, useEffect, useState } from "react";

import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useQueryClient } from "@tanstack/react-query";

import { rToast } from "@/lib/toast-utils";

import { CallActive } from "@/modules/call/ui/components/call-active";
import { CallEnded } from "@/modules/call/ui/components/call-ended";
import { CallLobby } from "@/modules/call/ui/components/call-lobby";

import { useTRPC } from "@/trpc/client";

interface CallUIProps {
  meetingId: string;
  meetingName: string;
}

export const CallUI = ({ meetingId, meetingName }: CallUIProps) => {
  const call = useCall();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [isAgentAvailable, setIsAgentAvailable] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const checkAgentAvailability = async () => {
      try {
        const freshData = await queryClient.fetchQuery(
          trpc.meetings.checkAgentAvailability.queryOptions(),
        );
        setIsAgentAvailable(freshData.isAvailable);
      } catch (error) {
        console.error("Failed to check agent availability:", error);
        setIsAgentAvailable(false);
      }
    };
    checkAgentAvailability();
  }, [queryClient, trpc.meetings.checkAgentAvailability]);

  const handleJoin = useCallback(async () => {
    if (!call) return;

    try {
      // Check agent availability before allowing user to join
      const freshData = await queryClient.fetchQuery(
        trpc.meetings.checkAgentAvailability.queryOptions(),
      );

      setIsAgentAvailable(freshData.isAvailable);

      if (!freshData.isAvailable) {
        rToast.error(freshData.reason);
        return;
      }

      await call.join();
      setShow("call");
    } catch (error) {
      console.error("Failed to join call:", error);
      rToast.error("Failed to join call");
    }
  }, [call, queryClient, trpc.meetings.checkAgentAvailability]);

  const handleLeave = () => {
    if (!call) return;

    // A meeting includes 2 participants: the current user (host) and the associated AI agent, so when the user leaves, the meeting is also terminated
    call.endCall();

    setShow("ended");
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && (
        <CallLobby
          onJoin={handleJoin}
          meetingId={meetingId}
          meetingName={meetingName}
          isAgentAvailable={isAgentAvailable}
        />
      )}
      {show === "call" && (
        <CallActive meetingName={meetingName} onLeave={handleLeave} />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
