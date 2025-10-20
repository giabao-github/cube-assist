"use client";

import { ReactNode, useCallback } from "react";

import { useMutation } from "@tanstack/react-query";

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

  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions(),
  );

  const tokenProviderCb = useCallback(async () => {
    try {
      return await generateToken();
    } catch (error) {
      console.error("Failed to generate video token:", error);
      throw error;
    }
  }, [generateToken]);

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <VideoClientProvider
      userId={session.user.id}
      userName={session.user.name}
      userImage={session.user.image}
      tokenProvider={tokenProviderCb}
    >
      {children}
    </VideoClientProvider>
  );
}
