import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { PosController } from "./pos.controller.js";
import { buildPosRouter } from "./pos.routes.js";
import type { PosService } from "./pos.service.js";

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

describe("pos-service pos routes", () => {
  test("POST /v1/pos/pay enforces auth and permission", async () => {
    const service = {
      pay: jest.fn(async () => ({ id: "pay1" })),
    };

    const controller = new PosController(service as unknown as PosService);
    const router = buildPosRouter(controller);

    await request(createApp(router)).post("/v1/pos/pay").send({}).expect(401);

    await request(createApp(router, { tenantId: "t1", userId: "u1", permissions: [] }))
      .post("/v1/pos/pay")
      .send({ orderId: "o1", method: "CASH", amount: 10 })
      .expect(403);

    await request(
      createApp(router, {
        tenantId: "t1",
        userId: "u1",
        permissions: ["pos:bill"],
      })
    )
      .post("/v1/pos/pay")
      .send({ orderId: "o1", method: "CASH", amount: 10 })
      .expect(201, { id: "pay1" });

    expect(service.pay).toHaveBeenCalledWith("t1", {
      orderId: "o1",
      method: "CASH",
      amount: 10,
    });
  });
});
