import { z } from "zod";

export const CreateInventoryItemBodySchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  unit: z.enum(["G", "KG", "ML", "L", "PCS"]),
  reorderLevel: z.number().min(0).default(0),
});

export type CreateInventoryItemBody = z.infer<typeof CreateInventoryItemBodySchema>;
