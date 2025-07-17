import z from "zod";
import zxcvbn from "zxcvbn";

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
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Unable to verify password security",
        fatal: false,
      });
    }
  }
};
