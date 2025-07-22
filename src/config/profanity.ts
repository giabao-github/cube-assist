import { Language, ProfanityWordConfig } from "@/types/profanity";

const COMPILED_PATTERNS = [
  /(?:^|\s|[^\w])(ass|bull)\s*(fuck(?:ing|ed|er)?|f+u+c+k+)(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])brother\s*f+u+c+k+(?:ing|ed|er)?(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])dick\s*(?:brain|head)(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])dog\s*brain(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])ching\s*chong(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])child\s*f+u+c+k+(?:ing|ed|er)?(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])dumb\s*ass(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])father\s*f+u+c+k+(?:ing|ed|er)?(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])god\s*damn(?:ed|it)?(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])jack\s*ass(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])mother\s*f+u+c+k+(?:ing|ed|er)?(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])son\s*of\s*a\s*(?:bitch|whore)(?:\s|[^\w]|$)/gi,
  /(?:^|\s|[^\w])(?:sibling|sister)\s*f+u+c+k+(?:ing|ed|er)?(?:\s|[^\w]|$)/gi,
].map((pattern) => new RegExp(pattern.source, pattern.flags));

export const PROFANITY_CONFIG: ProfanityWordConfig[] = [
  {
    language: "en",
    words: new Set([
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
      "chingchong",
      "cock",
      "cocksucker",
      "cunt",
      "dick",
      "dogbrain",
      "dumbass",
      "dyke",
      "fag",
      "faggot",
      "fuck",
      "fucked",
      "fucker",
      "fucking",
      "hitler",
      "jackarse",
      "kike",
      "nazi",
      "nigga",
      "nigger",
      "nigra",
      "penis",
      "prick",
      "pussy",
      "slut",
      "spastic",
      "tranny",
      "twat",
      "vagina",
      "wanker",
      "whore",
    ]),
    phrases: new Set([
      "ching chong",
      "dog brain",
      "son of a bitch",
      "son of a whore",
    ]),
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
