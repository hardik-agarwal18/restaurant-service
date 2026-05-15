import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp, type Options as PinoHttpOptions } from "pino-http";
import crypto from "crypto";
import { registry, httpRequestDurationMs } from "./metrics.js";
import type { Logger } from "./logger.js";

export type RequestContext = {
  requestId: string;
  tenantId?: string;
  userId?: string;
  roles?: string[];
  permissions?: string[];
};

declare global {
  var __rmRequestContext: WeakMap<Request, RequestContext> | undefined;
}

const requestContextStore = globalThis.__rmRequestContext ?? new WeakMap<Request, RequestContext>();
globalThis.__rmRequestContext = requestContextStore;

export function getContext(req: Request): RequestContext {
  const existing = requestContextStore.get(req);
  if (!existing) {
    const ctx: RequestContext = { requestId: crypto.randomUUID() };
    requestContextStore.set(req, ctx);
    return ctx;
  }
  return existing;
}

export function setContext(req: Request, patch: Partial<RequestContext>) {
  const ctx = getContext(req);
  Object.assign(ctx, patch);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "NOT_FOUND", path: req.path });
}

export function errorHandler(logger: Logger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const ctx = getContext(req);
    const e = (typeof err === "object" && err !== null ? (err as Record<string, unknown>) : {}) as
      | Record<string, unknown>
      | undefined;

    const status = typeof e?.status === "number" ? e.status : 500;
    const code = typeof e?.code === "string" ? e.code : status === 500 ? "INTERNAL" : "ERROR";
    const message =
      typeof e?.message === "string"
        ? e.message
        : status === 500
          ? "Internal Server Error"
          : "Error";
    logger.error({ err, requestId: ctx.requestId }, "request failed");
    res.status(status).json({
      error: code,
      message,
      requestId: ctx.requestId,
    });
  };
}

export function tenantMiddleware(headerName = "x-tenant-id") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const tenantId = (req.header(headerName) || "").trim();
    if (tenantId) setContext(req, { tenantId });
    next();
  };
}

export function createBaseApp(logger: Logger, opts?: { corsOrigins?: string[] }): Express {
  const app = express();
  app.disable("x-powered-by");

  if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: opts?.corsOrigins?.length ? opts.corsOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    pinoHttp({
      logger,
      genReqId: (req: Request) => {
        const ctx = getContext(req);
        return ctx.requestId;
      },
    } as unknown as PinoHttpOptions)
  );

  app.use((req, res, next) => {
    const end = httpRequestDurationMs.startTimer();
    res.on("finish", () => {
      const route = req.route?.path ? String(req.route.path) : "(unknown)";
      end({ method: req.method, route, status: String(res.statusCode) });
    });
    next();
  });

  app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));
  app.get("/readyz", (_req, res) => res.status(200).json({ ok: true }));
  app.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", registry.contentType);
    res.status(200).send(await registry.metrics());
  });

  return app;
}
