import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { RecommendationsController } from "./recommendations.controller.js";
import { buildRecommendationsRouter } from "./recommendations.routes.js";

function createApp(router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler(createLogger("test")));
  return app;
}

describe("ai-recommendation-service recommendations routes", () => {
  test("POST /v1/ai/recommendations/menu validates and returns recommendations", async () => {
    const service = {
      getMenuRecommendations: jest.fn(async (body: { tenantId: string; customerId?: string }) => ({
        tenantId: body.tenantId,
        recommendations: [],
      })),
    };

    const controller = new RecommendationsController(service);
    const app = createApp(buildRecommendationsRouter(controller));

    await request(app).post("/v1/ai/recommendations/menu").send({}).expect(400);

    await request(app)
      .post("/v1/ai/recommendations/menu")
      .send({ tenantId: "t1" })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ tenantId: "t1", recommendations: [] });
      });

    expect(service.getMenuRecommendations).toHaveBeenCalledWith({ tenantId: "t1" });
  });
});
