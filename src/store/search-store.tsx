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
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query || "")}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Sort suggestions to prioritize those starting with the query
      const sortedSuggestions: string[] = data.suggestions.sort(
        (a: string, b: string) => {
          if (!query.trim()) {
            return 0;
          }

          const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
          const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());

          if (aStartsWith && !bStartsWith) {
            return -1;
          }
          if (!aStartsWith && bStartsWith) {
            return 1;
          }
          return 0;
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
