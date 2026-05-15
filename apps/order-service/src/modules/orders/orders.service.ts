import { Prisma } from "@prisma/client";
import type { CreateOrderCommand } from "./orders.types.js";
import type { OrdersRepository, OrderWithItems } from "./orders.repository.js";

function moneyDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(2);
}

function percentDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(2);
}

export class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  async createOrder(cmd: CreateOrderCommand): Promise<OrderWithItems> {
    const { tenantId } = cmd;
    const { branchId, type, items } = cmd.input;

    let subtotal = new Prisma.Decimal(0);
    let taxTotal = new Prisma.Decimal(0);

    const normalizedItems = items.map((i) => {
      const unitPrice = moneyDecimal(i.unitPrice);
      const taxPercent = percentDecimal(i.taxPercent);
      const lineTotal = unitPrice.mul(i.quantity).toDecimalPlaces(2);
      const lineTax = lineTotal.mul(taxPercent).div(100).toDecimalPlaces(2);

      subtotal = subtotal.add(lineTotal);
      taxTotal = taxTotal.add(lineTax);

      return {
        menuItemId: i.menuItemId,
        nameSnapshot: i.name,
        quantity: i.quantity,
        unitPrice,
        taxPercent,
        total: lineTotal,
      };
    });

    subtotal = subtotal.toDecimalPlaces(2);
    taxTotal = taxTotal.toDecimalPlaces(2);
    const grandTotal = subtotal.add(taxTotal).toDecimalPlaces(2);

    return this.repo.createOrderWithOutbox({
      tenantId,
      branchId,
      type,
      subtotal,
      taxTotal,
      grandTotal,
      items: normalizedItems,
    });
  }
}
