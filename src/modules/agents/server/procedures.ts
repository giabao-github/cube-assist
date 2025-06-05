import { db } from "@/db";
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const agentsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db.select().from(agents);

    // Test loading and error state
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // throw new TRPCError({ code: "BAD_REQUEST" });

    return data;
  }),
});
