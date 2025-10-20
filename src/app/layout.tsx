import type { Metadata } from "next";
import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next";

import { Toaster } from "@/components/ui/sonner";

import { poppins } from "@/config/fonts";

import { auth } from "@/lib/auth/auth";

import { Providers } from "@/app/providers";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cube Assist - your smart SaaS AI agent",
  description:
    "Cube Assist is an intelligent AI agent built to enhance your SaaS platform. Whether it's streamlining workflows, automating tasks, or delivering actionable insights, Cube Assist empowers teams to work smarter and faster — all within an intuitive web interface designed for seamless integration and maximum productivity.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const transformedSession = session
    ? {
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image ?? undefined,
        },
      }
    : null;

  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <NuqsAdapter>
          <TRPCReactProvider>
            <Toaster />
            <Providers session={transformedSession}>{children}</Providers>
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
