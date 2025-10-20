"use client";

import { ReactNode } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rToast } from "@/lib/toast-utils";
import { VideoClientProvider } from "@/lib/video-client-provider";

import { useTRPC } from "@/trpc/client";

interface ProvidersProps {
  children: ReactNode;
  session: {
    user: {
      id: string;
      name: string;
      image?: string | undefined;
    };
  } | null;
}

export function Providers({ children, session }: ProvidersProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );
      },
      onError: (error) => {
        rToast.error(error.message);
      },
    }),
  );

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <VideoClientProvider
      userId={session.user.id}
      userName={session.user.name}
      userImage={session.user.image}
      tokenProvider={generateToken}
    >
      {children}
    </VideoClientProvider>
  );
}
