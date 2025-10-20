"use client";

import { useEffect, useState } from "react";

import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { LoadingState } from "@/components/states/loading-state";

import { useVideoClient } from "@/lib/video-client-provider";

import { CallUI } from "@/modules/call/ui/components/call-ui";

interface CallConnectProps {
  meetingId: string;
  meetingName: string;
}

export const CallConnect = ({ meetingId, meetingName }: CallConnectProps) => {
  const { client, isLoading } = useVideoClient();
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    if (!client) return;

    const _call = client.call("default", meetingId);
    _call.camera.disable();
    _call.microphone.disable();
    setCall(_call);

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave();
        setCall(undefined);
      }
    };
  }, [client, meetingId]);

  useEffect(() => {
    if (!client) return;

    const _call = client.call("default", meetingId);
    _call.camera.disable();
    _call.microphone.disable();
    setCall(_call);

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave();
        _call.endCall();
        setCall(undefined);
      }
    };
  }, [client, meetingId]);

  if (isLoading || !client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-radial from-sidebar-accent to-sidebar">
        <LoadingState type="call" loadingText="Loading video call" />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI meetingId={meetingId} meetingName={meetingName} />
      </StreamCall>
    </StreamVideo>
  );
};
