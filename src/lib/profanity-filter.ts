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
  private normalizedWords: Map<Language, Set<string>>;

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
    this.normalizedWords = new Map();
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
      const normalizedWords = new Set<string>();

      // Pre-compute all variations in batches
      const allVariations = new Map<string, string[]>();
      for (const word of config.words) {
        if (!this.wordVariationsCache.has(word)) {
          this.wordVariationsCache.set(word, getWordVariations(word));
        }
        allVariations.set(word, this.wordVariationsCache.get(word)!);
      }

      // Compile word patterns
      for (const [originalWord, variations] of allVariations) {
        // Add original word and its normalized version
        words.add(originalWord);
        const normalizedOriginal =
          config.language === "en"
            ? normalizeProfanity(originalWord)
            : normalize(originalWord);
        normalizedWords.add(normalizedOriginal);

        // Create pattern for original word (with word boundaries)
        patterns.push(
          new RegExp(`\\b${this.escapeRegExp(originalWord)}\\b`, "gi"),
        );

        // Add variations
        variations.forEach((variation) => {
          words.add(variation);
          const normalizedVariation =
            config.language === "en"
              ? normalizeProfanity(variation)
              : normalize(variation);
          normalizedWords.add(normalizedVariation);

          patterns.push(
            new RegExp(`\\b${this.escapeRegExp(variation)}\\b`, "gi"),
          );
        });
      }

      // Add phrase patterns with improved handling
      for (const phrase of config.phrases) {
        words.add(phrase);
        const normalizedPhrase =
          config.language === "en"
            ? normalizeProfanity(phrase)
            : normalize(phrase);
        normalizedWords.add(normalizedPhrase);

        // Create flexible phrase patterns that handle spacing variations
        const flexiblePhrase = phrase.replace(/\s+/g, "\\s*");
        patterns.push(
          new RegExp(`\\b${this.escapeRegExp(flexiblePhrase)}\\b`, "gi"),
        );
      }

      // Add existing regex patterns
      patterns.push(...config.patterns);

      this.wordPatterns.set(config.language, patterns);
      this.compiledWords.set(config.language, words);
      this.normalizedWords.set(config.language, normalizedWords);
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private async addCustomWords(): Promise<void> {
    if (!this.badWordsFilter || !this.toadProfanity) {
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
    normalized = normalized.replace(/[\u200B\u200C\uFEFF\u00AD]/g, "");
    normalized = normalized.replace(/\s+/g, " ");
    return normalized;
  }

  private matchesPhrase(
    text: string,
    phrase: string,
    language: Language = "vi",
  ): boolean {
    // Normalize both text and phrase based on language
    const normalizedText =
      language === "en"
        ? normalizeProfanity(text)
        : this.normalizeVietnamese(text);
    const normalizedPhrase =
      language === "en"
        ? normalizeProfanity(phrase)
        : this.normalizeVietnamese(phrase);

    // Direct match
    if (normalizedText === normalizedPhrase) {
      return true;
    }

    // Find phrase in text with word boundaries
    const phraseRegex = new RegExp(
      `\\b${this.escapeRegExp(normalizedPhrase)}\\b`,
      "gi",
    );

    if (phraseRegex.test(normalizedText)) {
      return true;
    }

    const phraseWords = normalizedPhrase.split(/\s+/);
    const textWords = normalizedText.split(/\s+/);

    // Look for consecutive matching words in text
    for (let i = 0; i <= textWords.length - phraseWords.length; i++) {
      let allWordsMatch = true;
      for (let j = 0; j < phraseWords.length; j++) {
        if (textWords[i + j] !== phraseWords[j]) {
          allWordsMatch = false;
          break;
        }
      }
      if (allWordsMatch) {
        return true;
      }
    }

    return false;
  }

  private matchesSingleWord(
    text: string,
    word: string,
    language: Language = "vi",
  ): boolean {
    const normalizedText =
      language === "en" ? normalizeProfanity(text) : normalize(text);
    const normalizedWord =
      language === "en" ? normalizeProfanity(word) : normalize(word);

    // Use word boundary regex for more accurate matching
    const wordRegex = new RegExp(
      `\\b${this.escapeRegExp(normalizedWord)}\\b`,
      "gi",
    );
    return wordRegex.test(normalizedText);
  }

  private checkMultilingualPhrases(text: string): boolean {
    let hasProfanity = false;

    const hasEnglishWords = /[a-zA-Z]/.test(text);
    const hasVietnameseChars =
      /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/.test(
        text,
      );

    if (hasEnglishWords && hasVietnameseChars) {
      for (const config of PROFANITY_CONFIG) {
        for (const word of config.words) {
          if (this.matchesSingleWord(text, word, config.language)) {
            hasProfanity = true;
            break;
          }
        }

        // Check phrases
        if (!hasProfanity) {
          for (const phrase of config.phrases) {
            if (this.matchesPhrase(text, phrase, config.language)) {
              hasProfanity = true;
              break;
            }
          }
        }

        if (hasProfanity) break;
      }

      const words = text.split(/\s+/);
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j <= Math.min(words.length, i + 5); j++) {
          // Check up to 5-word phrases
          const segment = words.slice(i, j).join(" ");

          // Check this segment against all language configs
          for (const config of PROFANITY_CONFIG) {
            // Check if segment contains any banned words from this language
            for (const word of config.words) {
              if (this.matchesSingleWord(segment, word, config.language)) {
                hasProfanity = true;
                break;
              }
            }

            // Check if segment matches any banned phrases from this language
            if (!hasProfanity) {
              for (const phrase of config.phrases) {
                if (this.matchesPhrase(segment, phrase, config.language)) {
                  hasProfanity = true;
                  break;
                }
              }
            }

            if (hasProfanity) break;
          }

          if (hasProfanity) break;
        }

        if (hasProfanity) break;
      }
    } else {
      for (const config of PROFANITY_CONFIG) {
        // Check words for this specific language
        for (const word of config.words) {
          if (this.matchesSingleWord(text, word, config.language)) {
            hasProfanity = true;
            break;
          }
        }

        // Check phrases for this specific language
        if (!hasProfanity) {
          for (const phrase of config.phrases) {
            if (this.matchesPhrase(text, phrase, config.language)) {
              hasProfanity = true;
              break;
            }
          }
        }

        if (hasProfanity) break;
      }
    }

    return hasProfanity;
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
      if (this.checkMultilingualPhrases(text)) {
        hasProfanity = true;
        confidence += 0.6;
      }

      if (language !== "all") {
        const patterns = this.wordPatterns.get(language) || [];
        const compiledWords = this.compiledWords.get(language) || new Set();

        // Use appropriate normalization based on language
        const normalizedText =
          language === "en" ? normalizeProfanity(text) : normalize(text);

        // Check individual words
        for (const word of compiledWords) {
          if (this.matchesSingleWord(text, word, language)) {
            hasProfanity = true;
            detectedWords.push(word);
            confidence += 0.4;
          }
        }

        // Check patterns
        for (const pattern of patterns) {
          const matches = normalizedText.match(pattern);
          if (matches?.some((m) => m?.trim().length > 0)) {
            hasProfanity = true;
            detectedWords.push(...matches.filter((m) => m?.trim()));
            confidence += 0.3;
          }
        }

        // Check phrases with improved matching
        const config = PROFANITY_CONFIG.find((c) => c.language === language);
        if (config?.phrases) {
          for (const phrase of config.phrases) {
            if (this.matchesPhrase(text, phrase, language)) {
              hasProfanity = true;
              detectedWords.push(phrase);
              confidence += 0.4;
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
            if (this.badWordsFilter.isProfane(text)) {
              hasProfanity = true;
              confidence += 0.3;
            }
            break;
          case "comprehensive":
            if (this.leoProfanityAvailable) {
              const leoProfanity = await import("leo-profanity");
              if (leoProfanity.check(text)) {
                hasProfanity = true;
                confidence += 0.4;
              }
            } else {
              if (this.badWordsFilter.isProfane(text)) {
                hasProfanity = true;
                confidence += 0.3;
              }
            }
            break;
          case "advanced":
            if (this.toadProfanity.exists(text)) {
              hasProfanity = true;
              confidence += 0.4;
            }
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
            const positiveChecks = checks.filter(Boolean).length;
            if (positiveChecks > 0) {
              hasProfanity = true;
              confidence += positiveChecks / checks.length;
            }
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

      // ENHANCED: Clean against all languages, not just detected language
      for (const config of PROFANITY_CONFIG) {
        const compiledWords =
          this.compiledWords.get(config.language) || new Set();

        // Clean individual words
        for (const word of compiledWords) {
          const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, "gi");
          cleaned = cleaned.replace(regex, "*".repeat(word.length));
        }

        // Apply pattern-based cleaning
        const patterns = this.wordPatterns.get(config.language) || [];
        for (const pattern of patterns) {
          cleaned = cleaned.replace(pattern, (match) =>
            "*".repeat(match.length),
          );
        }

        // Clean phrases with improved matching
        for (const phrase of config.phrases) {
          // Create case-insensitive regex for phrase replacement
          const regex = new RegExp(`\\b${this.escapeRegExp(phrase)}\\b`, "gi");
          cleaned = cleaned.replace(regex, "*".repeat(phrase.length));
        }
      }

      // Apply library-based cleaning for English
      if (language === "en" || language === "all") {
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

      // ENHANCED: Check all languages for word detection
      for (const config of PROFANITY_CONFIG) {
        const compiledWords =
          this.compiledWords.get(config.language) || new Set();
        for (const word of compiledWords) {
          if (this.matchesSingleWord(text, word, config.language)) {
            detectedWords.push(word);
          }
        }

        // Check patterns for detected words
        const patterns = this.wordPatterns.get(config.language) || [];
        const normalizedText =
          config.language === "en" ? normalizeProfanity(text) : normalize(text);
        for (const pattern of patterns) {
          const matches = normalizedText.match(pattern);
          if (matches) {
            detectedWords.push(...matches.filter((m) => m?.trim()));
          }
        }

        // Check phrases with improved detection
        for (const phrase of config.phrases) {
          if (this.matchesPhrase(text, phrase, config.language)) {
            detectedWords.push(phrase);
          }
        }
      }

      // Check multilingual combinations
      const hasMultilingual = this.checkMultilingualPhrases(text);

      const consensus =
        badWordsResult ||
        leoProfanityResult ||
        toadProfanityResult ||
        hasMultilingual;

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
          hasMultilingual,
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
    multilingual: boolean = false,
  ): number {
    const checks = [badWords, leo, toad, multilingual];
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
        "multilingual-detection",
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
