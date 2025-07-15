import { Filter } from "bad-words";
import { z } from "zod";
import zxcvbn from "zxcvbn";

import { CUSTOM_PROFANITY_WORDS } from "@/config/profanity-words";

const hasNoRedundantSpaces = (value: string) =>
  !/^[\s]+|[\s]+$|\s{2,}/.test(value);

const emailValidation = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .refine(hasNoRedundantSpaces, "Email must not contain redundant spaces");

const passwordValidation = z
  .string()
  .min(1, "Password is required")
  .min(8, { message: "Password must be at least 8 characters" })
  .max(32, { message: "Password must be at most 32 characters" });

export const loginSchema = z.object({
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
});

const profanityFilter = new Filter();
profanityFilter.addWords(...CUSTOM_PROFANITY_WORDS);

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
      .refine((value) => !profanityFilter.isProfane(value), {
        message: "Name contains inappropriate words",
      })
      .refine(
        (value) => {
          // Prevent excessive special characters (excluding allowed ones)
          const hasExcessiveSpecialChars =
            /[!$%^&*()+=|{}\[\]:";,<>?\./]{3,}/.test(value);
          return !hasExcessiveSpecialChars;
        },
        { message: "Name contains too many special characters" },
      ),
    email: emailValidation,
    password: passwordValidation.refine((value) => zxcvbn(value).score >= 3, {
      message: "Password is too weak",
    }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
