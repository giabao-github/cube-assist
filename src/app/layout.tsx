import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});

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
    <TRPCReactProvider>
      <html lang="en">
        <body className={`${poppins.className} antialiased`}>
          <Toaster />
          {children}
        </body>
      </html>
    </TRPCReactProvider>
  );
}
