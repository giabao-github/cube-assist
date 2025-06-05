"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import { DashboardLoadingAnimation } from "@/modules/dashboard/ui/components/dashboard-loading-animation";
import HomeView from "@/modules/home/ui/views/home-view";
import { useTRPC } from "@/trpc/client";

export const DashboardView = () => {
  const trpc = useTRPC();
  const { data: session, isPending } = authClient.useSession();
  const { data, error, isError } = useQuery({
    ...trpc.hello.queryOptions({ text: session?.user.name || "" }),
    enabled: !isPending && !!session,
  });

  if (isPending) {
    return <DashboardLoadingAnimation />;
  }

  if (!session) {
    return <HomeView />;
  }

  if (isError) {
    return (
      <main className="flex items-center justify-center p-4 my-auto">
        <div className="text-center">
          <p className="text-rose-500">Failed to load message</p>
          <p className="text-sm text-gray-500">{error?.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center p-4 my-auto">
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-y-8">
        <h1 className="text-xl font-semibold text-center">
          {data?.greeting || `Hello, ${session.user.name}!`}
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
