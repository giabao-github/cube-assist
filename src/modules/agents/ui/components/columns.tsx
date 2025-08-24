"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CornerDownRightIcon, VideoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { AgentGetOne } from "@/modules/agents/types";

export const columns: ColumnDef<AgentGetOne>[] = [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={row.original.name}
            className="size-7"
          />
          <span className="font-semibold capitalize" title={row.original.name}>
            {row.original.name}
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <CornerDownRightIcon className="size-4 text-muted-foreground" />
          <span
            className="text-sm text-muted-foreground max-w-[300px] truncate capitalize"
            title={row.original.instructions}
          >
            {row.original.instructions}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "meetingCount",
    header: "Meetings",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex items-center gap-x-2 [&>svg]:size-4"
      >
        <VideoIcon className="text-blue-700" />
        <p className="text-blue-700">
          {row.original.meetingCount}{" "}
          {row.original.meetingCount === 1 ? "meeting" : "meetings"}
        </p>
      </Badge>
    ),
  },
];
