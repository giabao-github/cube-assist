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
  const generateStarElements = () => {
    const starConfigs = [
      // Bright stars
      {
        size: "w-2 h-2",
        opacity: "bg-white",
        positions: [
          "top-8 left-8",
          "right-6 bottom-12",
          "left-6 top-1/2",
          "right-16 top-1/3",
          "left-20 bottom-1/3",
        ],
      },
      // Medium brightness stars
      {
        size: "w-1.5 h-1.5",
        opacity: "bg-white/60",
        positions: [
          "right-12 top-16",
          "left-16 bottom-20",
          "bottom-8 right-20",
          "left-12 top-24",
        ],
      },
      // Faint distant stars
      {
        size: "w-1 h-1",
        opacity: "bg-white/30",
        positions: [
          "top-12 right-1/4",
          "bottom-16 left-1/3",
          "top-1/3 right-1/3",
          "top-2/3 left-1/4",
          "top-6 right-1/2",
          "bottom-1/4 right-1/6",
          "top-3/4 left-1/6",
          "top-1/4 left-1/2",
          "right-1/3 bottom-1/3",
          "top-10 left-16",
          "bottom-6 right-16",
          "top-2/3 right-1/6",
          "left-1/3 top-1/6",
        ],
      },
    ];

    return starConfigs.flatMap((config, groupIndex) =>
      config.positions.map((position, index) => ({
        className: `${position} ${config.size} ${config.opacity}`,
        delay: groupIndex * 500 + index * 300,
      })),
    );
  };
  const starElements = generateStarElements();

  return (
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
  );
};
