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
      if (
        typeof totalPages === "number" &&
        totalPages >= 1 &&
        parsed > totalPages
      ) {
        return totalPages;
      }
      return parsed;
    },
    serialize: (value: number) => {
      const safeValue = Math.max(1, value || DEFAULT_PAGE);
      const hasValidTotal = typeof totalPages === "number" && totalPages >= 1;
      return (
        hasValidTotal ? Math.min(safeValue, totalPages!) : safeValue
      ).toString();
    },
  };
};

interface UseMeetingsFiltersProps {
  totalPages?: number;
}

export const useMeetingsFilters = ({
  totalPages,
}: UseMeetingsFiltersProps = {}) => {
  const pageParser = createPageParser(totalPages);

  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: {
        ...pageParser,
        defaultValue: DEFAULT_PAGE,
      },
    },
    {
      history: "replace",
      shallow: false,
    },
  );
};
