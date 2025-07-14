import { z } from "zod";

import { BANNED_WORDS, WEAK_PASSWORDS } from "@/constants/zod";

const hasRedundantSpaces = (value: string) => !/^\s+|\s+$|\s{2,}/.test(value);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .refine(hasRedundantSpaces, "Email must not contain redundant spaces"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" })
    .refine(
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

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Please enter your name" })
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" })
      .refine(hasRedundantSpaces, "Name must not contain redundant spaces")
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
          // Ban offensive or inappropriate words
          const lowerValue = value.toLowerCase();
          return !BANNED_WORDS.some((word) => lowerValue.includes(word));
        },
        { message: "Name contains inappropriate words" },
      )
      .refine(
        (value) => {
          // Prevent excessive special characters (excluding allowed ones)
          const hasExcessiveSpecialChars =
            /[!$%^&*()+=|{}[\]:";<>?,./]{3,}/.test(value);
          return !hasExcessiveSpecialChars;
        },
        { message: "Name contains too many special characters" },
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email address")
      .refine(hasRedundantSpaces, "Email must not contain redundant spaces"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be at most 32 characters" })
      .refine(
        (value) => {
          // At least one letter and one number
          const hasLetter = /[a-zA-Z]/.test(value);
          const hasNumber = /\d/.test(value);

          return hasLetter && hasNumber;
        },
        {
          message: "Password must contain both letters and numbers",
        },
      )
      .refine(
        (value) => {
          return !WEAK_PASSWORDS.includes(value.toLowerCase());
        },
        { message: "Password is too weak" },
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
