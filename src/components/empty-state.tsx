"use client";

import Image from "next/image";

interface EmptyStateProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const EmptyState = ({
  title = "Create your first agent",
  description = "Create an agent to join a meeting. Each agent will follow your instructions and can interact with participants during the call.",
  imageSrc = "/empty.svg",
  imageAlt = "Empty",
}: EmptyStateProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center"
      role="alert"
      aria-live="polite"
    >
      <Image src={imageSrc} alt={imageAlt} width={240} height={240} />
      <div className="flex flex-col max-w-md mx-auto text-center gap-y-6">
        <h6 className="text-lg font-medium">{title}</h6>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
