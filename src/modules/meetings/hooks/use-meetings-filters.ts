import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

import { DEFAULT_PAGE } from "@/constants/pagination";

import { MeetingStatus } from "@/modules/meetings/types";

export const useMeetingsFilters = () => {
  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(DEFAULT_PAGE),
      status: parseAsStringEnum(Object.values(MeetingStatus)),
      agentId: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      shallow: false,
      clearOnDefault: true,
    },
  );
};
