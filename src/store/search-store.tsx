"use client";

import { create } from "zustand";

interface SearchState {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (query: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  suggestions: [],
  isLoading: false,
  error: null,

  fetchSuggestions: async (query: string) => {
    const currentState = get();

    if (currentState.isLoading) {
      return;
    }

    if (currentState.suggestions.length > 0 && query) {
      set({ isLoading: false, error: null });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const controller = new AbortController();
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query || "")}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const lowerQuery = query.toLowerCase();

      // Sort suggestions to prioritize those starting with the query
      const sortedSuggestions: string[] = data.suggestions.sort(
        (a: string, b: string) => {
          if (!query.trim()) {
            return 0;
          }
          const aStarts = a.toLowerCase().startsWith(lowerQuery);
          const bStarts = b.toLowerCase().startsWith(lowerQuery);
          return Number(bStarts) - Number(aStarts);
        },
      );

      set({ suggestions: sortedSuggestions, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch suggestions",
        isLoading: false,
        suggestions: [],
      });
    }
  },

  clearSuggestions: () => {
    set({ suggestions: [], error: null, isLoading: false });
  },
}));
