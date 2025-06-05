import { ChevronDownIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export const DUBSkeleton = () => {
  return (
    <div className="flex items-center justify-between w-full px-2 py-3 space-x-2 overflow-hidden border rounded-lg border-border/10 bg-white/10">
      {/* User Avatar Skeleton */}
      <Skeleton className="w-8 h-8 rounded-full" />

      {/* User Info Skeleton */}
      <div className="flex flex-col gap-1.5 text-left overflow-hidden flex-1 min-w-0">
        <Skeleton className="w-1/2 h-4 rounded-full" />
        <Skeleton className="w-full h-3 rounded-full" />
      </div>

      {/* Chevron Icon */}
      <ChevronDownIcon strokeWidth={3} className="size-5 shrink-0" />
    </div>
  );
};
