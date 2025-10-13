import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CommandSelect } from "@/components/utils/command-select";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { useTRPC } from "@/trpc/client";

import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();

  const trpc = useTRPC();

  const [agentSearch, setAgentSearch] = useState("");
  const { data } = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100, // current limit, will be updated when the agent count exceeds 100 pages
      search: agentSearch,
    }),
  );

  return (
    <CommandSelect
      className="h-10 font-medium text-gray-600"
      placeholder="Agent"
      options={(data?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        children: (
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="size-4"
            />
            {agent.name}
          </div>
        ),
      }))}
      onSelect={(value) => setFilters({ agentId: value })}
      onSearch={setAgentSearch}
      value={filters.agentId ?? ""}
    />
  );
};
