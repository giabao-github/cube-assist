// test

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import zxcvbn from "zxcvbn";

import { TooltipContent } from "@/components/auth/tooltip-content";

// test

// test

const testPassword = (password: string) => {
  if (!password)
    return { score: 0, feedback: { suggestions: [], warning: "" } };

  const score = zxcvbn(password).score;
  const feedback = { suggestions: [] as string[], warning: "" };

  // Generate feedback
  if (password.length < 8)
    feedback.suggestions.push("Use at least 8 characters");
  if (!/[a-z]/.test(password))
    feedback.suggestions.push("Add lowercase letters");
  if (!/[A-Z]/.test(password))
    feedback.suggestions.push("Add uppercase letters");
  if (!/\d/.test(password)) feedback.suggestions.push("Add numbers");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    feedback.suggestions.push("Add special characters");

  if (score <= 0.5) feedback.warning = "This password is very weak";
  else if (score <= 1) feedback.warning = "This password is weak";
  else if (score <= 1.5) feedback.warning = "This password is fair";
  else if (score <= 2) feedback.warning = "This password is good";
  else feedback.warning = "This password is strong";

  return { score, feedback };
};

const strengthLevels = [
  {
    label: "Very Weak",
    color: "bg-gradient-to-r from-red-500 to-red-600",
    textColor: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: AlertTriangle,
    ringColor: "ring-red-200",
  },
  {
    label: "Weak",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: AlertTriangle,
    ringColor: "ring-orange-200",
  },
  {
    label: "Fair",
    color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: Shield,
    ringColor: "ring-yellow-200",
  },
  {
    label: "Good",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Shield,
    ringColor: "ring-blue-200",
  },
  {
    label: "Strong",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    textColor: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: CheckCircle,
    ringColor: "ring-green-200",
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({
  password,
}: PasswordStrengthIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [debouncedPassword, setDebouncedPassword] = useState(password);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPassword(password);
      setIsTyping(false);
    }, 100);

    if (password !== debouncedPassword) {
      setIsTyping(true);
    }

    return () => clearTimeout(timer);
  }, [password, debouncedPassword]);

  const passwordAnalysis = useMemo(() => {
    return testPassword(debouncedPassword);
  }, [debouncedPassword]);

  const updateTooltipPosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const scrollX = window.pageXOffset;
      const scrollY = window.pageYOffset;
      setTooltipPosition({
        top: rect.top + scrollY + rect.height / 2,
        left: rect.right + scrollX + 20,
      });
    }
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const currentLevel =
    strengthLevels[passwordAnalysis.score] || strengthLevels[0];
  const IconComponent = currentLevel.icon;

  if (!password) {
    return <div className="h-16"></div>;
  }

  const tooltipContent = (
    <TooltipContent
      passwordAnalysis={passwordAnalysis}
      strengthLevels={strengthLevels}
      tooltipPosition={tooltipPosition}
      password={debouncedPassword}
      isTyping={isTyping}
    />
  );

  return (
    <div className="h-16 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">
          Password Strength
        </span>
        <div
          className="relative"
          ref={badgeRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 cursor-help shadow-lg hover:shadow-xl hover:scale-105 border ${currentLevel.bgColor} ${currentLevel.textColor}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            {currentLevel.label}
          </div>
          {/* Portal tooltip to avoid overflow issues */}
          {showTooltip &&
            typeof document !== "undefined" &&
            createPortal(tooltipContent, document.body)}
        </div>
      </div>

      <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full shadow-inner">
        <div className="flex h-full gap-0.5">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`flex-1 transition-all duration-700 ease-out rounded-sm ${
                index <= passwordAnalysis.score ||
                (index === 0 && passwordAnalysis.score === 0)
                  ? currentLevel.color + " shadow-sm"
                  : "bg-gray-300"
              }`}
              style={{
                transform:
                  index <= passwordAnalysis.score ||
                  (index === 0 && passwordAnalysis.score === 0)
                    ? "scaleY(1)"
                    : "scaleY(0.4)",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
