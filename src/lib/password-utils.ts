import z from "zod";
import zxcvbn from "zxcvbn";

import { BREACH_SEVERITY_THRESHOLDS } from "@/constants/numbers";

import { checkPasswordPwned } from "@/lib/hibp-password";

export const addPasswordBreachValidation = async (
  data: { password: string },
  ctx: z.RefinementCtx,
) => {
  if (data.password && zxcvbn(data.password).score >= 2) {
    try {
      const result = await checkPasswordPwned(data.password);
      if (result.isPwned) {
        const severity =
          result.count > BREACH_SEVERITY_THRESHOLDS.CRITICAL
            ? "critical"
            : result.count > BREACH_SEVERITY_THRESHOLDS.HIGH
              ? "high"
              : result.count > BREACH_SEVERITY_THRESHOLDS.MEDIUM
                ? "medium"
                : "low";

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
  if (count > 100000) return "critical";
  if (count > 10000) return "high";
  if (count > 1000) return "medium";
  return "low";
};
