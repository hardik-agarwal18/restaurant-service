import type { PrismaClient } from "@prisma/client";

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(
    tenantId: string,
    input: { email: string; name: string; passwordHash: string }
  ): Promise<{ id: string }> {
    const created = await this.prisma.user.create({
      data: {
        tenantId,
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
      },
      select: { id: true },
    });
    return { id: created.id };
  }
}
