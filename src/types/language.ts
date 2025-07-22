import type { LanguageResult, SpanInfo } from "cld3-asm";

import { Language } from "@/types/profanity";

export interface CLD3Detector {
  findLanguage(text: string): LanguageResult;
  findMostFrequentLanguages(text: string, count: number): LanguageResult[];
}

export interface LanguageDetectionResult {
  language: Language;
  confidence: number;
  isReliable: boolean;
  bytes: SpanInfo[];
  proportion: number;
}

export interface LanguageDetectionOptions {
  minLength?: number;
  maxTextLength?: number;
  fallbackLanguage?: Language;
  vietnameseDetectionThreshold?: number;
}
