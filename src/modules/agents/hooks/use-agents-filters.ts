import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants/pagination";

export const useAgentsFilters = () => {
  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(DEFAULT_PAGE),
    },
    {
      history: "replace",
      shallow: false,
      clearOnDefault: true,
    },
  );
};
