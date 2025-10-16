import z from "zod";
import zxcvbn from "zxcvbn";

import { BREACH_SEVERITY_THRESHOLDS } from "@/constants/numbers";

import { checkPasswordPwned } from "@/lib/password/hibp-password";

export const analyzePassword = (password: string) => {
  if (!password)
    return { score: 0, feedback: { suggestions: [], warning: "" } };

  const score = zxcvbn(password).score;
  const feedback = { suggestions: [] as string[], warning: "" };

  // Generate feedback
  if (password.length < 8)
    feedback.suggestions.push("Use at least 8 characters");
  if (!/[a-z]/.test(password))
    feedback.suggestions.push("Add lowercase letters");
  if (!/[A-Z]/.test(password))
    feedback.suggestions.push("Add uppercase letters");
  if (!/\d/.test(password)) feedback.suggestions.push("Add numbers");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    feedback.suggestions.push("Add special characters");

  if (score <= 0.5) feedback.warning = "This password is very weak";
  else if (score <= 1) feedback.warning = "This password is weak";
  else if (score <= 1.5) feedback.warning = "This password is fair";
  else if (score <= 2) feedback.warning = "This password is good";
  else feedback.warning = "This password is strong";

  return { score, feedback };
};

export const checkPasswordBreach = async (password: string) => {
  if (password && zxcvbn(password).score >= 1) {
    try {
      const result = await checkPasswordPwned(password);
      if (result.isPwned) {
        const severity = categorizeBreachSeverity(result.count);
        return {
          isPwned: true,
          count: result.count,
          severity,
        };
      }
    } catch (error) {
      console.error("HIBP API failed: ", error);
    }
  }
};
export const addPasswordBreachValidation = async (
  data: { password: string },
  ctx: z.RefinementCtx,
) => {
  if (data.password && zxcvbn(data.password).score >= 1) {
    try {
      const result = await checkPasswordPwned(data.password);
      if (result.isPwned) {
        const severity = categorizeBreachSeverity(result.count);

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: `This password has appeared in public data breaches (${severity})`,
        });
      }
    } catch (error) {
      console.error("HIBP API failed: ", error);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Unable to verify password security",
        fatal: false,
      });
    }
  }
};

export const categorizeBreachSeverity = (
  count: number,
): "critical" | "high" | "medium" | "low" => {
  if (count > BREACH_SEVERITY_THRESHOLDS.CRITICAL) return "critical";
  if (count > BREACH_SEVERITY_THRESHOLDS.HIGH) return "high";
  if (count > BREACH_SEVERITY_THRESHOLDS.MEDIUM) return "medium";
  return "low";
};
