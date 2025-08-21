import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants/pagination";

// Create a parser that validates both lower and upper bounds
const createPageParser = (totalPages?: number) => {
  const baseParser = parseAsInteger.withDefault(DEFAULT_PAGE);
  return {
    ...baseParser,
    parse: (value: string | string[] | undefined) => {
      if (!value || Array.isArray(value)) return DEFAULT_PAGE;
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed < 1) return DEFAULT_PAGE;
      if (totalPages && parsed > totalPages) return totalPages;
      return parsed;
    },
    serialize: (value: number | null | undefined) => {
      if (!value || isNaN(value) || value < 1) return DEFAULT_PAGE;
      if (totalPages && value > totalPages) return totalPages.toString();
      return value.toString();
    },
    withDefault: (defaultValue: number) => ({
      ...baseParser,
      defaultValue,
      parseServerSide: () => defaultValue,
    }),
  };
};

interface UseAgentsFiltersProps {
  totalPages?: number;
}

export const useAgentsFilters = ({
  totalPages,
}: UseAgentsFiltersProps = {}) => {
  return useQueryStates(
    {
      search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
      page: createPageParser(totalPages)
        .withDefault(DEFAULT_PAGE)
        .withOptions({ clearOnDefault: true }),
    },
    {
      history: "replace",
      shallow: false,
    },
  );
};
