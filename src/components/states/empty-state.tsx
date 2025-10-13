"use client";

import Image from "next/image";

interface EmptyStateProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const EmptyState = ({
  title = "No data available",
  description = "There is nothing to show here.",
  imageSrc = "/empty.svg",
  imageAlt = "Empty",
}: EmptyStateProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <Image src={imageSrc} alt={imageAlt} width={400} height={300} />
      <div className="flex flex-col max-w-lg mx-auto text-center gap-y-6">
        <h6 className="text-lg font-medium md:text-xl">{title}</h6>
        <p className="text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};
