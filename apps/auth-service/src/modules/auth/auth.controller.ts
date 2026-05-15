import type { Request, Response } from "express";
import { HttpError, getContext } from "@rm/platform";
import type { Env } from "../../env.js";
import { refreshCookieOptions } from "../../cookies.js";
import type { AuthService } from "./auth.service.js";
import { LoginBodySchema } from "./auth.validation.js";

export class AuthController {
  constructor(
    private readonly env: Env,
    private readonly service: AuthService
  ) {}

  csrf = (req: Request, res: Response) => {
    res.status(200).json({ csrfToken: req.csrfToken() });
  };

  login = async (req: Request, res: Response) => {
    const body = LoginBodySchema.parse(req.body);

    const tenantId = getContext(req).tenantId;
    if (!tenantId) throw new HttpError(400, "TENANT_REQUIRED");

    const { accessToken, refreshToken } = await this.service.login(tenantId, body, {
      userAgent: req.header("user-agent") || undefined,
      ip: req.ip,
      deviceId: req.header("x-device-id") || undefined,
    });

    res.cookie("rm_refresh", refreshToken, refreshCookieOptions(this.env));
    res.status(200).json({ accessToken });
  };

  refresh = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId;
    if (!tenantId) throw new HttpError(400, "TENANT_REQUIRED");

    const raw = String(req.cookies?.rm_refresh || "");
    if (!raw) throw new HttpError(401, "NO_REFRESH");

    const { accessToken, refreshToken } = await this.service.refresh(tenantId, raw);

    res.cookie("rm_refresh", refreshToken, refreshCookieOptions(this.env));
    res.status(200).json({ accessToken });
  };

  logout = async (req: Request, res: Response) => {
    const raw = String(req.cookies?.rm_refresh || "");
    if (raw) await this.service.logout(raw);

    res.clearCookie("rm_refresh", { path: "/" });
    res.status(200).json({ ok: true });
  };

  me = async (req: Request, res: Response) => {
    const result = this.service.me(req.header("authorization"));
    res.status(200).json(result);
  };
}
