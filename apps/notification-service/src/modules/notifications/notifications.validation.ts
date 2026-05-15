import { z } from "zod";

export const EnqueueTestBodySchema = z.object({
  to: z.string().min(1),
});

export type EnqueueTestBody = z.infer<typeof EnqueueTestBodySchema>;
