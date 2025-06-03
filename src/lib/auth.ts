import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        (() => {
          throw new Error("GOOGLE_CLIENT_ID is required");
        })(),
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        (() => {
          throw new Error("GOOGLE_CLIENT_SECRET is required");
        })(),
    },
    github: {
      clientId:
        process.env.GITHUB_CLIENT_ID ||
        (() => {
          throw new Error("GITHUB_CLIENT_ID is required");
        })(),
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET ||
        (() => {
          throw new Error("GITHUB_CLIENT_SECRET is required");
        })(),
    },
  },
});
