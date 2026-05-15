import { z } from "zod";

export type EnvShape<T extends z.ZodTypeAny> = z.infer<T>;

export function loadEnv<T extends z.ZodTypeAny>(schema: T, source = process.env): z.infer<T> {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment variables: ${message}`);
  }
  return parsed.data;
}
