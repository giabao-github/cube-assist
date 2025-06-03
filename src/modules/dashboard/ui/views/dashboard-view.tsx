"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import HomeView from "@/modules/home/ui/views/home-view";

export const DashboardView = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return <HomeView />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto gap-y-8">
        <h1 className="text-xl font-semibold text-center">
          Hello, {session.user.name}!
        </h1>
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
