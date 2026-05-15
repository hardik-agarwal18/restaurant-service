import { z } from "zod";

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3012),
});

export type Env = z.infer<typeof EnvSchema>;
