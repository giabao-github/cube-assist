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
  imageAlt = "Empty data illustration",
}: EmptyStateProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center"
      aria-live="polite"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={360}
        height={293}
        className="max-w-[360px] w-full h-auto"
        sizes="(max-width: 360px) 100vw, 360px"
      />
      <div className="flex flex-col max-w-lg pb-2 mx-auto text-center gap-y-6">
        <h6 className="text-lg font-medium md:text-xl">{title}</h6>
        <p className="text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};
