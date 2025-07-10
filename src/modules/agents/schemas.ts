import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z.string().min(1, { message: "Please enter agent name" }),
  instructions: z
    .string()
    .min(1, { message: "Please enter agent instructions" }),
});
