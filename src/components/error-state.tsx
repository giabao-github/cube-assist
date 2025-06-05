"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  description?: string;
  code?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
}

export const ErrorState = ({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  code,
  onRetry,
  retryLabel = "Try again",
  showRetry = true,
}: ErrorStateProps) => {
  return (
    <div
      className="flex items-center justify-center min-h-[400px]"
      role="alert"
      aria-live="polite"
    >
      <Card className="w-full max-w-md duration-500 border-rose-200 bg-rose-50/50 animate-in fade-in-50">
        <CardContent className="flex flex-col items-center py-2 space-y-6 text-center">
          {/* Error Icon with subtle pulse */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-300 opacity-30 animate-ping motion-reduce:animate-none" />
            <div className="absolute inset-0 rounded-full bg-rose-200 opacity-40 animate-pulse motion-reduce:animate-none" />
            <div className="relative p-3 rounded-full bg-rose-100">
              <AlertCircle
                className="w-8 h-8 text-rose-600"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-lg font-semibold text-rose-600">{title}</h3>

          {/* Description */}
          <p className="max-w-sm text-sm leading-relaxed text-rose-500">
            {description}
          </p>

          {/* Error code */}
          {code && (
            <p className="max-w-sm text-sm leading-relaxed text-rose-500">
              Error code: {code}
            </p>
          )}

          {/* Retry Button */}
          {showRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="cursor-pointer select-none group mt-4 border-rose-300 text-rose-500 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-600 active:bg-rose-100 active:border-rose-400 active:text-rose-600 transition-colors hover:shadow-sm active:shadow-sm hover:scale-[1.02] active:scale-[1.02]"
            >
              <RefreshCw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180 group-active:rotate-180" />
              {retryLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
