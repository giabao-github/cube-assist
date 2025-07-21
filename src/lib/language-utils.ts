import { LRUCache } from "lru-cache";

import { DIACRITICS_MAP } from "@/constants/languages";

import { LanguageDetector } from "@/lib/language";

import {
  LanguageDetectionOptions,
  LanguageDetectionResult,
} from "@/types/language";

const NORMALIZATION_CACHE = new LRUCache<string, string>({
  max: 10000,
  ttl: 1000 * 60 * 60,
});

export const normalize = (text: string): string => {
  if (NORMALIZATION_CACHE.has(text)) {
    return NORMALIZATION_CACHE.get(text)!;
  }

  // Normalize Unicode and remove zero-width/invisible chars
  let normalized = text
    .normalize("NFC")
    .replace(/[\u200B\u200C\uFEFF\u00AD]/g, "")
    .toLowerCase()
    .trim();

  // Remove Vietnamese diacritics
  const diacriticsPattern = new RegExp(
    `[${Array.from(DIACRITICS_MAP.keys()).join("")}]`,
    "g",
  );
  normalized = normalized.replace(
    diacriticsPattern,
    (char) => DIACRITICS_MAP.get(char) || char,
  );

  // Remove special characters and normalize whitespace
  normalized = normalized
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  NORMALIZATION_CACHE.set(text, normalized);
  return normalized;
};

export const detectLanguage = async (
  text: string,
  options?: LanguageDetectionOptions,
): Promise<LanguageDetectionResult> => {
  const detector = LanguageDetector.getInstance();
  return detector.detect(text, options);
};

export const clearNormalizationCache = (): void => {
  NORMALIZATION_CACHE.clear();
};

export const getWordVariations = (word: string): string[] => {
  const variations = [word];

  // Add common leet-speak variations
  const leetMap: Record<string, string[]> = {
    a: ["@", "4"],
    e: ["3"],
    i: ["1", "!"],
    o: ["0"],
    s: ["$", "5"],
    t: ["7"],
    g: ["9"],
  };

  for (const [char, replacements] of Object.entries(leetMap)) {
    for (const replacement of replacements) {
      const variation = word.replace(new RegExp(char, "gi"), replacement);
      variations.push(variation);
    }
  }

  // Add spacing variations
  variations.push(word.split("").join(" "));
  variations.push(word.split("").join("."));
  variations.push(word.split("").join("-"));

  return [...new Set(variations)];
};
