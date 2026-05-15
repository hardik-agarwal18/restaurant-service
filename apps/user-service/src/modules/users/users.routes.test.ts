import request from "supertest";
import express from "express";
import { createLogger, errorHandler, notFoundHandler, setContext } from "@rm/platform";
import { UsersController } from "./users.controller.js";
import { buildUsersRouter } from "./users.routes.js";
import type { UsersService } from "./users.service.js";

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

describe("user-service users routes", () => {
  test("POST /v1/users enforces auth and permission", async () => {
    const service = {
      createUser: jest.fn(async () => ({ id: "u1" })),
    };
    const controller = new UsersController(service as unknown as UsersService);
    const router = buildUsersRouter(controller);

    await request(createApp(router)).post("/v1/users").send({}).expect(401);

    await request(createApp(router, { tenantId: "t1", userId: "u0", permissions: [] }))
      .post("/v1/users")
      .send({ email: "a@b.com", name: "A", password: "password123" })
      .expect(403);

    await request(
      createApp(router, {
        tenantId: "t1",
        userId: "u0",
        permissions: ["admin:manage"],
      })
    )
      .post("/v1/users")
      .send({ email: "a@b.com", name: "A", password: "password123" })
      .expect(201, { id: "u1" });

    expect(service.createUser).toHaveBeenCalledWith("t1", {
      email: "a@b.com",
      name: "A",
      password: "password123",
    });
  });

  test("POST /v1/users validates body", async () => {
    const service = {
      createUser: jest.fn(async () => ({ id: "u1" })),
    };
    const controller = new UsersController(service as unknown as UsersService);
    const router = buildUsersRouter(controller);

    await request(
      createApp(router, {
        tenantId: "t1",
        userId: "u0",
        permissions: ["admin:manage"],
      })
    )
      .post("/v1/users")
      .send({ email: "not-an-email", name: "A", password: "password123" })
      .expect(400);

    expect(service.createUser).not.toHaveBeenCalled();
  });
});
