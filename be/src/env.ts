import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z.string().default("info"),
  AZURE_AD_TENANT_ID: z.string().min(1),
  AZURE_AD_API_AUDIENCE: z.string().min(1),
  SKIP_AUTH: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export const env = envSchema.parse(process.env);
