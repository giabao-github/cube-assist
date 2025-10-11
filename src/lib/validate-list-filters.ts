export const validateListFilters = (filters: {
  page?: string | number;
  search?: string;
}) => ({
  page: Math.max(
    1,
    Number.isFinite(Number(filters.page)) ? Number(filters.page) : 1,
  ),
  search: filters.search?.trim() || undefined,
});
