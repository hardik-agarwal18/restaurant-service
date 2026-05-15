import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { RestaurantsController } from "./restaurants.controller.js";
import { buildRestaurantsRouter } from "./restaurants.routes.js";
import type { RestaurantsService } from "./restaurants.service.js";

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

describe("restaurant-service restaurants routes", () => {
  test("GET /v1/restaurants enforces auth", async () => {
    const service = {
      listRestaurants: jest.fn(async () => [{ id: "r1" }]),
      createBranch: jest.fn(),
    };

    const controller = new RestaurantsController(service as unknown as RestaurantsService);
    const router = buildRestaurantsRouter(controller);

    await request(createApp(router)).get("/v1/restaurants").expect(401);

    await request(createApp(router, { tenantId: "t1", userId: "u1" }))
      .get("/v1/restaurants")
      .expect(200, [{ id: "r1" }]);

    expect(service.listRestaurants).toHaveBeenCalledWith("t1");
  });

  test("POST /v1/branches enforces permission and validates body", async () => {
    const service = {
      listRestaurants: jest.fn(),
      createBranch: jest.fn(async () => ({ id: "b1" })),
    };

    const controller = new RestaurantsController(service as unknown as RestaurantsService);
    const router = buildRestaurantsRouter(controller);

    await request(createApp(router, { tenantId: "t1", userId: "u1", permissions: [] }))
      .post("/v1/branches")
      .send({})
      .expect(403);

    const app = createApp(router, {
      tenantId: "t1",
      userId: "u1",
      permissions: ["admin:manage"],
    });

    await request(app).post("/v1/branches").send({}).expect(400);

    await request(app)
      .post("/v1/branches")
      .send({
        restaurantId: "r1",
        name: "Main",
        addressLine1: "1 Road",
        city: "X",
        state: "Y",
        postalCode: "Z",
      })
      .expect(201, { id: "b1" });

    expect(service.createBranch).toHaveBeenCalledWith("t1", {
      restaurantId: "r1",
      name: "Main",
      addressLine1: "1 Road",
      city: "X",
      state: "Y",
      postalCode: "Z",
    });
  });
});
