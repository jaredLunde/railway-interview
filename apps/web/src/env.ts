import { z } from "zod";

export const serverSchema = z.object({
  /**
   * A publicly accessible URL for the server. This is used for generating
   * absolute URLs for emails and other things.
   */
  PUBLIC_RAILWAY_PUBLIC_DOMAIN: z.string().default("localhost:3000"),

  /**
   * A publicly accessible URL for the server. This is used for generating
   * absolute URLs for emails and other things.
   */
  PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
});

// @ts-expect-error: could fix
const serverEnv = serverSchema.safeParse(import.meta.env);

if (!serverEnv.success) {
  console.error(serverEnv.error);
  throw new Error("❌ Invalid environment variables");
}

export const env = serverEnv.data;
