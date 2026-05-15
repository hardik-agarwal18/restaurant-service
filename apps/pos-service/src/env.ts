import { z } from "zod";
import { JwtEnvSchema } from "@rm/auth";

export const EnvSchema = JwtEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3004),
  DATABASE_URL: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
