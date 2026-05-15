import type { Env } from "./env.js";

export function refreshCookieOptions(env: Env) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
  };
}
