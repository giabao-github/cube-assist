"use client";

import { useState } from "react";

import { StreamTheme, useCall } from "@stream-io/video-react-sdk";

import { rToast } from "@/lib/toast-utils";

import { CallActive } from "@/modules/call/ui/components/call-active";
import { CallEnded } from "@/modules/call/ui/components/call-ended";
import { CallLobby } from "@/modules/call/ui/components/call-lobby";

interface CallUIProps {
  meetingId: string;
  meetingName: string;
}

export const CallUI = ({ meetingId, meetingName }: CallUIProps) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  const handleJoin = async () => {
    if (!call) return;

    try {
      await call.join();
      setShow("call");
    } catch (error) {
      console.error("Failed to join call:", error);
      rToast.error("Failed to join call");
    }
  };

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
        />
      )}
      {show === "call" && (
        <CallActive meetingName={meetingName} onLeave={handleLeave} />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
