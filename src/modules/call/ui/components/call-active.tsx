import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useConfirm } from "@/hooks/use-confirm";

interface CallActiveProps {
  meetingName: string;
  onLeave: () => void;
}

export const CallActive = ({ meetingName, onLeave }: CallActiveProps) => {
  const router = useRouter();
  const [NavigateConfirmation, confirmNavigate] = useConfirm(
    "Leave the call?",
    "Are you sure you want to leave this call and return to dashboard? You can rejoin the call later.",
    "Leave Call",
    true,
  );

  const handleNavigate = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = await confirmNavigate();
    if (confirmed) {
      onLeave();
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col justify-between h-full p-4 text-white">
      <NavigateConfirmation />
      <div className="flex items-center gap-4 px-4 py-1 mb-4 rounded-full md:mb-0 md:py-2 bg-amber-200 w-fit">
        <Link
          href="/dashboard"
          onClick={handleNavigate}
          className="flex items-center justify-center p-1 rounded-full bg-white/10 w-fit"
        >
          <Image
            title="Back to dashboard"
            src="/logo.svg"
            alt="Logo"
            width={30}
            height={30}
            className="hover:animate-pulse"
          />
        </Link>
        <h4 className="pr-1 text-base font-medium text-custom-500">
          {meetingName}
        </h4>
      </div>
      <SpeakerLayout />
      <div className="px-4 bg-black rounded-full">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
