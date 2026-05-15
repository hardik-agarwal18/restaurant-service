import { z } from "zod";
import { JwtEnvSchema } from "@rm/auth";

export const EnvSchema = JwtEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3008),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://redis:6379"),
});

export type Env = z.infer<typeof EnvSchema>;
