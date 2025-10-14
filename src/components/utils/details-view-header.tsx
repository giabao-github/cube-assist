import {
  ChevronRightIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DetailsViewHeaderProps {
  entityType: "agents" | "meetings";
  entityId: string;
  entityName: string;
  onEdit: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}

export const DetailsViewHeader = ({
  entityType,
  entityId,
  entityName,
  onEdit,
  onRemove,
  isRemoving,
}: DetailsViewHeaderProps) => {
  const listLabel = entityType === "agents" ? "My Agents" : "My Meetings";
  const editLabel = entityType === "agents" ? "Edit agent" : "Edit meeting";
  const deleteLabel =
    entityType === "agents" ? "Delete agent" : "Delete meeting";

  return (
    <div className="flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="text-xl font-medium">
              <Link href={`/dashboard/${entityType}`}>{listLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-xl font-medium text-foreground [&>svg]:size-4">
            <ChevronRightIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="text-xl font-medium text-foreground"
            >
              <Link href={`/dashboard/${entityType}/${entityId}`}>
                {entityName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" aria-label="Open actions menu">
            <MoreVerticalIcon aria-hidden="true" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onEdit}
            className="cursor-pointer"
            aria-label={editLabel}
          >
            <PencilIcon className="mr-1 text-black size-4" aria-hidden="true" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onRemove}
            disabled={isRemoving}
            className="cursor-pointer"
            aria-label={deleteLabel}
          >
            <TrashIcon
              className="mr-1 text-rose-500 size-4"
              aria-hidden="true"
            />
            <span className="text-rose-500">
              {isRemoving ? "Deleting..." : "Delete"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
