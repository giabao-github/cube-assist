import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useMeetingsFilters } from "@/modules/agents/hooks/use-meetings-filters";

export const MeetingsSearchFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();

  return (
    <div className="relative">
      <Input
        placeholder="Filter by name"
        className="h-10 bg-white w-[240px] pl-9"
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      <SearchIcon className="absolute -translate-y-1/2 size-4 left-3 top-1/2 text-muted-foreground" />
    </div>
  );
};
