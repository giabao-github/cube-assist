import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = async (req: Request) => {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: createTRPCContext,
      onError: (opts) => {
        console.error("tRPC error:", opts.error);
      },
    });
  } catch (error) {
    console.error("tRPC handler error:", error);
    throw error;
  }
};
export { handler as GET, handler as POST };
