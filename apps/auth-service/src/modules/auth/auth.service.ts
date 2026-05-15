import {
  sha256Base64Url,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyPassword,
  verifyRefreshToken,
} from "@rm/auth";
import { HttpError, type PrincipalClaims, unauthorized } from "@rm/platform";
import type { Env } from "../../env.js";
import type { AuthRepository } from "./auth.repository.js";
import type { LoginBody } from "./auth.validation.js";

function unique(values: string[]): string[] {
  return values.filter((v, i, a) => a.indexOf(v) === i);
}

export class AuthService {
  constructor(
    private readonly env: Env,
    private readonly repo: AuthRepository
  ) {}

  async login(
    tenantId: string,
    body: LoginBody,
    meta: { userAgent?: string; ip?: string; deviceId?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.repo.findActiveUserByEmail(tenantId, body.email);

    if (!user || !user.isActive) {
      throw new HttpError(401, "INVALID_CREDENTIALS");
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "INVALID_CREDENTIALS");

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = unique(
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.key))
    );

    const principal = {
      tenantId,
      userId: user.id,
      roles,
      permissions,
    };

    // Create session first so we can embed sid into refresh token
    const session = await this.repo.createSession({
      tenantId,
      userId: user.id,
      refreshTokenHash: "",
      rotation: 0,
      userAgent: meta.userAgent,
      ip: meta.ip,
      deviceId: meta.deviceId,
    });

    const refreshToken = signRefreshToken(this.env, principal, session.id, 0);
    const refreshTokenHash = sha256Base64Url(refreshToken);

    await this.repo.updateSession(session.id, { refreshTokenHash });

    const accessToken = signAccessToken(this.env, principal);

    return { accessToken, refreshToken };
  }

  async refresh(
    tenantId: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyRefreshToken(this.env, refreshToken);
    if (decoded.tenantId !== tenantId) {
      throw new HttpError(401, "INVALID_REFRESH");
    }

    const session = await this.repo.getSessionById(decoded.sid);
    if (!session || session.revokedAt) {
      throw new HttpError(401, "SESSION_REVOKED");
    }

    const presentedHash = sha256Base64Url(refreshToken);
    if (session.refreshTokenHash !== presentedHash || session.rotation !== decoded.rot) {
      await this.repo.updateSession(session.id, { revokedAt: new Date() });
      throw new HttpError(401, "TOKEN_REUSE_DETECTED");
    }

    const user = await this.repo.findActiveUserById(session.userId);
    if (!user || !user.isActive) {
      throw new HttpError(401, "INVALID_USER");
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = unique(
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.key))
    );

    const principal = {
      tenantId,
      userId: user.id,
      roles,
      permissions,
    };

    const nextRotation = session.rotation + 1;
    const nextRefreshToken = signRefreshToken(this.env, principal, session.id, nextRotation);
    const nextRefreshTokenHash = sha256Base64Url(nextRefreshToken);

    await this.repo.updateSession(session.id, {
      refreshTokenHash: nextRefreshTokenHash,
      rotation: nextRotation,
      lastUsedAt: new Date(),
    });

    const accessToken = signAccessToken(this.env, principal);
    return { accessToken, refreshToken: nextRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = verifyRefreshToken(this.env, refreshToken);
      await this.repo.updateSession(decoded.sid, { revokedAt: new Date() });
    } catch {
      // ignore
    }
  }

  me(authorizationHeader: string | undefined): { principal: PrincipalClaims } {
    if (!authorizationHeader?.startsWith("Bearer ")) throw unauthorized();
    const principal = verifyAccessToken(this.env, authorizationHeader.slice("Bearer ".length));
    return { principal };
  }
}
