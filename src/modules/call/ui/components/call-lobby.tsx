import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  VideoPreview,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { LogInIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth/auth-client";
import { generateAvatarUri } from "@/lib/avatar";

const DisabledVideoPreview = () => {
  const { data } = authClient.useSession();

  return (
    <DefaultVideoPlaceholder
      participant={
        {
          name: data?.user.name ?? "",
          image:
            data?.user.image ??
            generateAvatarUri({
              seed: data?.user.name ?? "",
              variant: "initials",
            }),
        } satisfies Partial<StreamVideoParticipant> as StreamVideoParticipant
      }
    />
  );
};

const AllowBrowserPermissions = () => {
  return (
    <p className="text-sm">
      Please grant your browser a permission to access your camera or
      microphone.
    </p>
  );
};

interface CallLobbyProps {
  meetingId: string;
  meetingName: string;
  onJoin: () => void;
}

export const CallLobby = ({
  meetingId,
  meetingName,
  onJoin,
}: CallLobbyProps) => {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasCameraPermission } = useCameraState();
  const { hasBrowserPermission: hasMicrophonePermission } =
    useMicrophoneState();
  const hasMediaPermission = hasCameraPermission && hasMicrophonePermission;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="flex items-center justify-center flex-1 px-8 py-4">
        <div className="flex flex-col items-center justify-center p-10 rounded-lg shadow-sm gap-y-6 bg-background">
          <div className="flex flex-col text-center gap-y-4">
            <h2 className="text-2xl font-semibold text-orange-500">
              {meetingName}
            </h2>
            <h6 className="text-base font-medium">Ready to join?</h6>
            <p className="text-sm">Set up your call settings before joining</p>
          </div>
          <VideoPreview
            DisabledVideoPreview={
              hasMediaPermission
                ? DisabledVideoPreview
                : AllowBrowserPermissions
            }
          />
          <div className="flex gap-x-4">
            <ToggleAudioPreviewButton />
            <ToggleVideoPreviewButton />
          </div>
          <div className="flex justify-between w-full gap-x-4">
            <Button
              asChild
              variant="ghost"
              className="border-1 border-neutral-200 hover:ring-1 hover:ring-neutral-300"
            >
              <Link href={`/dashboard/meetings/${meetingId}`}>Cancel</Link>
            </Button>
            <Button onClick={onJoin}>
              <LogInIcon />
              Join Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
