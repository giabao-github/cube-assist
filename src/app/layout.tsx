import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});

const montserrat = Montserrat({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-montserrat",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.className} ${montserrat.variable} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
