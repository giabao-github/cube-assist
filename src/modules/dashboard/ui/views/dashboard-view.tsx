"use client";

import { toast } from "sonner";

import { LoadingAnimation } from "@/components/loading-animation";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import HomeView from "@/modules/home/ui/views/home-view";

export const DashboardView = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <LoadingAnimation loadingText="Loading dashboard" />;
  }

  if (!session) {
    return <HomeView />;
  }

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-y-8">
        <Button
          type="button"
          onClick={async () => {
            try {
              await authClient.signOut();
            } catch (error) {
              console.error("Sign out failed:", error);
              toast.error("Sign out failed", {
                description: "Please try again or reload the page",
              });
            }
          }}
          className="cursor-pointer"
        >
          Sign out
        </Button>
      </div>
    </main>
  );
};
