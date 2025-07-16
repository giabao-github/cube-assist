import { z } from "zod";
import zxcvbn from "zxcvbn";

import { checkPasswordPwned } from "@/lib/hibp-password";
import profanityFilter from "@/lib/profanity-filter";
import {
  checkEmailProfanity,
  hasNoRedundantSpaces,
  normalizeProfanity,
} from "@/lib/text-utils";

const emailValidation = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .refine(hasNoRedundantSpaces, "Email must not contain redundant spaces")
  .refine((val) => checkEmailProfanity(val) === "success", {
    message: "Email contains inappropriate language",
  });

const passwordValidation = z
  .string()
  .min(1, "Password is required")
  .min(8, { message: "Password must be at least 8 characters" })
  .max(32, { message: "Password must be at most 32 characters" });

export const loginSchema = z
  .object({
    email: emailValidation,
    password: passwordValidation.refine(
      (value) => {
        // At least one letter and one number
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        return hasLetter && hasNumber;
      },
      {
        message: "Password must contain both letters and numbers",
      },
    ),
  })
  .superRefine(async (data, ctx) => {
    if (data.password && zxcvbn(data.password).score >= 2) {
      try {
        const result = await checkPasswordPwned(data.password);
        if (result.isPwned) {
          const severity =
            result.count > 100000
              ? "critical"
              : result.count > 10000
                ? "high"
                : result.count > 1000
                  ? "medium"
                  : "low";

          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: `This password has appeared in public data breaches (${severity})`,
          });
        }
      } catch (error) {
        console.error("HIBP API fails: ", error);
      }
    }
  });
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Please enter your name" })
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" })
      .refine(hasNoRedundantSpaces, "Name must not contain redundant spaces")
      .refine(
        (value) => {
          // Allow Vietnamese characters, letters, numbers, and common username characters
          const validPattern = /^[a-zA-ZÀ-ỹ0-9\s\-_'.@]+$/;
          return validPattern.test(value.trim());
        },
        {
          message: "Name contains invalid characters",
        },
      )
      .refine(
        (value) => {
          // Prevent excessive special characters (excluding allowed ones)
          const hasExcessiveSpecialChars =
            /[!$%^&*()+=|{}\[\]:";,<>?\./]{3,}/.test(value);
          return !hasExcessiveSpecialChars;
        },
        { message: "Name contains too many special characters" },
      )
      .refine(
        (val) => !profanityFilter.containsProfanity(normalizeProfanity(val)),
        {
          message: "Name contains inappropriate language",
        },
      ),
    email: emailValidation,
    password: passwordValidation.refine((value) => zxcvbn(value).score >= 2, {
      message: "Password is too weak",
    }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine(async (data, ctx) => {
    if (data.password && zxcvbn(data.password).score >= 2) {
      try {
        const result = await checkPasswordPwned(data.password);
        if (result.isPwned) {
          const severity =
            result.count > 100000
              ? "critical"
              : result.count > 10000
                ? "high"
                : result.count > 1000
                  ? "medium"
                  : "low";

          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: `This password has appeared in public data breaches (${severity})`,
          });
        }
      } catch (error) {
        console.error("HIBP API fails: ", error);
      }
    }
  });
