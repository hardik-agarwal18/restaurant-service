import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { InventoryController } from "./inventory.controller.js";
import { buildInventoryRouter } from "./inventory.routes.js";
import type { InventoryService } from "./inventory.service.js";

function createApp(
  router: express.Router,
  ctx?: { tenantId?: string; userId?: string; permissions?: string[] }
) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (ctx) {
      setContext(req, {
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        permissions: ctx.permissions,
        roles: [],
      });
    }
    next();
  });
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler(createLogger("test")));
  return app;
}

describe("inventory-service inventory routes", () => {
  test("GET /v1/inventory/items enforces auth and permission", async () => {
    const service = {
      listItems: jest.fn(async () => [{ id: "i1" }]),
      createItem: jest.fn(),
    };

    const controller = new InventoryController(service as unknown as InventoryService);
    const router = buildInventoryRouter(controller);

    await request(createApp(router)).get("/v1/inventory/items").expect(401);

    await request(createApp(router, { tenantId: "t1", userId: "u1", permissions: [] }))
      .get("/v1/inventory/items")
      .expect(403);

    await request(
      createApp(router, {
        tenantId: "t1",
        userId: "u1",
        permissions: ["inventory:read"],
      })
    )
      .get("/v1/inventory/items")
      .expect(200, [{ id: "i1" }]);

    expect(service.listItems).toHaveBeenCalledWith("t1");
  });

  test("POST /v1/inventory/items validates body", async () => {
    const service = {
      listItems: jest.fn(),
      createItem: jest.fn(async () => ({ id: "i1" })),
    };

    const controller = new InventoryController(service as unknown as InventoryService);
    const router = buildInventoryRouter(controller);

    const app = createApp(router, {
      tenantId: "t1",
      userId: "u1",
      permissions: ["inventory:update"],
    });

    await request(app).post("/v1/inventory/items").send({ name: "Flour" }).expect(400);

    await request(app)
      .post("/v1/inventory/items")
      .send({ branchId: "b1", name: "Flour", unit: "KG", reorderLevel: 1 })
      .expect(201, { id: "i1" });

    expect(service.createItem).toHaveBeenCalledWith("t1", {
      branchId: "b1",
      name: "Flour",
      unit: "KG",
      reorderLevel: 1,
    });
  });
});
