import { BsRobot } from "react-icons/bs";

import { LucideLayoutDashboard, VideoIcon } from "lucide-react";

import { cn } from "@/lib/helper/utils";

const ANIMATION_DURATION = "1s";

interface LoadingStateProps {
  loadingText: string;
  type: "dashboard" | "meetings" | "agents" | "call";
}

export const LoadingState = ({ loadingText, type }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center my-auto gap-y-6">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        {/* Rotating arc */}
        <div
          className={cn(
            "absolute inset-0 border-4 rounded-full  border-b-transparent border-l-transparent animate-spin",
            type === "call"
              ? "border-t-white border-r-white"
              : "border-t-custom-500 border-r-custom-500",
          )}
          style={{
            animationDuration: ANIMATION_DURATION,
          }}
        />

        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 rounded-full opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(79, 131, 210, 0.4) 0%, transparent 100%)",
            animationDuration: ANIMATION_DURATION,
          }}
        />

        {/* Center dot */}
        <div
          className="absolute inset-0 flex items-center justify-center animate-pulse"
          style={{
            animationDuration: ANIMATION_DURATION,
          }}
        >
          {type === "dashboard" && (
            <LucideLayoutDashboard
              strokeWidth={2}
              size={20}
              className="text-custom-500"
            />
          )}
          {type === "agents" && (
            <BsRobot strokeWidth={0.2} size={20} className="text-custom-500" />
          )}
          {type === "meetings" && (
            <VideoIcon strokeWidth={2} size={20} className="text-custom-500" />
          )}
          {type === "call" && (
            <VideoIcon strokeWidth={2} size={20} className="text-white" />
          )}
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <div
          className={cn(
            "text-xs font-medium animate-pulse",
            type === "call" ? "text-white" : "text-custom-600",
          )}
          style={{
            animationDuration: ANIMATION_DURATION,
            letterSpacing: "0.05em",
          }}
        >
          {loadingText}
        </div>
      </div>
    </div>
  );
};
