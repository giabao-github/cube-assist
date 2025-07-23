"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { TooltipContent } from "@/components/auth/tooltip-content";

import { STRENGTH_LEVELS } from "@/constants/classes";

import { analyzePassword, checkPasswordBreach } from "@/lib/password-utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({
  password,
}: PasswordStrengthIndicatorProps) => {
  const [description, setDescription] = useState("");
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
    return analyzePassword(debouncedPassword);
  }, [debouncedPassword]);

  useEffect(() => {
    const checkPasswordPwned = async () => {
      const result = await checkPasswordBreach(password);
      if (result?.isPwned) {
        setDescription(`Compromised in a data breach (${result.severity})`);
      } else {
        setDescription("");
      }
    };
    checkPasswordPwned();
  }, [password]);

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
    passwordAnalysis.score >= 0
      ? STRENGTH_LEVELS[passwordAnalysis.score]
      : STRENGTH_LEVELS[0];
  const IconComponent = currentLevel.icon;

  if (!password) {
    return <div className="h-16"></div>;
  }

  const tooltipContent = (
    <TooltipContent
      passwordAnalysis={passwordAnalysis}
      strengthLevels={STRENGTH_LEVELS}
      tooltipPosition={tooltipPosition}
      password={debouncedPassword}
      isTyping={isTyping}
      description={description}
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
