import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter agent name" })
    .max(100, { message: "Agent name must be less than 100 characters" }),
  instructions: z
    .string()
    .min(1, { message: "Please enter agent instructions" })
    .max(2000, {
      message: "Agent instructions must be less than 2000 characters",
    }),
});

export const agentsUpdateSchema = agentsInsertSchema.extend({
  id: z.string().min(1, { message: "Agent ID is required" }),
});
