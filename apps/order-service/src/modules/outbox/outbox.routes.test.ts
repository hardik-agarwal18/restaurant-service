import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { OutboxController } from "./outbox.controller.js";
import { buildOutboxRouter } from "./outbox.routes.js";
import type { OutboxService } from "./outbox.service.js";

function createApp(router: express.Router, tenantId?: string) {
  const app = express();
  app.use((req, _res, next) => {
    if (tenantId) setContext(req, { tenantId });
    next();
  });
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler(createLogger("test")));
  return app;
}

describe("order-service outbox routes", () => {
  test("POST /internal/outbox/publish requires tenant context", async () => {
    const service = {
      publishBatch: jest.fn(async () => 0),
    };

    const controller = new OutboxController(service as unknown as OutboxService);
    const app = createApp(buildOutboxRouter(controller));

    await request(app)
      .post("/internal/outbox/publish")
      .expect(400)
      .expect(({ body }) => {
        expect(body.error).toBe("BAD_REQUEST");
      });

    expect(service.publishBatch).not.toHaveBeenCalled();
  });

  test("POST /internal/outbox/publish publishes batch", async () => {
    const service = {
      publishBatch: jest.fn(async () => 3),
    };

    const controller = new OutboxController(service as unknown as OutboxService);
    const app = createApp(buildOutboxRouter(controller), "t1");

    await request(app)
      .post("/internal/outbox/publish")
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
        expect(body.data).toEqual({ published: 3 });
      });

    expect(service.publishBatch).toHaveBeenCalledWith("t1", 50);
  });
});
