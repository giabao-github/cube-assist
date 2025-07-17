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
