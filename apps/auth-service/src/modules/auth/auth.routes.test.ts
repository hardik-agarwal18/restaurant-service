import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { createLogger, errorHandler, notFoundHandler, tenantMiddleware } from "@rm/platform";
import type { Env } from "../../env.js";
import { AuthController } from "./auth.controller.js";
import type { AuthService } from "./auth.service.js";
import { buildAuthRouter } from "./auth.routes.js";

type CsrfRequest = Request & { csrfToken: () => string };

function csrfStub(_req: Request, _res: Response, next: NextFunction) {
  (_req as unknown as CsrfRequest).csrfToken = () => "csrf";
  next();
}

function createApp(router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(tenantMiddleware());
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler(createLogger("test")));
  return app;
}

describe("auth-service auth routes", () => {
  const env = {
    COOKIE_SECURE: false,
    COOKIE_DOMAIN: "",
    REFRESH_TOKEN_TTL_SECONDS: 60,
  } as unknown as Env;

  test("GET /v1/csrf returns token", async () => {
    const service = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
    };

    const controller = new AuthController(env, service as unknown as AuthService);
    const app = createApp(buildAuthRouter(controller, { csrfProtection: csrfStub }));

    await request(app).get("/v1/csrf").expect(200, { csrfToken: "csrf" });
  });

  test("POST /v1/auth/login requires tenant context", async () => {
    const service = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
    };

    const controller = new AuthController(env, service as unknown as AuthService);
    const app = createApp(buildAuthRouter(controller, { csrfProtection: csrfStub }));

    await request(app)
      .post("/v1/auth/login")
      .send({ email: "a@b.com", password: "password123" })
      .expect(400)
      .expect(({ body }) => {
        expect(body.error).toBe("TENANT_REQUIRED");
      });
  });

  test("POST /v1/auth/login sets refresh cookie and returns access token", async () => {
    const service = {
      login: jest.fn(async () => ({ accessToken: "access", refreshToken: "refresh" })),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
    };

    const controller = new AuthController(env, service as unknown as AuthService);
    const app = createApp(buildAuthRouter(controller, { csrfProtection: csrfStub }));

    const res = await request(app)
      .post("/v1/auth/login")
      .set("x-tenant-id", "t1")
      .send({ email: "a@b.com", password: "password123" })
      .expect(200);

    expect(res.body).toEqual({ accessToken: "access" });
    expect(String(res.header["set-cookie"])).toContain("rm_refresh=");
  });

  test("POST /v1/auth/refresh requires refresh cookie", async () => {
    const service = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
    };

    const controller = new AuthController(env, service as unknown as AuthService);
    const app = createApp(buildAuthRouter(controller, { csrfProtection: csrfStub }));

    await request(app)
      .post("/v1/auth/refresh")
      .set("x-tenant-id", "t1")
      .expect(401)
      .expect(({ body }) => {
        expect(body.error).toBe("NO_REFRESH");
      });
  });

  test("POST /v1/auth/logout returns ok", async () => {
    const service = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(async () => undefined),
      me: jest.fn(),
    };

    const controller = new AuthController(env, service as unknown as AuthService);
    const app = createApp(buildAuthRouter(controller, { csrfProtection: csrfStub }));

    await request(app)
      .post("/v1/auth/logout")
      .set("Cookie", "rm_refresh=refresh")
      .expect(200, { ok: true });

    expect(service.logout).toHaveBeenCalledWith("refresh");
  });

  test("GET /v1/auth/me returns 401 without bearer token", async () => {
    const service = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(() => {
        throw Object.assign(new Error("Unauthorized"), { status: 401, code: "UNAUTHORIZED" });
      }),
    };

    const controller = new AuthController(env, service as unknown as AuthService);
    const app = createApp(buildAuthRouter(controller, { csrfProtection: csrfStub }));

    await request(app).get("/v1/auth/me").expect(401);
  });
});
