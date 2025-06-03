import { FC, ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  variant?: "primary" | "secondary" | "outline" | "cta";
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  variant = "primary",
  onClick,
  children,
  className = "",
}) => {
  const baseClasses =
    "rounded-full font-semibold transition-colors transform hover:scale-[102%] active:scale-[102%] cursor-pointer";
  const variants = {
    primary:
      "bg-custom-600 hover:bg-custom-700 active:bg-custom-700/85 text-white",
    secondary:
      "bg-custom-100 hover:bg-custom-200/60 active:bg-custom-200 text-custom-600 border border-custom-200",
    outline:
      "bg-white/10 hover:bg-white/20 active:bg-white/30 border-2 border-white text-white backdrop-blur-sm",
    cta: "bg-white hover:bg-gray-100 active:bg-gray-200 text-custom-600 hover:text-custom-700",
  };

  return (
    <Button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
