import { z } from "zod";

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3010),
  REDIS_URL: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
