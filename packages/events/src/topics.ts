export const Topics = {
  OrderCreated: "order.created",
  OrderStatusUpdated: "order.status.updated",
  PaymentCaptured: "payment.captured",
  InventoryLowStock: "inventory.low_stock",
  ReservationCreated: "reservation.created",
  DeliveryStatusUpdated: "delivery.status.updated",
} as const;

export type Topic = (typeof Topics)[keyof typeof Topics];
