import { z } from "zod";

export const CreateBranchBodySchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1),
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  phone: z.string().optional(),
});

export type CreateBranchBody = z.infer<typeof CreateBranchBodySchema>;
