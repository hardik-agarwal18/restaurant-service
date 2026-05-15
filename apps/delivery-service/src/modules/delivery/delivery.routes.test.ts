import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { DeliveryController } from "./delivery.controller.js";
import { buildDeliveryRouter } from "./delivery.routes.js";
import type { DeliveryService } from "./delivery.service.js";

function createApp(router: express.Router, ctx?: { tenantId?: string; userId?: string }) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (ctx) {
      setContext(req, {
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        permissions: [],
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

describe("delivery-service delivery routes", () => {
  test("POST /v1/delivery/assign enforces auth and validates body", async () => {
    const service = {
      assign: jest.fn(async () => ({ orderId: "o1" })),
    };

    const controller = new DeliveryController(service as unknown as DeliveryService);
    const router = buildDeliveryRouter(controller);

    await request(createApp(router)).post("/v1/delivery/assign").send({}).expect(401);

    const app = createApp(router, { tenantId: "t1", userId: "u1" });

    await request(app).post("/v1/delivery/assign").send({}).expect(400);

    await request(app)
      .post("/v1/delivery/assign")
      .send({ orderId: "o1" })
      .expect(200, { orderId: "o1" });

    expect(service.assign).toHaveBeenCalledWith("t1", { orderId: "o1" });
  });
});
