import type { NextFunction, Request, Response } from "express";
import { getContext } from "./http.js";
import { forbidden, unauthorized } from "./errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const ctx = getContext(req);
  if (!ctx.tenantId || !ctx.userId) throw unauthorized();
  next();
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ctx = getContext(req);
    if (!ctx.permissions?.includes(permission)) throw forbidden();
    next();
  };
}
