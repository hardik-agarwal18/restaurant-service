import type { PrismaClient } from "@prisma/client";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveUserByEmail(tenantId: string, email: string) {
    return this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  async findActiveUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  async createSession(input: {
    tenantId: string;
    userId: string;
    refreshTokenHash: string;
    rotation: number;
    userAgent?: string;
    ip?: string;
    deviceId?: string;
  }): Promise<{ id: string; rotation: number }> {
    const created = await this.prisma.userSession.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        rotation: input.rotation,
        userAgent: input.userAgent,
        ip: input.ip,
        deviceId: input.deviceId,
      },
      select: { id: true, rotation: true },
    });

    return created;
  }

  async getSessionById(sessionId: string) {
    return this.prisma.userSession.findUnique({ where: { id: sessionId } });
  }

  async updateSession(
    sessionId: string,
    patch: {
      refreshTokenHash?: string;
      rotation?: number;
      lastUsedAt?: Date;
      revokedAt?: Date;
    }
  ) {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: patch,
    });
  }
}
