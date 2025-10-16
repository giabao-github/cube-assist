"use client";

import { AlertCircleIcon, MoveLeftIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  description?: string;
  code?: string;
  onRetry?: () => void;
  onAction?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  actionLabel?: string;
  showAction?: boolean;
}

const errorButtonClassName =
  "mt-4 transition-colors select-none group border-rose-300 text-rose-500 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-600 active:bg-rose-100 active:border-rose-400 active:text-rose-600 hover:shadow-sm active:shadow-sm";

interface ErrorButtonProps {
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconClassName?: string;
}

const ErrorButton = ({
  onClick,
  icon: Icon,
  label,
  iconClassName,
}: ErrorButtonProps) => (
  <Button onClick={onClick} variant="outline" className={errorButtonClassName}>
    <Icon className={iconClassName} />
    {label}
  </Button>
);

export const ErrorState = ({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  code,
  onRetry,
  onAction,
  retryLabel = "Try again",
  actionLabel = "Go back",
  showRetry = false,
  showAction = false,
}: ErrorStateProps) => {
  return (
    <div
      className="flex items-center justify-center min-h-[400px]"
      role="alert"
      aria-live="polite"
    >
      <Card className="w-full duration-500 bg-white min-w-sm border-rose-200 animate-in fade-in-50">
        <CardContent className="flex flex-col items-center py-2 space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-300 opacity-30 animate-ping motion-reduce:animate-none" />
            <div className="absolute inset-0 rounded-full bg-rose-200 opacity-40 animate-pulse motion-reduce:animate-none" />
            <div className="relative p-3 rounded-full bg-rose-100">
              <AlertCircleIcon
                className="w-8 h-8 text-rose-600"
                aria-hidden="true"
              />
            </div>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-rose-600">{title}</h3>

          <p className="max-w-sm text-sm leading-relaxed text-rose-500">
            {description}
          </p>

          {code && (
            <p className="max-w-sm text-sm leading-relaxed text-rose-500">
              Error code: {code}
            </p>
          )}

          {showRetry && (
            <ErrorButton
              onClick={onRetry}
              icon={RefreshCwIcon}
              label={retryLabel}
              iconClassName="w-4 h-4 transition-transform group-hover:rotate-180 group-active:rotate-180"
            />
          )}

          {showAction && (
            <ErrorButton
              onClick={onAction}
              icon={MoveLeftIcon}
              label={actionLabel}
              iconClassName="w-4 h-4 transition-transform group-hover:-translate-x-1 group-active:-translate-x-1"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
