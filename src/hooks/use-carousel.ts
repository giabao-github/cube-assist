"use client";

import { useCallback, useState } from "react";

export const useCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return { currentIndex, setCurrentIndex, goTo };
};
