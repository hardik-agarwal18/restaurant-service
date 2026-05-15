import type { Prisma, PrismaClient } from "@prisma/client";

export type InventoryItemRow = Prisma.InventoryItemGetPayload<{}>;

export class InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listItems(tenantId: string): Promise<InventoryItemRow[]> {
    return this.prisma.inventoryItem.findMany({ where: { tenantId } });
  }

  async createItem(
    tenantId: string,
    input: {
      branchId: string;
      name: string;
      unit: "G" | "KG" | "ML" | "L" | "PCS";
      reorderLevel: number;
    }
  ): Promise<InventoryItemRow> {
    return this.prisma.inventoryItem.create({
      data: {
        tenantId,
        branchId: input.branchId,
        name: input.name,
        unit: input.unit,
        reorderLevel: input.reorderLevel,
      },
    });
  }
}
