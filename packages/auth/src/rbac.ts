import type { NextFunction, Request, Response } from "express";
import type { Principal } from "./types.js";

export function requireAuth(getPrincipal: (req: Request) => Principal | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    const principal = getPrincipal(req);
    if (!principal) return res.status(401).json({ error: "UNAUTHORIZED" });
    next();
  };
}

export function requirePermissions(
  getPrincipal: (req: Request) => Principal | undefined,
  required: string[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const principal = getPrincipal(req);
    if (!principal) return res.status(401).json({ error: "UNAUTHORIZED" });
    const ok = required.every((p) => principal.permissions.includes(p));
    if (!ok) return res.status(403).json({ error: "FORBIDDEN" });
    next();
  };
}
