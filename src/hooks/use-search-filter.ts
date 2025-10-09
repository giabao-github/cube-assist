export const useSearchFilter = <T extends { search: string; page: number }>(
  setFilters: (filters: Partial<T>) => void,
) => {
  return (value: string) => {
    setFilters({ search: value, page: 1 } as Partial<T>);
  };
};
