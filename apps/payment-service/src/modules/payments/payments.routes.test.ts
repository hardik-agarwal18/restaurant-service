import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { PaymentsController } from "./payments.controller.js";
import { buildPaymentsRouter } from "./payments.routes.js";
import type { PaymentsService } from "./payments.service.js";

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

describe("payment-service payments routes", () => {
  test("POST /v1/payments/capture enforces auth and validates body", async () => {
    const service = {
      capturePayment: jest.fn(async () => ({ id: "p1" })),
    };

    const controller = new PaymentsController(service as unknown as PaymentsService);
    const router = buildPaymentsRouter(controller);

    await request(createApp(router)).post("/v1/payments/capture").send({}).expect(401);

    const app = createApp(router, { tenantId: "t1", userId: "u1" });

    await request(app).post("/v1/payments/capture").send({ orderId: "o1" }).expect(400);

    await request(app)
      .post("/v1/payments/capture")
      .send({ orderId: "o1", method: "CARD", amount: 10 })
      .expect(201, { id: "p1" });

    expect(service.capturePayment).toHaveBeenCalledWith("t1", {
      orderId: "o1",
      method: "CARD",
      amount: 10,
    });
  });
});
