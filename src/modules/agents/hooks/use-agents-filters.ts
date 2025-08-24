import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants/pagination";

// Create a parser that validates both lower and upper bounds
const createPageParser = (totalPages?: number) => {
  const baseParser = parseAsInteger.withDefault(DEFAULT_PAGE);
  return {
    ...baseParser,
    parse: (value: string | string[] | undefined) => {
      // Handle invalid or empty values
      if (!value || Array.isArray(value)) return DEFAULT_PAGE;

      // Parse the page number
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed < 1) return DEFAULT_PAGE;

      // Ensure it's within valid bounds
      if (totalPages && parsed > totalPages) {
        return totalPages;
      }
      return parsed;
    },
    serialize: (value: number) => {
      // Always return string for valid value, undefined will cause type errors
      const safeValue = Math.max(1, value || DEFAULT_PAGE);
      return totalPages
        ? Math.min(safeValue, totalPages).toString()
        : safeValue.toString();
    },
  };
};

interface UseAgentsFiltersProps {
  totalPages?: number;
}

export const useAgentsFilters = ({
  totalPages,
}: UseAgentsFiltersProps = {}) => {
  const pageParser = createPageParser(totalPages);

  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: {
        ...pageParser,
        defaultValue: DEFAULT_PAGE,
        parseServerSide: (value: string | string[] | undefined) =>
          pageParser.parse(value),
      },
    },
    {
      history: "replace",
      shallow: false,
    },
  );
};
