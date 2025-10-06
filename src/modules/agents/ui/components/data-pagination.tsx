import { useEffect } from "react";

import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const param = useSearchParams();

  useEffect(() => {
    const pageStr = param.get("page");
    if (!pageStr) {
      if (page !== 1) {
        router.replace(`/dashboard/agents?page=${page}`);
      }
      return;
    }
    const urlPage = Number(pageStr);
    if (!Number.isFinite(urlPage) || urlPage < 1) {
      router.replace("/dashboard/agents");
      return;
    }
    if (urlPage === 1) {
      if (page !== 1) onPageChange(1);
      router.replace("/dashboard/agents");
      return;
    }
    if (urlPage !== page) {
      onPageChange(urlPage);
    }
  }, [page, param, router, onPageChange]);

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
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          disabled={page === 1}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(getPreviousPage(page))}
        >
          Previous
        </Button>
        <Button
          disabled={page === totalPages || totalPages === 0}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(getNextPage(page, totalPages))}
        >
          Next
        </Button>
        <Button
          title="Move to the final page"
          disabled={page === totalPages || totalPages === 0}
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
