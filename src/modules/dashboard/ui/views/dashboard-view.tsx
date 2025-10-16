"use client";

import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth/auth-client";
import { rToast } from "@/lib/toast-utils";

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
              rToast.error("Sign out failed", {
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
