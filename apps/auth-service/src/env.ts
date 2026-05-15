import { z } from "zod";
import { JwtEnvSchema } from "@rm/auth";

export const EnvSchema = JwtEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_DOMAIN: z.string().optional().default(""),
});

export type Env = z.infer<typeof EnvSchema>;
