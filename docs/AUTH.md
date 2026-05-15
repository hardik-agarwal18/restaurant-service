# Authentication

## Tokens

- Access token: JWT, short TTL (`ACCESS_TOKEN_TTL_SECONDS`), sent in `Authorization: Bearer ...`.
- Refresh token: JWT, long TTL, stored in `HttpOnly` cookie (`rm_refresh`).
- Refresh rotation: each refresh increments `UserSession.rotation`; reuse triggers session revocation.

## Endpoints

- `GET /v1/csrf` → returns `csrfToken` (used only for cookie-based refresh/logout).
- `POST /v1/auth/login` → returns `accessToken`, sets refresh cookie.
- `POST /v1/auth/refresh` (CSRF-protected) → returns new `accessToken`, rotates refresh cookie.
- `POST /v1/auth/logout` (CSRF-protected) → revokes session, clears refresh cookie.

## Session Management

- Sessions stored in `UserSession` with `refreshTokenHash`, `rotation`, and revocation fields.
- Device/session management can be extended by exposing:
  - list sessions
  - revoke session by id
  - require re-auth for sensitive operations
