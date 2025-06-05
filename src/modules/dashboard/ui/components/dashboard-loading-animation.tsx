import { BsRobot } from "react-icons/bs";

const ANIMATION_DURATION = "1s";

export const DashboardLoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center my-auto gap-y-6">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        {/* Rotating arc */}
        <div
          className="absolute inset-0 border-4 rounded-full border-t-custom-500 border-r-custom-500 border-b-transparent border-l-transparent animate-spin"
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
          <BsRobot strokeWidth={0.2} size={20} className="text-custom-500" />
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <div
          className="text-xs font-medium text-custom-600 animate-pulse"
          style={{
            animationDuration: ANIMATION_DURATION,
            letterSpacing: "0.05em",
          }}
        >
          Loading dashboard
        </div>
      </div>
    </div>
  );
};
