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
      <Image src={imageSrc} alt={imageAlt} width={360} height={280} />
      <div className="flex flex-col max-w-lg pt-8 pb-2 mx-auto text-center gap-y-6">
        <h6 className="text-lg font-medium md:text-xl">{title}</h6>
        <p className="text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};
