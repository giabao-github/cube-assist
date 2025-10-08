"use client";

import { useState } from "react";

import { FilterXIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DEFAULT_PAGE } from "@/constants/pagination";

import { useMeetingsFilters } from "@/modules/meetings/hooks/use-meetings-filters";
import { MeetingsSearchFilter } from "@/modules/meetings/ui/components/meetings-search-filter";
import { NewMeetingsDialog } from "@/modules/meetings/ui/components/new-meeting-dialog";

export const MeetingsListHeader = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <NewMeetingsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="flex flex-col p-4 gap-y-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-semibold">My Meetings</h5>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="font-semibold"
          >
            <PlusIcon strokeWidth={3} aria-hidden="true" />
            New Meeting
          </Button>
        </div>
        <div className="flex items-center p-1 gap-x-3">
          <MeetingsSearchFilter />
          {isAnyFilterModified && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <FilterXIcon />
              Clear
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
