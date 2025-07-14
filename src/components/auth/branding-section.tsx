"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { lexend } from "@/config/fonts";

import { cn } from "@/lib/utils";

interface BrandingSectionProps {
  type: "login" | "register" | "recovery";
}
export const BrandingSection = ({ type }: BrandingSectionProps) => {
  const router = useRouter();
  // Decorative star configuration
  const starElements = [
    // Bright stars
    { className: "top-8 left-8 w-2 h-2 bg-white", delay: 0 },
    { className: "right-6 bottom-12 w-2 h-2 bg-white/80", delay: 1000 },
    { className: "left-6 top-1/2 w-2.5 h-2.5 bg-white", delay: 500 },
    { className: "right-16 top-1/3 w-2 h-2 bg-white/90", delay: 1500 },
    { className: "left-20 bottom-1/3 w-2 h-2 bg-white/70", delay: 750 },
    // Medium brightness stars
    { className: "right-12 top-16 w-1.5 h-1.5 bg-white/60", delay: 300 },
    { className: "left-16 bottom-20 w-1.5 h-1.5 bg-white/50", delay: 1200 },
    { className: "bottom-8 right-20 w-1.5 h-1.5 bg-white/40", delay: 800 },
    { className: "left-12 top-24 w-1.5 h-1.5 bg-white/55", delay: 1600 },
    // Faint distant stars
    { className: "top-12 right-1/4 w-1 h-1 bg-white/30", delay: 300 },
    { className: "bottom-16 left-1/3 w-1 h-1 bg-white/25", delay: 700 },
    { className: "top-1/3 right-1/3 w-1 h-1 bg-white/35", delay: 1100 },
    { className: "top-2/3 left-1/4 w-1 h-1 bg-white/20", delay: 900 },
    // Additional stars
    { className: "top-6 right-1/2 w-1 h-1 bg-white/25", delay: 1300 },
    { className: "bottom-1/4 right-1/6 w-1 h-1 bg-white/20", delay: 600 },
    { className: "top-3/4 left-1/6 w-1 h-1 bg-white/30", delay: 1000 },
    { className: "top-1/4 left-1/2 w-1 h-1 bg-white/15", delay: 1400 },
    { className: "right-1/3 bottom-1/3 w-1 h-1 bg-white/18", delay: 1100 },
    // Very faint background stars
    { className: "top-10 left-16 w-1 h-1 bg-white/10", delay: 1800 },
    { className: "bottom-6 right-16 w-1 h-1 bg-white/12", delay: 1200 },
    { className: "top-2/3 right-1/6 w-1 h-1 bg-white/8", delay: 900 },
    { className: "left-1/3 top-1/6 w-1 h-1 bg-white/15", delay: 1500 },
  ];

  return (
    <>
      <div
        className={cn(
          "hidden relative flex-col gap-y-6 justify-center items-center bg-radial from-sidebar-accent to-sidebar md:flex",
          type === "login" ? "col-span-3" : "col-span-4",
        )}
      >
        <div className="flex relative z-10 flex-col gap-4 items-center select-none">
          <div
            onClick={() => router.push("/")}
            className="relative cursor-pointer group"
          >
            <Image
              src="/logo.svg"
              alt="Cube Assist Logo"
              priority
              width={144}
              height={144}
              className="w-36 h-36 drop-shadow-2xl transition-transform duration-300 select-none"
            />
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-3xl font-bold tracking-wide drop-shadow-lg text-secondary",
                lexend.className,
              )}
            >
              Cube Assist
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        {starElements.map((star, index) => (
          <div
            key={index}
            className={`absolute animate-pulse ${star.className}`}
            style={{
              animationDelay: `${star.delay}ms`,
              clipPath:
                "polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)",
            }}
          />
        ))}
        {/* Subtle cosmic background glow */}
        <div className="absolute right-6 top-1/3 w-12 h-12 rounded-full blur-md animate-pulse bg-white/5 delay-2000"></div>
        <div className="absolute left-8 bottom-1/3 w-8 h-8 rounded-full blur-sm animate-pulse bg-white/4 delay-1800"></div>
        {/* Very subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent pointer-events-none via-white/2"></div>
      </div>
    </>
  );
};
