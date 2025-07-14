"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      richColors={true}
      toastOptions={{
        unstyled: true,
        className: `w-96 max-w-md border-2 px-3 py-4 rounded-lg shadow-lg flex gap-2 justify-start items-center`,
        classNames: {
          success: "border border-green-200 bg-green-200",
          error: "border border-red-200 bg-red-200",
          warning: "border border-yellow-200 bg-yellow-200",
          info: "border border-blue-200 bg-blue-200",
          default: "border border-zinc-200 bg-white",
          title: "text-sm font-semibold",
          description: "mt-1 text-xs opacity-70",
          actionButton: "text-sm text-blue-600 hover:underline ml-auto",
          cancelButton: "text-sm text-zinc-500 hover:text-zinc-800",
          closeButton:
            "text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition ml-auto",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
