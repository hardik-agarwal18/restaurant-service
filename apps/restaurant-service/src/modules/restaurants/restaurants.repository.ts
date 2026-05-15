import type { Prisma, PrismaClient } from "@prisma/client";

export type RestaurantRow = Prisma.RestaurantGetPayload<{}>;
export type BranchRow = Prisma.BranchGetPayload<{}>;

export class RestaurantsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRestaurants(tenantId: string): Promise<RestaurantRow[]> {
    return this.prisma.restaurant.findMany({ where: { tenantId } });
  }

  async createBranch(
    tenantId: string,
    input: {
      restaurantId: string;
      name: string;
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
      phone?: string;
    }
  ): Promise<BranchRow> {
    return this.prisma.branch.create({
      data: {
        tenantId,
        restaurantId: input.restaurantId,
        name: input.name,
        addressLine1: input.addressLine1,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        phone: input.phone,
      },
    });
  }
}
