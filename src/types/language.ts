import type { LanguageCode, LanguageResult, SpanInfo } from "cld3-asm";

export interface CLD3Detector {
  findLanguage(text: string): LanguageResult;
  findMostFrequentLanguages(text: string, count: number): LanguageResult[];
}

export interface LanguageDetectionResult {
  language: LanguageCode;
  confidence: number;
  isReliable: boolean;
  bytes: SpanInfo[];
  proportion: number;
}

export interface LanguageDetectionOptions {
  minLength?: number;
  maxTextLength?: number;
  fallbackLanguage?: string;
}
