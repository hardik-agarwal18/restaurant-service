# RBAC (Role-Based Access Control)

## Model

- `Role` is tenant-scoped (`tenantId`, `name`).
- `Permission` is global (`key`), enabling consistent permission vocabulary across tenants.
- Join tables: `RolePermission`, `UserRole`.

## Permission Keys (examples)

- `orders:create`, `orders:read`, `orders:update`
- `inventory:read`, `inventory:update`
- `pos:bill`
- `admin:manage`

## Enforcement

- JWT contains `roles` and `permissions` arrays (computed at login/refresh).
- Services enforce required permissions at route handlers.
