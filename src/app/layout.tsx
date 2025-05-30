import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cube Assist — your smart SaaS AI agent",
  description: "Cube Assist is an intelligent AI agent built to enhance your SaaS platform. Whether it’s streamlining workflows, automating tasks, or delivering actionable insights, Cube Assist empowers teams to work smarter and faster — all within an intuitive web interface designed for seamless integration and maximum productivity.",
};

/**
 * Defines the root layout for the application, applying global fonts and rendering the main content.
 *
 * Wraps all pages with the configured Geist fonts, sets the language to English, and includes a notification toaster.
 *
 * @param children - The content to be rendered within the layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
