import { useMemo } from "react";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants/pagination";

// Create a parser that validates both lower and upper bounds
const createPageParser = (totalPages?: number) => {
  const baseParser = parseAsInteger.withDefault(DEFAULT_PAGE);
  return {
    ...baseParser,
    parse: (value: string | null) => {
      let parsed = baseParser.parse(value ?? "");
      parsed = Math.max(1, parsed || 1);
      if (typeof totalPages === "number" && totalPages >= 1) {
        parsed = Math.min(parsed, totalPages);
      }
      return parsed;
    },
    serialize: (value: number) => {
      const safe = Math.max(1, value || DEFAULT_PAGE);
      const hasTotal = typeof totalPages === "number" && totalPages >= 1;
      const upper = hasTotal ? Math.min(safe, totalPages as number) : safe;
      return String(upper);
    },
  };
};

interface UseMeetingsFiltersProps {
  totalPages?: number;
}

export const useMeetingsFilters = ({
  totalPages,
}: UseMeetingsFiltersProps = {}) => {
  const pageParser = useMemo(() => createPageParser(totalPages), [totalPages]);

  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: pageParser,
    },
    {
      history: "replace",
      shallow: false,
    },
  );
};
