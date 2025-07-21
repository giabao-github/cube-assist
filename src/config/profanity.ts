import { Language, ProfanityWordConfig } from "@/types/profanity";

const COMPILED_PATTERNS = [
  /\b(ass|bull)\s*(fuck|fucking|fucked|fucker)\b/gi,
  /\bbrother[- ]?(fuck|fucking|fucked|fucker)\b/gi,
  /\bdick[- ]?brain\b/gi,
  /\bdick[- ]?head\b/gi,
  /\bdog[- ]?brain\b/gi,
  /\bching[- ]?chong\b/gi,
  /\bchild[- ]?(fuck|fucking|fucked|fucker)\b/gi,
  /\bdumb[- ]?ass\b/gi,
  /\bfather[- ]?(fuck|fucking|fucked|fucker)\b/gi,
  /\bgod ?damn(ed|it)?\b/gi,
  /\bjack[- ]?ass\b/gi,
  /\bmother[- ]?(fuck|fucking|fucked|fucker)\b/gi,
  /\bson of a (bitch|whore)\b/gi,
  /\bsibling[- ]?(fuck|fucking|fucked|fucker)\b/gi,
  /\bsister[- ]?(fuck|fucking|fucked|fucker)\b/gi,
].map((pattern) => new RegExp(pattern.source, pattern.flags));

export const PROFANITY_CONFIG: ProfanityWordConfig[] = [
  {
    language: "en",
    words: new Set([
      "arse",
      "arsefuck",
      "arsehole",
      "arseholehead",
      "ass",
      "asshole",
      "assholehead",
      "asslick",
      "bitch",
      "bollocks",
      "bugger",
      "cock",
      "cocksucker",
      "cunt",
      "dick",
      "dyke",
      "fag",
      "faggot",
      "fuck",
      "fucked",
      "fucker",
      "fucking",
      "hitler",
      "horseshit",
      "jackarse",
      "kike",
      "nazi",
      "nigga",
      "nigger",
      "nigra",
      "prick",
      "pussy",
      "slut",
      "spastic",
      "tranny",
      "twat",
      "wanker",
    ]),
    phrases: new Set(["Jesus wept", "sweet Jesus"]),
    patterns: [...COMPILED_PATTERNS],
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
let customProfanityWords: Map<Language, string[]> | null = null;

export const getCustomProfanityWords = (): Map<Language, string[]> => {
  if (!customProfanityWords) {
    customProfanityWords = new Map<Language, string[]>(
      PROFANITY_CONFIG.map((config) => [
        config.language,
        [...config.words, ...config.phrases],
      ]),
    );
  }
  return customProfanityWords;
};
