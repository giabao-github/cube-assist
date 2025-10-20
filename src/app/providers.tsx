"use client";

import { ReactNode } from "react";

import { useMutation } from "@tanstack/react-query";

import { VideoClientProvider } from "@/lib/video-client-provider";

import { useTRPC } from "@/trpc/client";

interface ProvidersProps {
  children: ReactNode;
  session: {
    user: {
      id: string;
      name: string;
      image?: string;
    };
  } | null;
}

export function Providers({ children, session }: ProvidersProps) {
  const trpc = useTRPC();
  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions(),
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
