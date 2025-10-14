import { BanIcon, VideoIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";

interface UpcomingStateProps {
  meetingId: string;
  onCancelMeeting: () => void;
  isCancelling: boolean;
}

export const UpcomingState = ({
  meetingId,
  onCancelMeeting,
  isCancelling,
}: UpcomingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 bg-white rounded-lg gap-y-8">
      <EmptyState
        imageSrc="/upcoming.svg"
        title="This meeting is not started yet"
        description="Once you start this meeting, a summary will appear hear"
      />
      <div className="flex flex-col-reverse items-center w-full gap-4 lg:flex-row lg:justify-center">
        <Button
          variant="secondary"
          disabled={isCancelling}
          className="w-full lg:w-auto hover:ring-1 hover:ring-neutral-300"
          onClick={onCancelMeeting}
        >
          <BanIcon />
          Cancel meeting
        </Button>
        <Button asChild disabled={isCancelling} className="w-full lg:w-auto">
          <Link href={`/dashboard/call/${meetingId}`}>
            <VideoIcon />
            Start meeting
          </Link>
        </Button>
      </div>
    </div>
  );
};
