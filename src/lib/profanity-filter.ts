import { Profanity } from "@2toad/profanity";
import { Filter } from "bad-words";
import * as leoProfanity from "leo-profanity";

import { CUSTOM_PROFANITY_WORDS } from "@/config/profanity-words";

type FilterMethod = "fast" | "comprehensive" | "advanced" | "hybrid";

interface ProfanityResult {
  original: string;
  hasProfanity: boolean;
  cleaned: string;
}

interface ProfanityAnalysis {
  badWords: boolean;
  leoProfanity: boolean;
  toadProfanity: boolean;
  consensus: boolean;
  cleanedText: string;
  confidence: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate?: number;
}

class ProfanityFilter {
  private cache: Map<string, boolean | string>;
  private readonly cacheSize: number;
  private badWordsFilter: Filter;
  private toadProfanity: Profanity;
  private isInitialized: boolean = false;
  private cacheHits: number = 0;
  private cacheAttempts: number = 0;
  private leoProfanityAvailable: boolean = false;

  constructor(cacheSize: number = 10000) {
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.badWordsFilter = new Filter();
    this.toadProfanity = new Profanity();
    this.setupFilters();
  }

  private addCustomWords(): void {
    if (!CUSTOM_PROFANITY_WORDS || !Array.isArray(CUSTOM_PROFANITY_WORDS)) {
      console.warn("Custom profanity words not found or invalid");
      return;
    }

    try {
      // Filter out empty strings and normalize
      const validWords = CUSTOM_PROFANITY_WORDS.filter(
        (word) => word && typeof word === "string" && word.trim().length > 0,
      ).map((word) => word.trim().toLowerCase());

      if (validWords.length === 0) {
        return;
      }

      this.badWordsFilter.addWords(...validWords);

      if (this.leoProfanityAvailable) {
        try {
          leoProfanity.add(validWords);
        } catch (error) {
          console.warn("Failed to add custom words to leo-profanity:", error);
        }
      }

      this.toadProfanity.addWords(validWords);
      console.log(`Added ${validWords.length} custom profanity words`);
    } catch (error) {
      console.error("Failed to add custom words: ", error);
    }
  }

  private setupFilters(): void {
    try {
      // Initialize bad-words filter
      this.badWordsFilter = new Filter();

      // Try to initialize leo-profanity with better error handling
      try {
        // Check if leo-profanity has the expected methods
        if (typeof leoProfanity === "object" && leoProfanity !== null) {
          // Try different ways to load the dictionary
          if (typeof leoProfanity.loadDictionary === "function") {
            leoProfanity.loadDictionary("en");
          } else if (typeof leoProfanity.loadDictionary === "undefined") {
            // Some versions might not need explicit dictionary loading
            console.log("leo-profanity dictionary loading not required");
          }

          // Test basic functionality
          if (typeof leoProfanity.check === "function") {
            leoProfanity.check("test");
            this.leoProfanityAvailable = true;
          }
        }
      } catch (leoError) {
        console.warn(
          "leo-profanity initialization failed, continuing without it: ",
          leoError,
        );
        this.leoProfanityAvailable = false;
      }

      // Initialize @2toad/profanity
      this.toadProfanity = new Profanity({
        wholeWord: true,
        grawlix: "*#@&%",
        grawlixChar: "*",
        languages: ["en"],
      });

      // Add custom words to all available filters
      this.addCustomWords();
      this.isInitialized = true;

      const availableFilters = [
        "bad-words",
        this.leoProfanityAvailable ? "leo-profanity" : null,
        "@2toad/profanity",
      ].filter(Boolean);

      console.log(
        `Profanity filters initialized successfully. Available filters: ${availableFilters.join(", ")}`,
      );
    } catch (error) {
      console.error("Failed to initialize profanity filters:", error);
      this.isInitialized = false;
    }
  }

  private validateInput(text: string): boolean {
    return typeof text === "string" && text.length > 0;
  }

  private manageCacheSize(): void {
    while (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  private setCacheValue(key: string, value: boolean | string): void {
    this.manageCacheSize();
    this.cache.set(key, value);
  }

  private getCacheValue(key: string): boolean | string | undefined {
    this.cacheAttempts++;
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cacheHits++;
    }
    return value;
  }

  containsProfanity(text: string, method: FilterMethod = "hybrid"): boolean {
    if (!this.isInitialized) {
      console.warn("Profanity filter not initialized");
      return false;
    }

    if (!this.validateInput(text)) {
      return false;
    }

    const cacheKey = `contains:${method}:${text}`;
    const cached = this.cache.get(cacheKey);
    if (typeof cached === "boolean") {
      return cached;
    }

    let result = false;

    try {
      switch (method) {
        case "fast":
          result = this.badWordsFilter.isProfane(text);
          break;
        case "comprehensive":
          if (this.leoProfanityAvailable) {
            result = leoProfanity.check(text);
          } else {
            result = this.badWordsFilter.isProfane(text);
          }
          break;
        case "advanced":
          result = this.toadProfanity.exists(text);
          break;
        case "hybrid":
        default:
          result =
            this.badWordsFilter.isProfane(text) ||
            this.toadProfanity.exists(text);
          if (this.leoProfanityAvailable) {
            result = result || leoProfanity.check(text);
          }
          break;
      }
    } catch (error) {
      console.error("Error checking profanity: ", error);
      result = false;
    }

    this.setCacheValue(cacheKey, result);
    return result;
  }

  cleanText(text: string, method: FilterMethod = "advanced"): string {
    if (!this.isInitialized) {
      console.warn("Profanity filter not initialized");
      return text;
    }

    if (!this.validateInput(text)) {
      return text;
    }

    const cacheKey = `clean:${method}:${text}`;
    const cached = this.cache.get(cacheKey);
    if (typeof cached === "string") {
      return cached;
    }

    let result = text;

    try {
      switch (method) {
        case "fast":
          result = this.badWordsFilter.clean(text);
          break;
        case "comprehensive":
          if (this.leoProfanityAvailable) {
            result = leoProfanity.clean(text);
          } else {
            // Fallback to bad-words if leo-profanity is not available
            result = this.badWordsFilter.clean(text);
          }
          break;
        case "advanced":
        default:
          result = this.toadProfanity.censor(text);
          break;
      }
    } catch (error) {
      console.error("Error cleaning text:", error);
      result = text;
    }

    this.setCacheValue(cacheKey, result);
    return result;
  }

  async processBatch(
    texts: string[],
    method: FilterMethod = "hybrid",
  ): Promise<ProfanityResult[]> {
    if (!Array.isArray(texts)) {
      throw new Error("Input must be an array of strings");
    }

    if (!this.isInitialized) {
      throw new Error("Profanity filter not initialized");
    }

    const results: ProfanityResult[] = [];
    const batchSize = 100;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const batchResults = batch.map((text) => ({
        original: text,
        hasProfanity: this.containsProfanity(text, method),
        cleaned: this.cleanText(text, method),
      }));

      results.push(...batchResults);

      // Allow other tasks to run
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  getAnalysis(text: string): ProfanityAnalysis {
    if (!this.validateInput(text)) {
      return {
        badWords: false,
        leoProfanity: false,
        toadProfanity: false,
        consensus: false,
        cleanedText: text,
        confidence: 0,
      };
    }

    if (!this.isInitialized) {
      console.warn("Profanity filter not initialized");
      return {
        badWords: false,
        leoProfanity: false,
        toadProfanity: false,
        consensus: false,
        cleanedText: text,
        confidence: 0,
      };
    }

    try {
      const badWordsResult = this.badWordsFilter.isProfane(text);
      const toadProfanityResult = this.toadProfanity.exists(text);
      let leoProfanityResult = false;

      if (this.leoProfanityAvailable) {
        try {
          leoProfanityResult = leoProfanity.check(text);
        } catch (error) {
          console.warn("leo-profanity check failed:", error);
        }
      }

      const analysis = {
        badWords: badWordsResult,
        leoProfanity: leoProfanityResult,
        toadProfanity: toadProfanityResult,
        consensus: badWordsResult || leoProfanityResult || toadProfanityResult,
        cleanedText: this.cleanText(text, "advanced"),
        confidence: this.getConfidenceScore(text),
      };

      return analysis;
    } catch (error) {
      console.error("Error analyzing text:", error);
      return {
        badWords: false,
        leoProfanity: false,
        toadProfanity: false,
        consensus: false,
        cleanedText: text,
        confidence: 0,
      };
    }
  }

  getConfidenceScore(text: string): number {
    if (!this.validateInput(text)) {
      return 0;
    }

    try {
      const checks = [
        this.badWordsFilter.isProfane(text),
        this.toadProfanity.exists(text),
      ];

      if (this.leoProfanityAvailable) {
        try {
          checks.push(leoProfanity.check(text));
        } catch (error) {
          console.warn("leo-profanity confidence check failed:", error);
        }
      }

      const positiveCount = checks.filter(Boolean).length;
      return positiveCount / checks.length;
    } catch (error) {
      console.error("Error calculating confidence score:", error);
      return 0;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheAttempts = 0;
  }

  getCacheStats(): CacheStats {
    const hitRate =
      this.cacheAttempts > 0 ? this.cacheHits / this.cacheAttempts : 0;

    return {
      size: this.cache.size,
      maxSize: this.cacheSize,
      hitRate: hitRate,
    };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  reinitialize(): void {
    this.clearCache();
    this.setupFilters();
  }

  addWords(words: string[]): void {
    if (!this.isInitialized) {
      console.warn("Profanity filter not initialized");
      return;
    }

    try {
      const validWords = words
        .filter(
          (word) => word && typeof word === "string" && word.trim().length > 0,
        )
        .map((word) => word.trim().toLowerCase());

      if (validWords.length === 0) return;

      this.badWordsFilter.addWords(...validWords);

      if (this.leoProfanityAvailable) {
        try {
          leoProfanity.add(validWords);
        } catch (error) {
          console.warn("Failed to add words to leo-profanity:", error);
        }
      }

      this.toadProfanity.addWords(validWords);

      // Clear cache since filter rules changed
      this.clearCache();

      console.log(`Added ${validWords.length} words to profanity filters`);
    } catch (error) {
      console.error("Failed to add words: ", error);
    }
  }

  removeWords(words: string[]): void {
    if (!this.isInitialized) {
      console.warn("Profanity filter not initialized");
      return;
    }

    try {
      const validWords = words
        .filter(
          (word) => word && typeof word === "string" && word.trim().length > 0,
        )
        .map((word) => word.trim().toLowerCase());

      if (validWords.length === 0) return;

      this.badWordsFilter.removeWords(...validWords);

      if (this.leoProfanityAvailable) {
        try {
          leoProfanity.remove(validWords);
        } catch (error) {
          console.warn("Failed to remove words from leo-profanity:", error);
        }
      }

      this.toadProfanity.removeWords(validWords);

      // Clear cache since filter rules changed
      this.clearCache();

      console.log(`Removed ${validWords.length} words from profanity filters`);
    } catch (error) {
      console.error("Failed to remove words: ", error);
    }
  }

  getPerformanceMetrics(): {
    cacheStats: CacheStats;
    isInitialized: boolean;
    filterStatus: string;
    availableFilters: string[];
  } {
    const availableFilters = [
      "bad-words",
      this.leoProfanityAvailable ? "leo-profanity" : null,
      "@2toad/profanity",
    ].filter(Boolean) as string[];

    return {
      cacheStats: this.getCacheStats(),
      isInitialized: this.isInitialized,
      filterStatus: this.isInitialized ? "ready" : "not initialized",
      availableFilters,
    };
  }
}

const profanityFilter = new ProfanityFilter();

export default profanityFilter;
export {
  ProfanityFilter,
  type FilterMethod,
  type ProfanityResult,
  type ProfanityAnalysis,
  type CacheStats,
};
