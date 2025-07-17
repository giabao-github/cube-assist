import { Profanity } from "@2toad/profanity";
import { Filter } from "bad-words";

import { CUSTOM_PROFANITY_WORDS, PROFANITY_CONFIG } from "@/config/profanity";

import {
  CacheStats,
  FilterConfig,
  FilterMethod,
  Language,
  ProfanityAnalysis,
  ProfanityResult,
} from "@/types/profanity";

export class TextProcessor {
  private static readonly NORMALIZATION_CACHE = new Map<string, string>();
  private static readonly DIACRITICS_MAP = new Map([
    ["à", "a"],
    ["á", "a"],
    ["ả", "a"],
    ["ã", "a"],
    ["ạ", "a"],
    ["ă", "a"],
    ["ắ", "a"],
    ["ằ", "a"],
    ["ẳ", "a"],
    ["ẵ", "a"],
    ["ặ", "a"],
    ["â", "a"],
    ["ấ", "a"],
    ["ầ", "a"],
    ["ẩ", "a"],
    ["ẫ", "a"],
    ["ậ", "a"],
    ["è", "e"],
    ["é", "e"],
    ["ẻ", "e"],
    ["ẽ", "e"],
    ["ẹ", "e"],
    ["ê", "e"],
    ["ế", "e"],
    ["ề", "e"],
    ["ể", "e"],
    ["ễ", "e"],
    ["ệ", "e"],
    ["ì", "i"],
    ["í", "i"],
    ["ỉ", "i"],
    ["ĩ", "i"],
    ["ị", "i"],
    ["ò", "o"],
    ["ó", "o"],
    ["ỏ", "o"],
    ["õ", "o"],
    ["ọ", "o"],
    ["ô", "o"],
    ["ố", "o"],
    ["ồ", "o"],
    ["ổ", "o"],
    ["ỗ", "o"],
    ["ộ", "o"],
    ["ơ", "o"],
    ["ớ", "o"],
    ["ờ", "o"],
    ["ở", "o"],
    ["ỡ", "o"],
    ["ợ", "o"],
    ["ù", "u"],
    ["ú", "u"],
    ["ủ", "u"],
    ["ũ", "u"],
    ["ụ", "u"],
    ["ư", "u"],
    ["ứ", "u"],
    ["ừ", "u"],
    ["ử", "u"],
    ["ữ", "u"],
    ["ự", "u"],
    ["ỳ", "y"],
    ["ý", "y"],
    ["ỷ", "y"],
    ["ỹ", "y"],
    ["ỵ", "y"],
    ["đ", "d"],
  ]);

  static normalize(text: string): string {
    if (this.NORMALIZATION_CACHE.has(text)) {
      return this.NORMALIZATION_CACHE.get(text)!;
    }

    let normalized = text.toLowerCase().trim();

    // Remove Vietnamese diacritics
    for (const [accented, base] of this.DIACRITICS_MAP) {
      normalized = normalized.replace(new RegExp(accented, "g"), base);
    }

    // Remove special characters and normalize spaces
    normalized = normalized
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    this.NORMALIZATION_CACHE.set(text, normalized);
    return normalized;
  }

  static clearNormalizationCache(): void {
    this.NORMALIZATION_CACHE.clear();
  }

  static detectLanguage(text: string): Language {
    const vietnameseChars =
      /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi;
    const vietnameseMatches = text.match(vietnameseChars);

    if (vietnameseMatches && vietnameseMatches.length > text.length * 0.1) {
      return "vi";
    }

    return "en";
  }

  static getWordVariations(word: string): string[] {
    const variations = [word];

    // Add common leetspeak variations
    const leetMap: Record<string, string[]> = {
      a: ["@", "4"],
      e: ["3"],
      i: ["1", "!"],
      o: ["0"],
      s: ["$", "5"],
      t: ["7"],
      g: ["9"],
    };

    let variation = word;
    for (const [char, replacements] of Object.entries(leetMap)) {
      for (const replacement of replacements) {
        variation = variation.replace(new RegExp(char, "gi"), replacement);
        variations.push(variation);
      }
    }

    // Add spacing variations
    variations.push(word.split("").join(" "));
    variations.push(word.split("").join("."));
    variations.push(word.split("").join("-"));

    return [...new Set(variations)];
  }
}

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

  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[ProfanityFilter] ${message}`, ...args);
    }
  }

  private async setupFilters(): Promise<void> {
    try {
      // Dynamic imports for better performance
      const { Filter } = await import("bad-words");
      const { Profanity } = await import("@2toad/profanity");

      this.badWordsFilter = new Filter();
      this.toadProfanity = new Profanity({
        wholeWord: true,
        grawlix: "*#@&%",
        grawlixChar: "*",
        languages: this.config.languages.includes("en") ? ["en"] : [],
      });

      // Try to load leo-profanity
      try {
        const leoProfanity = await import("leo-profanity");
        if (leoProfanity && typeof leoProfanity.check === "function") {
          this.leoProfanityAvailable = true;
        }
      } catch (error) {
        this.log("leo-profanity not available:", error);
      }

      await this.compileWordPatterns();
      await this.addCustomWords();

      this.isInitialized = true;
      this.log("Profanity filter initialized successfully");
    } catch (error) {
      console.error("Failed to initialize profanity filters:", error);
      this.isInitialized = false;
    }
  }

  private async compileWordPatterns(): Promise<void> {
    for (const config of PROFANITY_CONFIG) {
      const patterns: RegExp[] = [];
      const words = new Set<string>();

      // Compile word patterns
      for (const word of config.words) {
        const variations = TextProcessor.getWordVariations(word);
        variations.forEach((variation) => {
          words.add(variation);
          patterns.push(
            new RegExp(`\\b${this.escapeRegExp(variation)}\\b`, "gi"),
          );
        });
      }

      // Add phrase patterns
      for (const phrase of config.phrases) {
        patterns.push(new RegExp(`\\b${this.escapeRegExp(phrase)}\\b`, "gi"));
      }

      // Add existing patterns
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
      this.log("Filters not initialized, skipping custom words");
      return;
    }

    try {
      const allWords = Array.from(CUSTOM_PROFANITY_WORDS.values()).flat();
      const validWords = allWords.filter(
        (word) => word && typeof word === "string" && word.trim().length > 0,
      );

      if (validWords.length === 0) return;

      this.badWordsFilter.addWords(...validWords);
      this.toadProfanity.addWords(validWords);

      if (this.leoProfanityAvailable) {
        const leoProfanity = await import("leo-profanity");
        leoProfanity.add(validWords);
      }

      this.log(`Added ${validWords.length} custom words`);
    } catch (error) {
      console.error("Failed to add custom words:", error);
    }
  }

  private manageCacheSize(): void {
    if (this.cache.size >= this.config.cacheSize) {
      // Remove oldest 10% of entries
      const entriesToRemove = Math.floor(this.config.cacheSize * 0.1);
      const keys = Array.from(this.cache.keys()).slice(0, entriesToRemove);
      keys.forEach((key) => this.cache.delete(key));
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
    return typeof text === "string" && text.length > 0 && text.length <= 10000;
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

    const detectedLanguage = language || TextProcessor.detectLanguage(text);
    const cacheKey = this.getCacheKey(text, method, detectedLanguage);

    this.cacheAttempts++;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.cacheHits++;
      return cached.hasProfanity;
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

  private async performProfanityCheck(
    text: string,
    method: FilterMethod,
    language: Language,
  ): Promise<ProfanityResult> {
    const normalizedText = TextProcessor.normalize(text);
    let hasProfanity = false;
    let confidence = 0;
    const detectedWords: string[] = [];

    try {
      // Pattern matching for specific language
      if (language !== "all") {
        const patterns = this.wordPatterns.get(language) || [];
        for (const pattern of patterns) {
          const matches = normalizedText.match(pattern);
          if (matches) {
            hasProfanity = true;
            detectedWords.push(...matches);
            confidence += 0.3;
          }
        }
        // Direct phrase matching (normalized)
        const config = PROFANITY_CONFIG.find((c) => c.language === language);
        if (config && config.phrases) {
          for (const phrase of config.phrases) {
            const normalizedPhrase = TextProcessor.normalize(phrase);
            if (normalizedPhrase && normalizedText.includes(normalizedPhrase)) {
              hasProfanity = true;
              detectedWords.push(phrase);
              confidence += 0.3;
            }
          }
        }
      }

      // Library-based checking
      if (!this.badWordsFilter || !this.toadProfanity) {
        throw new Error("Filters not properly initialized");
      }

      switch (method) {
        case "fast":
          hasProfanity = hasProfanity || this.badWordsFilter.isProfane(text);
          break;
        case "comprehensive":
          if (this.leoProfanityAvailable) {
            const leoProfanity = await import("leo-profanity");
            hasProfanity = hasProfanity || leoProfanity.check(text);
          } else {
            hasProfanity = hasProfanity || this.badWordsFilter.isProfane(text);
          }
          break;
        case "advanced":
          hasProfanity = hasProfanity || this.toadProfanity.exists(text);
          break;
        case "hybrid":
        default:
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
      const language = TextProcessor.detectLanguage(text);
      let cleaned = text;

      // Apply pattern-based cleaning for specific language
      const patterns = this.wordPatterns.get(language) || [];
      for (const pattern of patterns) {
        cleaned = cleaned.replace(pattern, "***");
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
        case "advanced":
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
        const language = TextProcessor.detectLanguage(text);
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

    const language = TextProcessor.detectLanguage(text);
    const normalizedText = TextProcessor.normalize(text);
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
      totalSize += JSON.stringify(value).length * 2;
    }
    return totalSize;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheAttempts = 0;
    TextProcessor.clearNormalizationCache();
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
