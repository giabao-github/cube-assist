import { z } from "zod";

export const meetingsInsertSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter meeting name" })
    .max(100, { message: "Meeting name must be less than 100 characters" }),
  agentId: z.string().min(1, { message: "Please select an agent" }),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
  id: z.string().min(1, { message: "Meeting ID is required" }),
});
