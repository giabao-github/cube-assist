import { useState } from "react";

import { StreamTheme, useCall } from "@stream-io/video-react-sdk";

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

    await call.join();

    setShow("call");
  };

  const handleLeave = () => {
    if (!call) return;

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
