import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { AnalyticsController } from "./analytics.controller.js";
import { buildAnalyticsRouter } from "./analytics.routes.js";

function createApp(router: express.Router) {
  const app = express();
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler(createLogger("test")));
  return app;
}

describe("analytics-service analytics routes", () => {
  test("GET /v1/analytics/summary returns not implemented", async () => {
    const service = {
      getSummary: jest.fn(async () => ({ error: "NOT_IMPLEMENTED" })),
    };

    const controller = new AnalyticsController(service);
    const app = createApp(buildAnalyticsRouter(controller));

    await request(app)
      .get("/v1/analytics/summary")
      .expect(501)
      .expect({ error: "NOT_IMPLEMENTED" });

    expect(service.getSummary).toHaveBeenCalled();
  });
});
