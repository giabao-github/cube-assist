import { z } from "zod";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string().min(0).max(100),
      }),
    )
    .query((opts) => {
      return {
        greeting: `Hello, ${opts.input.text}!`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
