import { Profanity } from "@2toad/profanity";
import { Filter } from "bad-words";

import { CUSTOM_PROFANITY_WORDS, PROFANITY_CONFIG } from "@/config/profanity";

import { LanguageDetector } from "@/lib/language";
import {
  clearNormalizationCache,
  getWordVariations,
  normalize,
} from "@/lib/language-utils";
import { normalizeProfanity } from "@/lib/text-utils";

import {
  CacheStats,
  FilterConfig,
  FilterMethod,
  Language,
  ProfanityAnalysis,
  ProfanityResult,
} from "@/types/profanity";

export class ProfanityFilter {
  private cache: Map<string, ProfanityResult>;
  private readonly config: FilterConfig;
  private badWordsFilter: Filter;
  private toadProfanity: Profanity;
  private isInitialized: boolean = false;
  private cacheHits: number = 0;
  private cacheAttempts: number = 0;
  private leoProfanityAvailable: boolean = false;
  private wordPatterns: Map<Language, RegExp[]>;
  private compiledWords: Map<Language, Set<string>>;

  constructor(config: Partial<FilterConfig> = {}) {
    this.config = {
      cacheSize: 10000,
      debug: false,
      languages: ["en", "vi"],
      strictMode: false,
      customWords: new Map(),
      ...config,
    };

    this.cache = new Map();
    this.wordPatterns = new Map();
    this.compiledWords = new Map();
    this.badWordsFilter = new Filter();
    this.toadProfanity = new Profanity();
    this.setupFilters();
  }

  private log(): void {
    // Debug logging removed for production
  }

  private async setupFilters(): Promise<void> {
    try {
      this.badWordsFilter = new Filter();
      this.toadProfanity = new Profanity({
        wholeWord: true,
        grawlix: "*#@&%",
        grawlixChar: "*",
        languages: this.config.languages.includes("en") ? ["en"] : [],
      });

      try {
        const leoProfanity = await import("leo-profanity");
        if (leoProfanity && typeof leoProfanity.check === "function") {
          this.leoProfanityAvailable = true;
        }
      } catch {
        // Debug logging removed
      }

      await this.compileWordPatterns();
      await this.addCustomWords();

      this.isInitialized = true;
      // Debug logging removed
    } catch (error) {
      console.error("Failed to initialize profanity filters: ", error);
      this.isInitialized = false;
    }
  }

  private wordVariationsCache = new Map<string, string[]>();

  private async compileWordPatterns(): Promise<void> {
    for (const config of PROFANITY_CONFIG) {
      const patterns: RegExp[] = [];
      const words = new Set<string>();

      // Pre-compute all variations in batches
      const allVariations = new Map<string, string[]>();
      for (const word of config.words) {
        if (!this.wordVariationsCache.has(word)) {
          this.wordVariationsCache.set(word, getWordVariations(word));
        }
        allVariations.set(word, this.wordVariationsCache.get(word)!);
      }

      // Compile word patterns
      for (const [, variations] of allVariations) {
        variations.forEach((variation) => {
          words.add(variation);
          patterns.push(
            new RegExp(`\\b${this.escapeRegExp(variation)}\\b`, "gi"),
          );
        });
      }

      // Do NOT add phrase patterns for phrases (let matchesPhrase handle it)
      // for (const phrase of config.phrases) {
      //   patterns.push(new RegExp(`\\b${this.escapeRegExp(phrase)}\\b`, "gi"));
      // }

      patterns.push(...config.patterns);

      this.wordPatterns.set(config.language, patterns);
      this.compiledWords.set(config.language, words);
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private async addCustomWords(): Promise<void> {
    if (!this.badWordsFilter || !this.toadProfanity) {
      // Debug logging removed
      return;
    }

    try {
      // Only add English words/phrases to English libraries
      const englishWords = CUSTOM_PROFANITY_WORDS.get("en") || [];
      if (englishWords.length === 0) return;

      this.badWordsFilter.addWords(...englishWords);
      this.toadProfanity.addWords(englishWords);

      if (this.leoProfanityAvailable) {
        const leoProfanity = await import("leo-profanity");
        leoProfanity.add(englishWords);
      }

      // Debug logging removed
    } catch (error) {
      console.error("Failed to add custom words:", error);
    }
  }

  private manageCacheSize(): void {
    while (this.cache.size > this.config.cacheSize) {
      // Remove least recently used (first) key
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  private getCacheKey(
    text: string,
    method: FilterMethod,
    language?: Language,
  ): string {
    return `${method}:${language || "auto"}:${text}`;
  }

  private validateInput(text: string): boolean {
    return (
      typeof text === "string" &&
      text.length > 0 &&
      text.length <= 10000 &&
      text.trim().length > 0
    );
  }

  async containsProfanity(
    text: string,
    method: FilterMethod = "hybrid",
    language?: Language,
  ): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Profanity filter not initialized");
    }

    if (!this.validateInput(text)) {
      return false;
    }

    let detectedLanguage: Language;
    if (language) {
      detectedLanguage = language;
    } else {
      const detectionResult = await LanguageDetector.getInstance().detect(text);
      detectedLanguage = detectionResult.language as Language;
    }
    const cacheKey = this.getCacheKey(text, method, detectedLanguage);

    this.cacheAttempts++;
    if (this.cache.has(cacheKey)) {
      this.cacheHits++;
      // Move key to end to mark as recently used
      const value = this.cache.get(cacheKey)!;
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, value);
      return value.hasProfanity;
    }

    const result = await this.performProfanityCheck(
      text,
      method,
      detectedLanguage,
    );

    this.manageCacheSize();
    this.cache.set(cacheKey, result);

    return result.hasProfanity;
  }

  private normalizeVietnamese(text: string): string {
    let normalized = text.normalize("NFC").toLowerCase().trim();
    normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "");
    normalized = normalized.replace(/\s+/g, " ");
    return normalized;
  }

  private matchesPhrase(text: string, phrase: string): boolean {
    // Case-insensitive, diacritics-sensitive exact match
    const lowerText = text.toLowerCase();
    const lowerPhrase = phrase.toLowerCase();
    if (lowerText === lowerPhrase) {
      return true;
    }

    // Find the phrase in the text (case-insensitive)
    const phraseIndex = lowerText.indexOf(lowerPhrase);
    if (phraseIndex === -1) {
      return false;
    }

    // Check boundaries - must be at word boundaries (space, punctuation, or string start/end)
    const beforeIndex = phraseIndex - 1;
    const afterIndex = phraseIndex + lowerPhrase.length;

    const beforeChar = beforeIndex >= 0 ? lowerText[beforeIndex] : null;
    const afterChar =
      afterIndex < lowerText.length ? lowerText[afterIndex] : null;

    // A boundary is start/end of string, space, or punctuation
    const isBeforeBoundary =
      beforeChar === null || /[\s\p{P}]/u.test(beforeChar);
    const isAfterBoundary = afterChar === null || /[^\p{L}]/u.test(afterChar);

    const result = isBeforeBoundary && isAfterBoundary;
    return result;
  }

  private async performProfanityCheck(
    text: string,
    method: FilterMethod,
    language: Language,
  ): Promise<ProfanityResult> {
    let hasProfanity = false;
    let confidence = 0;
    const detectedWords: string[] = [];

    try {
      // Pattern matching for specific language
      if (language !== "all") {
        const patterns = this.wordPatterns.get(language) || [];
        // Use leet normalization for English, regular normalization for others
        const normalizedText =
          language === "en" ? normalizeProfanity(text) : normalize(text);
        for (const pattern of patterns) {
          const matches = normalizedText.match(pattern);
          if (matches && matches.some((m) => m && m.trim().length > 0)) {
            hasProfanity = true;
            detectedWords.push(...matches);
            confidence += 0.3;
          }
        }

        const config = PROFANITY_CONFIG.find((c) => c.language === language);
        if (config?.phrases) {
          for (const phrase of config.phrases) {
            const normText =
              language === "en" ? normalizeProfanity(text) : text;
            const normPhrase =
              language === "en" ? normalizeProfanity(phrase) : phrase;
            if (this.matchesPhrase(normText, normPhrase)) {
              hasProfanity = true;
              detectedWords.push(phrase);
              confidence += 0.3;
            }
          }
        }
      }

      // Library-based checking (only for English or "all")
      if (
        (language === "en" || language === "all") &&
        this.badWordsFilter &&
        this.toadProfanity
      ) {
        switch (method) {
          case "fast":
            hasProfanity = hasProfanity || this.badWordsFilter.isProfane(text);
            break;
          case "comprehensive":
            if (this.leoProfanityAvailable) {
              const leoProfanity = await import("leo-profanity");
              hasProfanity = hasProfanity || leoProfanity.check(text);
            } else {
              hasProfanity =
                hasProfanity || this.badWordsFilter.isProfane(text);
            }
            break;
          case "advanced":
            hasProfanity = hasProfanity || this.toadProfanity.exists(text);
            break;
          default: {
            const checks = [
              this.badWordsFilter.isProfane(text),
              this.toadProfanity.exists(text),
            ];
            if (this.leoProfanityAvailable) {
              const leoProfanity = await import("leo-profanity");
              checks.push(leoProfanity.check(text));
            }
            hasProfanity = hasProfanity || checks.some(Boolean);
            confidence += checks.filter(Boolean).length / checks.length;
            break;
          }
        }
      }

      return {
        original: text,
        hasProfanity,
        cleaned: await this.cleanText(text, method),
        detectedLanguage: language,
        confidence: Math.min(confidence, 1),
      };
    } catch (error) {
      console.error("Error in profanity check:", error);
      return {
        original: text,
        hasProfanity: false,
        cleaned: text,
        detectedLanguage: language,
        confidence: 0,
      };
    }
  }

  async cleanText(
    text: string,
    method: FilterMethod = "advanced",
  ): Promise<string> {
    if (!this.isInitialized || !this.validateInput(text)) {
      return text;
    }

    if (!this.badWordsFilter || !this.toadProfanity) {
      console.warn("Filters not initialized, returning original text");
      return text;
    }

    try {
      const detectionResult = await LanguageDetector.getInstance().detect(text);
      const language = detectionResult.language as Language;
      let cleaned = text;

      // Apply pattern-based cleaning for specific language
      const patterns = this.wordPatterns.get(language) || [];
      for (const pattern of patterns) {
        cleaned = cleaned.replace(pattern, "***");
      }

      // IMPROVED: Clean Vietnamese phrases with better matching
      const config = PROFANITY_CONFIG.find((c) => c.language === language);
      if (config?.phrases) {
        for (const phrase of config.phrases) {
          // Normalize both cleaned text and phrase for replacement
          const normalizedCleaned = this.normalizeVietnamese(cleaned);
          const normalizedPhrase = this.normalizeVietnamese(phrase);
          if (this.matchesPhrase(normalizedCleaned, normalizedPhrase)) {
            const replacement = "*".repeat(normalizedPhrase.length);
            // Use case-insensitive replacement
            const regex = new RegExp(this.escapeRegExp(normalizedPhrase), "gi");
            cleaned = normalizedCleaned.replace(regex, replacement);
          }
        }
      }

      // Apply library-based cleaning
      switch (method) {
        case "fast":
          cleaned = this.badWordsFilter.clean(cleaned);
          break;
        case "comprehensive":
          if (this.leoProfanityAvailable) {
            const leoProfanity = await import("leo-profanity");
            cleaned = leoProfanity.clean(cleaned);
          } else {
            cleaned = this.badWordsFilter.clean(cleaned);
          }
          break;
        default:
          cleaned = this.toadProfanity.censor(cleaned);
          break;
      }

      return cleaned;
    } catch (error) {
      console.error("Error cleaning text:", error);
      return text;
    }
  }

  async processBatch(
    texts: string[],
    method: FilterMethod = "hybrid",
    batchSize: number = 50,
  ): Promise<ProfanityResult[]> {
    if (!Array.isArray(texts)) {
      throw new Error("Input must be an array of strings");
    }

    if (!this.isInitialized) {
      throw new Error("Profanity filter not initialized");
    }

    const results: ProfanityResult[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const batchPromises = batch.map(async (text) => {
        const detectionResult =
          await LanguageDetector.getInstance().detect(text);
        const language = detectionResult.language as Language;
        return this.performProfanityCheck(text, method, language);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Allow other tasks to run
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  async getAnalysis(text: string): Promise<ProfanityAnalysis> {
    if (!this.validateInput(text)) {
      return {
        badWords: false,
        leoProfanity: false,
        toadProfanity: false,
        consensus: false,
        cleanedText: text,
        confidence: 0,
        detectedWords: [],
        language: "en",
      };
    }

    const detectionResult = await LanguageDetector.getInstance().detect(text);
    const language = detectionResult.language as Language;
    const normalizedText = normalize(text);
    const detectedWords: string[] = [];

    if (!this.badWordsFilter || !this.toadProfanity) {
      console.warn("Filters not initialized");
      return {
        badWords: false,
        leoProfanity: false,
        toadProfanity: false,
        consensus: false,
        cleanedText: text,
        confidence: 0,
        detectedWords: [],
        language,
      };
    }

    try {
      const badWordsResult = this.badWordsFilter.isProfane(text);
      const toadProfanityResult = this.toadProfanity.exists(text);
      let leoProfanityResult = false;

      if (this.leoProfanityAvailable) {
        const leoProfanity = await import("leo-profanity");
        leoProfanityResult = leoProfanity.check(text);
      }

      // Check patterns for detected words
      const patterns = this.wordPatterns.get(language) || [];
      for (const pattern of patterns) {
        const matches = normalizedText.match(pattern);
        if (matches) {
          detectedWords.push(...matches);
        }
      }

      // IMPROVED: Check phrases with better Vietnamese support
      const config = PROFANITY_CONFIG.find((c) => c.language === language);
      if (config?.phrases) {
        for (const phrase of config.phrases) {
          if (this.matchesPhrase(text, phrase)) {
            detectedWords.push(phrase);
          }
        }
      }

      const consensus =
        badWordsResult || leoProfanityResult || toadProfanityResult;

      return {
        badWords: badWordsResult,
        leoProfanity: leoProfanityResult,
        toadProfanity: toadProfanityResult,
        consensus,
        cleanedText: await this.cleanText(text, "advanced"),
        confidence: this.calculateConfidence(
          badWordsResult,
          leoProfanityResult,
          toadProfanityResult,
        ),
        detectedWords: [...new Set(detectedWords)],
        language,
      };
    } catch (error) {
      console.error("Error analyzing text:", error);
      return {
        badWords: false,
        leoProfanity: false,
        toadProfanity: false,
        consensus: false,
        cleanedText: text,
        confidence: 0,
        detectedWords: [],
        language,
      };
    }
  }

  private calculateConfidence(
    badWords: boolean,
    leo: boolean,
    toad: boolean,
  ): number {
    const checks = [badWords, leo, toad];
    const positiveCount = checks.filter(Boolean).length;
    return positiveCount / checks.length;
  }

  getCacheStats(): CacheStats {
    const hitRate =
      this.cacheAttempts > 0 ? this.cacheHits / this.cacheAttempts : 0;
    const memoryUsage = this.estimateMemoryUsage();

    return {
      size: this.cache.size,
      maxSize: this.config.cacheSize,
      hitRate,
      memoryUsage,
    };
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 encoding
      totalSize += value.original.length * 2;
      totalSize += value.cleaned.length * 2;
      totalSize += (value.detectedLanguage?.length ?? 0) * 2;
      totalSize += 8; // boolean (hasProfanity)
      totalSize += 8; // number (confidence)
      totalSize += 48; // estimated object overhead
    }
    return totalSize;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheAttempts = 0;
    clearNormalizationCache();
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async reinitialize(): Promise<void> {
    this.clearCache();
    await this.setupFilters();
  }

  getPerformanceMetrics() {
    return {
      cacheStats: this.getCacheStats(),
      isInitialized: this.isInitialized,
      filterStatus: this.isInitialized ? "ready" : "not initialized",
      availableFilters: [
        "bad-words",
        this.leoProfanityAvailable ? "leo-profanity" : null,
        "@2toad/profanity",
        "pattern-matching",
      ].filter(Boolean),
      supportedLanguages: this.config.languages,
    };
  }
}

export const createProfanityFilter = async (
  config?: Partial<FilterConfig>,
): Promise<ProfanityFilter> => {
  const filter = new ProfanityFilter(config);
  await filter.reinitialize();
  return filter;
};

// Singleton instance
let globalFilter: ProfanityFilter | null = null;

export const getGlobalFilter = async (): Promise<ProfanityFilter> => {
  if (!globalFilter) {
    globalFilter = await createProfanityFilter();
  }
  return globalFilter;
};
