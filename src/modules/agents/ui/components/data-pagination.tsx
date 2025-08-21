import { useCallback } from "react";

import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  const handlePageChange = useCallback(
    (newPage: number) => {
      onPageChange(newPage);
    },
    [onPageChange],
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {Math.max(totalPages || 1, 1)}
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
        <Button
          title="Move to the first page"
          disabled={page === 1}
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => handlePageChange(1)}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          disabled={page === 1}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          disabled={page === totalPages || totalPages === 0}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </Button>
        <Button
          title="Move to the final page"
          disabled={page === totalPages}
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => handlePageChange(Math.max(totalPages, 1))}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  );
};
