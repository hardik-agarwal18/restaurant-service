import jwt from "jsonwebtoken";
import { z } from "zod";
import type { Principal } from "./types.js";

export const JwtEnvSchema = z.object({
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
});

export type JwtEnv = z.infer<typeof JwtEnvSchema>;

type AccessClaims = {
  typ: "access";
} & Principal;

type RefreshClaims = {
  typ: "refresh";
  sid: string; // session id
  rot: number; // rotation counter
} & Principal;

export function signAccessToken(env: JwtEnv, principal: Principal) {
  const claims: AccessClaims = { typ: "access", ...principal };
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function signRefreshToken(
  env: JwtEnv,
  principal: Principal,
  sessionId: string,
  rotation: number
) {
  const claims: RefreshClaims = { typ: "refresh", sid: sessionId, rot: rotation, ...principal };
  return jwt.sign(claims, env.JWT_REFRESH_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(env: JwtEnv, token: string): Principal {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
  const schema = z.object({
    typ: z.literal("access"),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    roles: z.array(z.string()),
    permissions: z.array(z.string()),
  });
  const parsed = schema.parse(decoded);
  return {
    tenantId: parsed.tenantId,
    userId: parsed.userId,
    roles: parsed.roles,
    permissions: parsed.permissions,
  };
}

export function verifyRefreshToken(env: JwtEnv, token: string) {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
  const schema = z.object({
    typ: z.literal("refresh"),
    sid: z.string().min(1),
    rot: z.number().int().nonnegative(),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    roles: z.array(z.string()),
    permissions: z.array(z.string()),
  });
  return schema.parse(decoded);
}
