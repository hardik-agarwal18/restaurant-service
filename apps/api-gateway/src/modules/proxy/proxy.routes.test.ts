import request from "supertest";
import express from "express";
import http from "http";
import type { AddressInfo } from "net";
import type { Env } from "../../env.js";
import { buildProxyRouter } from "./proxy.routes.js";

function listen(app: express.Express): Promise<{ server: http.Server; baseUrl: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const addr = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

describe("api-gateway proxy routes", () => {
  test("proxies /v1/auth to auth service target", async () => {
    const target = express();
    target.get("/v1/auth/ping", (_req, res) => res.status(200).json({ ok: true }));

    const { server, baseUrl } = await listen(target);

    try {
      const env = {
        AUTH_SERVICE_URL: baseUrl,
        ORDER_SERVICE_URL: baseUrl,
        INVENTORY_SERVICE_URL: baseUrl,
        POS_SERVICE_URL: baseUrl,
      } as unknown as Env;

      const gateway = express();
      gateway.use(buildProxyRouter(env));

      await request(gateway).get("/v1/auth/ping").expect(200, { ok: true });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
  });
});
