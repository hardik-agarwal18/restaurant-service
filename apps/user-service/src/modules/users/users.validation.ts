import { z } from "zod";

export const CreateUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
