import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { NotificationsController } from "./notifications.controller.js";
import type { NotificationsService } from "./notifications.service.js";
import { buildNotificationsRouter } from "./notifications.routes.js";

function createApp(router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler(createLogger("test")));
  return app;
}

describe("notification-service notifications routes", () => {
  test("POST /internal/queues/enqueue-test validates body", async () => {
    const service = {
      enqueueTestSms: jest.fn(async (_to: string) => undefined),
    };
    const controller = new NotificationsController(service as unknown as NotificationsService);
    const app = createApp(buildNotificationsRouter(controller));

    await request(app).post("/internal/queues/enqueue-test").send({}).expect(400);

    await request(app)
      .post("/internal/queues/enqueue-test")
      .send({ to: "999" })
      .expect(202, { ok: true });

    expect(service.enqueueTestSms).toHaveBeenCalledWith("999");
  });
});
