import type { CreateOrderBody } from "./orders.validation.js";

export type CreateOrderCommand = {
  tenantId: string;
  userId: string;
  input: CreateOrderBody;
};
