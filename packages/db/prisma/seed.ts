import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@rm/auth";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant_demo" },
    update: {},
    create: {
      id: "tenant_demo",
      name: "Demo Foods",
      businessType: "RESTAURANT",
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { id: "rest_demo" },
    update: {},
    create: {
      id: "rest_demo",
      tenantId: tenant.id,
      name: "Demo Restaurant",
      gstin: "",
    },
  });

  await prisma.branch.upsert({
    where: { id: "branch_demo" },
    update: {},
    create: {
      id: "branch_demo",
      tenantId: tenant.id,
      restaurantId: restaurant.id,
      name: "Main Branch",
      addressLine1: "123 Main St",
      city: "City",
      state: "State",
      postalCode: "000000",
      phone: "+1000000000",
    },
  });

  await prisma.permission.createMany({
    data: [
      { key: "orders:create" },
      { key: "orders:read" },
      { key: "orders:update" },
      { key: "inventory:read" },
      { key: "inventory:update" },
      { key: "pos:bill" },
      { key: "admin:manage" },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "ADMIN" } },
    update: {},
    create: { tenantId: tenant.id, name: "ADMIN" },
  });

  const perms = await prisma.permission.findMany({});
  await prisma.rolePermission.createMany({
    data: perms.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@demo.local" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@demo.local",
      name: "Admin",
      passwordHash: await hashPassword("Admin@12345"),
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
