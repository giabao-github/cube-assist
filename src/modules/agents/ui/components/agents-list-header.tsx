"use client";

import { useState } from "react";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";

export const AgentsListHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="flex flex-col gap-y-4 p-4 md:px-8">
        <div className="flex justify-between items-center">
          <h5 className="text-xl font-semibold">My Agents</h5>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="font-semibold"
          >
            <PlusIcon strokeWidth={3} aria-hidden="true" />
            New Agent
          </Button>
        </div>
      </div>
    </>
  );
};
