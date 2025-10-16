import Link from "next/link";

import { Button } from "@/components/ui/button";

export const CallEnded = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="flex items-center justify-center flex-1 px-8 py-4">
        <div className="flex flex-col items-center justify-center p-10 rounded-lg shadow-sm gap-y-6 bg-background">
          <div className="flex flex-col text-center gap-y-4">
            <h6 className="text-base font-medium">Call Ended</h6>
            <p className="text-sm">
              The call summary will appear in a few minutes.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/meetings">Back to meetings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
