import { CldFactory, LanguageResult, loadModule } from "cld3-asm";

import {
  CLD3Detector,
  LanguageDetectionOptions,
  LanguageDetectionResult,
} from "@/types/language";
import { Language } from "@/types/profanity";

export class LanguageDetector {
  private static instance: LanguageDetector;
  private cld3Instance: CLD3Detector | null = null;
  private isLoading = false;
  private loadPromise: Promise<CLD3Detector> | null = null;

  private constructor() {}

  public static getInstance(): LanguageDetector {
    if (!LanguageDetector.instance) {
      LanguageDetector.instance = new LanguageDetector();
    }
    return LanguageDetector.instance;
  }

  private async loadCLD3(): Promise<CLD3Detector> {
    if (this.cld3Instance) {
      return this.cld3Instance;
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = loadModule().then((factory: CldFactory) => {
      this.cld3Instance = factory.create();
      this.isLoading = false;
      return this.cld3Instance;
    });

    return this.loadPromise;
  }

  public async detect(
    text: string,
    options: LanguageDetectionOptions = {},
  ): Promise<LanguageDetectionResult> {
    const {
      minLength = 10,
      maxTextLength = 1000,
      fallbackLanguage = "en",
      vietnameseDetectionThreshold = 20,
    } = options;

    if (text.length < vietnameseDetectionThreshold) {
      const vietnameseChars =
        /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi;
      if (vietnameseChars.test(text)) {
        return {
          language: "vi",
          confidence: 1,
          isReliable: true,
          bytes: [],
          proportion: 1,
        };
      }
    }

    // Validate input
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text input: must be a non-empty string");
    }

    // Check minimum length
    if (text.trim().length < minLength) {
      return {
        language: fallbackLanguage,
        confidence: 0,
        isReliable: false,
        bytes: [],
        proportion: 0,
      };
    }

    try {
      const cld3 = await this.loadCLD3();

      const textToAnalyze =
        text.length > maxTextLength ? text.substring(0, maxTextLength) : text;

      const result = cld3.findLanguage(textToAnalyze);

      return {
        language: result.language,
        confidence: result.probability,
        isReliable: result.is_reliable,
        bytes: result.byte_ranges,
        proportion: result.proportion,
      };
    } catch (error) {
      console.error("Language detection failed:", error);

      return {
        language: fallbackLanguage,
        confidence: 0,
        isReliable: false,
        bytes: [],
        proportion: 0,
      };
    }
  }

  public async detectMultiple(
    text: string,
    options: LanguageDetectionOptions = {},
    maxLanguages: number = 3,
  ): Promise<LanguageDetectionResult[]> {
    const {
      minLength = 10,
      maxTextLength = 1000,
      fallbackLanguage = "en",
    } = options;

    if (!text || typeof text !== "string" || text.trim().length < minLength) {
      return [
        {
          language: fallbackLanguage,
          confidence: 0,
          isReliable: false,
          bytes: [],
          proportion: 0,
        },
      ];
    }

    try {
      const cld3 = await this.loadCLD3();
      const textToAnalyze =
        text.length > maxTextLength ? text.substring(0, maxTextLength) : text;

      const results = cld3.findMostFrequentLanguages(
        textToAnalyze,
        maxLanguages,
      );

      return results.map((result: LanguageResult) => ({
        language: result.language || fallbackLanguage,
        confidence: result.probability || 0,
        isReliable: result.is_reliable || false,
        bytes: result.byte_ranges || [],
        proportion: result.proportion || 0,
      }));
    } catch (error) {
      console.error("Multiple language detection failed:", error);
      return [
        {
          language: fallbackLanguage,
          confidence: 0,
          isReliable: false,
          bytes: [],
          proportion: 0,
        },
      ];
    }
  }

  public detectFromContent(text: string): Language {
    const cleanText = text.toLowerCase().trim();

    // Check for Vietnamese characters first (more specific)
    const vietnameseChars =
      /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/;
    if (vietnameseChars.test(cleanText)) {
      return "vi";
    }

    // Check against known English profanity words
    const englishProfanityIndicators = [
      "fuck",
      "ass",
      "bitch",
      "cock",
      "dick",
      "pussy",
      "cunt",
      "motherfuck",
      "bullshit",
      "jackass",
      "dumbass",
      "asshole",
      "bastard",
      "prick",
      "slut",
      "whore",
      "fag",
      "nigger",
      "retard",
      "gay",
      "lesbian",
      "tranny",
      "dyke",
      "kike",
      "nazi",
    ];

    for (const indicator of englishProfanityIndicators) {
      if (cleanText.includes(indicator)) {
        return "en";
      }
    }

    // Check for Latin alphabet (likely English)
    const hasLatinChars = /[a-z]/i.test(cleanText);
    const hasOnlyLatinAndCommon =
      /^[a-z0-9\s.,!?@#$%^&*()_+\-=\[\]{}|;':"\\/<>?`~]*$/i.test(cleanText);

    if (hasLatinChars && hasOnlyLatinAndCommon) {
      return "en";
    }

    return "all";
  }

  public isDetectionReliable(
    result: LanguageDetectionResult,
    confidenceThreshold: number = 0.8,
  ): boolean {
    return result.isReliable && result.confidence > confidenceThreshold;
  }

  public getLanguageName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ar: "Arabic",
      hi: "Hindi",
      th: "Thai",
      vi: "Vietnamese",
      nl: "Dutch",
      pl: "Polish",
      tr: "Turkish",
      sv: "Swedish",
      da: "Danish",
      no: "Norwegian",
      fi: "Finnish",
      el: "Greek",
      he: "Hebrew",
      cs: "Czech",
      hu: "Hungarian",
      ro: "Romanian",
      bg: "Bulgarian",
      hr: "Croatian",
      sk: "Slovak",
      sl: "Slovenian",
      et: "Estonian",
      lv: "Latvian",
      lt: "Lithuanian",
      uk: "Ukrainian",
      be: "Belarusian",
      mk: "Macedonian",
      sq: "Albanian",
      sr: "Serbian",
      bs: "Bosnian",
      me: "Montenegrin",
      is: "Icelandic",
      mt: "Maltese",
      ga: "Irish",
      cy: "Welsh",
      eu: "Basque",
      ca: "Catalan",
      gl: "Galician",
      af: "Afrikaans",
      sw: "Swahili",
      zu: "Zulu",
      xh: "Xhosa",
      id: "Indonesian",
      ms: "Malay",
      tl: "Filipino",
      bn: "Bengali",
      ur: "Urdu",
      pa: "Punjabi",
      ta: "Tamil",
      te: "Telugu",
      ml: "Malayalam",
      kn: "Kannada",
      gu: "Gujarati",
      or: "Odia",
      mr: "Marathi",
      ne: "Nepali",
      si: "Sinhala",
      my: "Myanmar",
      km: "Khmer",
      lo: "Lao",
      ka: "Georgian",
      am: "Amharic",
      ti: "Tigrinya",
      om: "Oromo",
      so: "Somali",
      rw: "Kinyarwanda",
      yo: "Yoruba",
      ig: "Igbo",
      ha: "Hausa",
      st: "Sesotho",
      tn: "Setswana",
      ss: "Siswati",
      ve: "Tshivenda",
      ts: "Xitsonga",
      nr: "Ndebele",
    };

    return languageNames[languageCode] || languageCode.toUpperCase();
  }
}
