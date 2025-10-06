"use client";

import { toast } from "sonner";

import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";

import HomeView from "@/modules/home/ui/views/home-view";

export const DashboardView = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <LoadingState loadingText="Loading dashboard" type="dashboard" />;
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
        >
          Sign out
        </Button>
      </div>
    </main>
  );
};
