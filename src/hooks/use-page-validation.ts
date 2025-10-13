"use client";

import { useEffect, useRef } from "react";

export const usePageValidation = (
  currentPage: number,
  setPage: (page: number) => void,
  totalPages?: number,
) => {
  const hasValidated = useRef(false);

  useEffect(() => {
    if (hasValidated.current) return;

    if (currentPage <= 1) {
      setPage(1);
      hasValidated.current = true;
    }
  }, [currentPage, setPage]);

  useEffect(() => {
    if (typeof totalPages !== "undefined") {
      if (totalPages === 0) {
        setPage(1);
      } else if (currentPage > totalPages) {
        setPage(totalPages);
      }
    }
  }, [totalPages, currentPage, setPage]);
};
