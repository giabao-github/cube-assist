import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next";

import { Toaster } from "@/components/ui/sonner";

import { poppins } from "@/config/fonts";

import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cube Assist - your smart SaaS AI agent",
  description:
    "Cube Assist is an intelligent AI agent built to enhance your SaaS platform. Whether it's streamlining workflows, automating tasks, or delivering actionable insights, Cube Assist empowers teams to work smarter and faster — all within an intuitive web interface designed for seamless integration and maximum productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <html lang="en">
          <body className={`${poppins.className} antialiased`}>
            <Toaster />
            {children}
          </body>
        </html>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
