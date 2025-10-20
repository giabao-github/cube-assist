import { useCallback, useEffect, useRef } from "react";

export const useDebounceCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
};
