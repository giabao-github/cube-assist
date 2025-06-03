"use client";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import HomeView from "@/modules/home/ui/views/home-view";

export const DashboardView = () => {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <HomeView />;
  }

  return (
    <div className="max-w-full">
      <div className="flex flex-col items-center justify-center w-1/3 p-4 mx-auto my-4 gap-y-8">
        <p className="text-xl font-semibold">Hello, {session.user.name}!</p>
        <Button onClick={() => authClient.signOut()} className="cursor-pointer">
          Sign out
        </Button>
      </div>
    </div>
  );
};
