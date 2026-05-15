declare module "csurf" {
  import type { RequestHandler } from "express";

  export type SameSite = boolean | "lax" | "strict" | "none";

  export interface CookieOptions {
    key?: string;
    path?: string;
    signed?: boolean;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: SameSite;
    maxAge?: number;
  }

  export interface CsurfOptions {
    cookie?: boolean | CookieOptions;
    ignoreMethods?: string[];
    sessionKey?: string;
    value?: (req: any) => string;
  }

  export default function csurf(options?: CsurfOptions): RequestHandler;
}

declare namespace Express {
  interface Request {
    csrfToken(): string;
  }
}
