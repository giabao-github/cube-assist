export type FilterMethod = "fast" | "comprehensive" | "advanced" | "hybrid";
export type Language = "en" | "vi" | "all";

export interface ProfanityResult {
  original: string;
  hasProfanity: boolean;
  cleaned: string;
  detectedLanguage?: Language;
  confidence: number;
}

export interface ProfanityAnalysis {
  badWords: boolean;
  leoProfanity: boolean;
  toadProfanity: boolean;
  consensus: boolean;
  cleanedText: string;
  confidence: number;
  detectedWords: string[];
  language: Language;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

export interface ProfanityWordConfig {
  language: Language;
  words: Set<string>;
  phrases: Set<string>;
  patterns: RegExp[];
}

export interface FilterConfig {
  cacheSize: number;
  debug: boolean;
  languages: Language[];
  strictMode: boolean;
  customWords: Map<Language, string[]>;
}
