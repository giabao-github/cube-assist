"use client";

import { useState } from "react";

import { FilterXIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DEFAULT_PAGE } from "@/constants/pagination";

import { useAgentsFilters } from "@/modules/agents/hooks/use-agents-filters";
import { AgentsSearchFilter } from "@/modules/agents/ui/components/agents-search-filter";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";

export const AgentsListHeader = () => {
  const [filters, setFilters] = useAgentsFilters();
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
      <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="flex flex-col p-4 gap-y-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-semibold">My Agents</h5>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="font-semibold"
          >
            <PlusIcon strokeWidth={3} aria-hidden="true" />
            New Agent
          </Button>
        </div>
        <div className="flex items-center p-1 gap-x-3">
          <AgentsSearchFilter />
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
