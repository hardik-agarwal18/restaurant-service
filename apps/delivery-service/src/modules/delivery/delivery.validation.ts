import { z } from "zod";

export const AssignDeliveryBodySchema = z.object({
  orderId: z.string().min(1),
  partner: z.string().optional(),
  riderName: z.string().optional(),
  riderPhone: z.string().optional(),
});

export type AssignDeliveryBody = z.infer<typeof AssignDeliveryBodySchema>;
