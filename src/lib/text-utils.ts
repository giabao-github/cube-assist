import { getGlobalFilter } from "@/lib/profanity-filter";

export const sanitizeInputOnBlur = (
  input: string,
  type?: "email" | "phone",
): string => {
  if (type === "email" || type === "phone") {
    return input.replace(/\s+/g, "");
  }
  return input.trim().replace(/\s+/g, " ");
};

export const hasNoRedundantSpaces = (value: string) =>
  !/^[\s]+|[\s]+$|\s{2,}/.test(value);

const leetMap: Record<string, string> = {
  "1": "i",
  "!": "i",
  "3": "e",
  "4": "a",
  "@": "a",
  "5": "s",
  $: "s",
  "7": "t",
  "0": "o",
  "9": "g",
};

export const removeDiacritics = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const normalizeProfanity = (text: string): string => {
  const words = text
    .normalize("NFKC")
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word
        .replace(/[0134@5$709!]/g, (c) => leetMap[c] || c)
        .replace(/[^\p{L}\p{N}]+/gu, "")
        .replace(/([a-z])\1{3,}/g, "$1"),
    )
    .filter(Boolean);

  if (words.length > 1 && words.every((w) => w.length === 1)) {
    return words.join("");
  }

  return words.join(" ");
};

export const extractLocalPart = (email: string): string | null => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const atIndex = email.indexOf("@");

  if (atIndex === -1 || atIndex === 0 || email.lastIndexOf("@") !== atIndex) {
    return null;
  }

  return email.substring(0, atIndex);
};

export const extractDomainPart = (email: string): string | null => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const atIndex = email.indexOf("@");

  if (
    atIndex === -1 ||
    atIndex === email.length - 1 ||
    email.lastIndexOf("@") !== atIndex
  ) {
    return null;
  }

  return email.substring(atIndex + 1);
};

export const extractDomainParts = (
  email: string,
): { domainName: string; tld: string } | null => {
  const domain = extractDomainPart(email);

  if (!domain) {
    return null;
  }

  const lastDotIndex = domain.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === domain.length - 1) {
    return null;
  }

  return {
    domainName: domain.substring(0, lastDotIndex),
    tld: domain.substring(lastDotIndex + 1),
  };
};

export const checkEmailProfanity = async (
  email: string,
): Promise<"fail" | "success" | null> => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const local = extractLocalPart(email);
  const domainParts = extractDomainParts(email);

  if (local === null || domainParts === null) {
    return null;
  }

  const profanityFilter = await getGlobalFilter();
  if (
    (await profanityFilter.containsProfanity(local)) ||
    (await profanityFilter.containsProfanity(domainParts.domainName)) ||
    (await profanityFilter.containsProfanity(domainParts.tld))
  ) {
    return "fail";
  }

  return "success";
};
