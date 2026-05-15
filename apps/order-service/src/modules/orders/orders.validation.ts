import { z } from "zod";

export const CreateOrderBodySchema = z.object({
  branchId: z.string().min(1),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        taxPercent: z.number().min(0),
      })
    )
    .min(1),
});

export type CreateOrderBody = z.infer<typeof CreateOrderBodySchema>;
