import type { NextFunction, Request, Response } from "express";
import { setContext } from "./http.js";

export type PrincipalClaims = {
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
};

export type AccessTokenVerifier<TEnv> = (env: TEnv, token: string) => PrincipalClaims;

export function bearerAuthContextMiddleware<TEnv>(env: TEnv, verify: AccessTokenVerifier<TEnv>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.header("authorization") || "";
    if (auth.startsWith("Bearer ")) {
      try {
        const principal = verify(env, auth.slice("Bearer ".length));
        setContext(req, {
          tenantId: principal.tenantId,
          userId: principal.userId,
          roles: principal.roles,
          permissions: principal.permissions,
        });
      } catch {
        // ignore invalid tokens
      }
    }
    next();
  };
}
