import { Language, ProfanityWordConfig } from "@/types/profanity";

export const PROFANITY_CONFIG: ProfanityWordConfig[] = [
  {
    language: "en",
    words: new Set([
      "assfuck",
      "bullfuck",
      "chinkchong",
      "dogbrain",
      "retarded",
      "hitler",
    ]),
    phrases: new Set(["bull fuck", "chink chong", "dog brain"]),
    patterns: [
      /\b(ass|bull)\s*fuck\b/gi,
      /\bdog\s*brain\b/gi,
      /\bchink\s*chong\b/gi,
    ],
  },
  {
    language: "vi",
    words: new Set([
      "buồi",
      "cặc",
      "chịch",
      "cứt",
      "dái",
      "đít",
      "đĩ",
      "địt",
      "đụ",
      "lồn",
      "óc",
    ]),
    phrases: new Set([
      "âm đạo",
      "dương vật",
      "chó chết",
      "chó đẻ",
      "hột le",
      "súc sinh",
      "súc vật",
      "tinh dịch",
      "tinh trùng",
      "xuất tinh",
    ]),
    patterns: [
      /\b(chó\s*(chết|đẻ))\b/gi,
      /\b(súc\s*(sinh|vật))\b/gi,
      /\b(tinh\s*(dịch|trùng))\b/gi,
    ],
  },
];

// Optimized flattening with language context
export const CUSTOM_PROFANITY_WORDS = new Map<Language, string[]>(
  PROFANITY_CONFIG.map((config) => [
    config.language,
    [...config.words, ...config.phrases],
  ]),
);
