import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@rm/auth";
import type { Env } from "../env.js";

export function jwtOptionalMiddleware(env: Env) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.header("authorization");
    if (auth?.startsWith("Bearer ")) {
      try {
        verifyAccessToken(env, auth.slice("Bearer ".length));
      } catch {
        // ignore; services will enforce per-route
      }
    }
    next();
  };
}
