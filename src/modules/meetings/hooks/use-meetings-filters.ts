import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants/pagination";

export const useMeetingsFilters = () => {
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
