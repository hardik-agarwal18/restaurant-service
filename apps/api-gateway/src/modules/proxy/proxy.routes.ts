import { Router, type Router as ExpressRouter } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Env } from "../../env.js";

export function buildProxyRouter(env: Env): ExpressRouter {
  const router = Router();

  router.use(
    "/v1/auth",
    createProxyMiddleware({
      target: env.AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path) => `/v1/auth${path}`,
    })
  );

  router.use(
    "/v1/orders",
    createProxyMiddleware({
      target: env.ORDER_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path) => `/v1/orders${path}`,
    })
  );

  router.use(
    "/v1/inventory",
    createProxyMiddleware({
      target: env.INVENTORY_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path) => `/v1/inventory${path}`,
    })
  );

  router.use(
    "/v1/pos",
    createProxyMiddleware({
      target: env.POS_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path) => `/v1/pos${path}`,
    })
  );

  return router;
}
