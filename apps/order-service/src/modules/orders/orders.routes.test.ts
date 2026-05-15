import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { OrdersController } from "./orders.controller.js";
import { buildOrdersRouter } from "./orders.routes.js";
import type { OrdersService } from "./orders.service.js";

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

describe("order-service orders routes", () => {
  test("POST /v1/orders enforces auth and permission", async () => {
    const service = {
      createOrder: jest.fn(async () => ({ id: "o1" })),
    };

    const controller = new OrdersController(service as unknown as OrdersService);
    const router = buildOrdersRouter(controller);

    await request(createApp(router)).post("/v1/orders").send({}).expect(401);

    await request(createApp(router, { tenantId: "t1", userId: "u1", permissions: [] }))
      .post("/v1/orders")
      .send({
        branchId: "b1",
        type: "DINE_IN",
        items: [{ menuItemId: "m1", name: "Pizza", quantity: 1, unitPrice: 10, taxPercent: 0 }],
      })
      .expect(403);

    await request(
      createApp(router, {
        tenantId: "t1",
        userId: "u1",
        permissions: ["orders:create"],
      })
    )
      .post("/v1/orders")
      .send({
        branchId: "b1",
        type: "DINE_IN",
        items: [{ menuItemId: "m1", name: "Pizza", quantity: 1, unitPrice: 10, taxPercent: 0 }],
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
        expect(body.data).toEqual({ id: "o1" });
      });

    expect(service.createOrder).toHaveBeenCalled();
  });

  test("POST /v1/orders validates body", async () => {
    const service = {
      createOrder: jest.fn(async () => ({ id: "o1" })),
    };

    const controller = new OrdersController(service as unknown as OrdersService);
    const router = buildOrdersRouter(controller);

    await request(
      createApp(router, {
        tenantId: "t1",
        userId: "u1",
        permissions: ["orders:create"],
      })
    )
      .post("/v1/orders")
      .send({ branchId: "b1", type: "DINE_IN", items: [] })
      .expect(400);

    expect(service.createOrder).not.toHaveBeenCalled();
  });
});
