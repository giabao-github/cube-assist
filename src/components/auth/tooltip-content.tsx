import { ForwardRefExoticComponent, RefAttributes } from "react";

import { CheckCircle, LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

interface TooltipContentProps {
  passwordAnalysis: {
    score: number;
    feedback: {
      suggestions: string[];
      warning: string;
    };
  };
  strengthLevels: {
    label: string;
    color: string;
    textColor: string;
    bgColor: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    ringColor: string;
  }[];
  tooltipPosition: { top: number; left: number };
  password: string;
  isTyping: boolean;
}

export const TooltipContent = ({
  passwordAnalysis,
  strengthLevels,
  tooltipPosition,
  password,
  isTyping,
}: TooltipContentProps) => {
  const currentLevel =
    strengthLevels[passwordAnalysis.score] || strengthLevels[0];
  const IconComponent = currentLevel.icon;

  return (
    <div
      className="fixed z-50 p-4 bg-white border border-gray-200 rounded-lg shadow-2xl w-80 backdrop-blur-sm"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: "translateY(-50%)",
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border ${currentLevel.bgColor}`}
        >
          <div
            className={`p-1.5 rounded-full bg-white shadow-sm ring-2 ${currentLevel.ringColor}`}
          >
            <IconComponent className={cn("w-4 h-4", currentLevel.textColor)} />
          </div>
          <div>
            <span
              className={cn("font-semibold text-sm", currentLevel.textColor)}
            >
              {currentLevel.label} Password
            </span>
            <p className="mt-0.5 text-xs text-gray-600">
              {passwordAnalysis.score === 4
                ? "Excellent security!"
                : "Keep improving your password"}
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div
          className={`transition-all duration-300 ${isTyping ? "opacity-50" : "opacity-100"}`}
        >
          {passwordAnalysis.feedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Suggestions to improve
              </p>
              <ul className="space-y-1.5">
                {passwordAnalysis.feedback.suggestions.map(
                  (suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-1 h-1 mt-1.5 bg-gray-400 rounded-full" />
                      <span className="text-xs text-gray-700">
                        {suggestion}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Security Requirements
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                label: "At least 8 characters",
                test: password.length >= 8,
              },
              {
                label: "Uppercase letters (A-Z)",
                test: /[A-Z]/.test(password),
              },
              {
                label: "Lowercase letters (a-z)",
                test: /[a-z]/.test(password),
              },
              { label: "Numbers (0-9)", test: /\d/.test(password) },
              {
                label: "Special characters (!@#$...)",
                test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
              },
              {
                label: "12+ characters (recommended)",
                test: password.length >= 12,
              },
            ].map((req, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-1.5 rounded-md transition-all duration-300 ${
                  req.test
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                    req.test ? "bg-green-500 shadow-sm" : "bg-gray-300"
                  }`}
                >
                  {req.test && <CheckCircle className="w-2 h-2 text-white" />}
                </div>
                <span
                  className={`text-xs font-medium ${req.test ? "text-green-700" : "text-gray-600"}`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
