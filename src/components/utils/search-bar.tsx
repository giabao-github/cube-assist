"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Loader2, Search, TrendingUp, X } from "lucide-react";
import { Quicksand } from "next/font/google";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";

import { cn } from "@/lib/utils";
import { useSearchStore } from "@/store/search-store";

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});

const formatInputText = (text: string): string => {
  return text.replace(/\s{2,}/g, " ");
};

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [completion, setCompletion] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const justSelectedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { suggestions, isLoading, error, fetchSuggestions, clearSuggestions } =
    useSearchStore();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isFocused) {
      fetchSuggestions(debouncedQuery);
      setIsOpen(true);
      setSelectedIndex(-1);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } else {
      clearSuggestions();
      setIsOpen(false);
      setCompletion("");
      setShowCompletion(false);
    }
  }, [
    debouncedQuery,
    fetchSuggestions,
    clearSuggestions,
    isFocused,
    isInitialLoad,
  ]);

  const bestMatch = useMemo(() => {
    if (suggestions.length === 0 || !query.trim()) {
      return null;
    }
    const queryLower = query.toLowerCase();
    return suggestions.find((suggestion) =>
      suggestion.toLowerCase().startsWith(queryLower),
    );
  }, [suggestions, query]);

  useEffect(() => {
    if (bestMatch && query.trim() && isFocused) {
      const queryLower = query.toLowerCase();
      const suggestionLower = bestMatch.toLowerCase();
      const remainingText = bestMatch.slice(query.length);

      if (remainingText && suggestionLower.startsWith(queryLower)) {
        setCompletion(remainingText);
        setShowCompletion(true);
      } else {
        setCompletion("");
        setShowCompletion(false);
      }
    } else {
      setCompletion("");
      setShowCompletion(false);
    }
  }, [bestMatch, query, isFocused]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSelectedIndex(-1);
      setShowCompletion(false);
      setCompletion("");
      setIsFocused(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const resetSelectionState = useCallback(() => {
    justSelectedRef.current = false;
    setShowCompletion(false);
    setCompletion("");
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = formatInputText(e.target.value);
      setQuery(newValue);
      resetSelectionState();
    },
    [resetSelectionState],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setCompletion("");
    setShowCompletion(false);
    setIsOpen(false);
    justSelectedRef.current = false;
    inputRef.current?.focus();
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      const cleanSuggestion = formatInputText(suggestion.trim());
      justSelectedRef.current = true;
      setQuery(cleanSuggestion);
      setCompletion("");
      setShowCompletion(false);
      setIsOpen(false);
      clearSuggestions();
      inputRef.current?.blur();
      setIsFocused(false);
    },
    [clearSuggestions],
  );

  const acceptCompletion = useCallback(() => {
    if (completion && showCompletion && bestMatch) {
      const cleanSuggestion = formatInputText(bestMatch.trim());
      justSelectedRef.current = true;
      setQuery(cleanSuggestion);
      setCompletion("");
      setShowCompletion(false);
      setIsOpen(false);
    }
  }, [completion, showCompletion, bestMatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab" && showCompletion && completion) {
        e.preventDefault();
        acceptCompletion();
        return;
      }

      if (!isOpen || suggestions.length === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          } else if (showCompletion && completion) {
            acceptCompletion();
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          setShowCompletion(false);
          setCompletion("");
          break;
      }
    },
    [
      showCompletion,
      completion,
      isOpen,
      suggestions,
      acceptCompletion,
      selectedIndex,
      handleSelectSuggestion,
    ],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    resetSelectionState();
  }, [resetSelectionState]);

  const handleClick = useCallback(() => {
    if (!isFocused) {
      setIsFocused(true);
      resetSelectionState();
    }
  }, [isFocused, resetSelectionState]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const highlightedSuggestions = useMemo(() => {
    if (!query.trim()) {
      return suggestions.map((suggestion) => [
        {
          text: suggestion,
          isMatch: false,
        },
      ]);
    }

    return suggestions.map((suggestion) => {
      const queryParts = query.trim().split(/\s+/).filter(Boolean);
      const regexPattern = queryParts
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("\\s+");

      const regex = new RegExp(`(${regexPattern})`, "i");

      return suggestion.split(regex).map((part) => ({
        text: part,
        isMatch: regex.test(part),
      }));
    });
  }, [suggestions, query]);

  const shouldShowNoResults =
    !isLoading && suggestions.length === 0 && query.trim() && isFocused;

  return (
    <div
      ref={containerRef}
      className={`font-medium relative w-4/5 md:w-1/3 ${quicksand.className}`}
    >
      <div className="relative flex flex-row">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        {showCompletion && completion && query && (
          <div className="absolute inset-0 flex items-center pl-12 pr-12 text-sm whitespace-pre pointer-events-none md:text-base">
            <span className="invisible">{query}</span>
            <span className="text-gray-400 pl-[1.5px]">{completion}</span>
          </div>
        )}

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onClick={handleClick}
          placeholder={
            isMobile
              ? "Search meeting or agent"
              : "Search for a meeting or an agent"
          }
          className="relative py-5 pl-12 pr-12 text-sm md:text-base transition-all duration-200 border border-gray-200 rounded-full shadow-lg focus:!outline-none focus:!ring-1 focus:border-transparent placeholder:text-gray-400 placeholder:text-sm placeholder:md:text-base"
          style={{ backgroundColor: "transparent" }}
        />

        <div className="absolute inset-y-0 right-0 z-10 flex items-center gap-2 pr-4">
          {isFocused && isLoading && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {!isLoading && query && (
            <Button
              onClick={handleClear}
              size="icon"
              className="p-2 transition-colors bg-gray-500 rounded-full size-1 hover:bg-gray-400 active:bg-gray-300"
            >
              <X strokeWidth={3} className="text-white size-2.5" />
            </Button>
          )}
        </div>
      </div>

      {isOpen &&
        (isLoading || suggestions.length > 0 || shouldShowNoResults) && (
          <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl top-full rounded-2xl">
            {error && (
              <div className="p-4 text-sm border-b border-gray-100 text-rose-500">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-2 text-sm text-gray-500 cursor-default">
                  Trending searches
                </div>
                <ul ref={listRef} className="overflow-y-auto max-h-80">
                  {suggestions.map((suggestion, index) => (
                    <li key={`${suggestion}-${index}`}>
                      <button
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={cn(
                          "w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0",
                          selectedIndex === index && "bg-blue-50 text-blue-700",
                        )}
                      >
                        <TrendingUp className="flex-shrink-0 w-4 h-4 text-gray-400" />
                        <span className="truncate">
                          {highlightedSuggestions[index]?.map((part, i) => (
                            <span
                              key={i}
                              className={part.isMatch ? "font-bold" : ""}
                            >
                              {part.text}
                            </span>
                          )) || suggestion}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {shouldShowNoResults && (
              <div className="flex flex-row items-center justify-center p-5 text-gray-500 gap-x-2">
                <Search className="text-gray-400 size-5" />
                <p className="text-sm">{`No suggestions found for "${query.trim()}"`}</p>
              </div>
            )}

            {!isLoading && suggestions.length > 0 && !isMobile && (
              <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 cursor-default bg-gray-50">
                Use ↑↓ to navigate, Tab to complete, Enter to select, Esc to
                close
              </div>
            )}
          </div>
        )}
    </div>
  );
};
