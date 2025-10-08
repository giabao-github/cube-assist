import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const getPreviousPage = (currentPage: number) => Math.max(1, currentPage - 1);
const getNextPage = (currentPage: number, total: number) =>
  Math.min(total, currentPage + 1);

interface DataPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({
  page,
  totalPages,
  onPageChange,
}: DataPaginationProps) => {
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages || totalPages === 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {Math.max(totalPages, 1)}
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
        <Button
          title="Move to the first page"
          disabled={isFirstPage}
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          disabled={isFirstPage}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(getPreviousPage(page))}
        >
          Previous
        </Button>
        <Button
          disabled={isLastPage}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(getNextPage(page, totalPages))}
        >
          Next
        </Button>
        <Button
          title="Move to the final page"
          disabled={isLastPage}
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  );
};
