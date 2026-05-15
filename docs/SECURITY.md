# Security Best Practices

Implemented in scaffold:

- `helmet` headers, CORS with credentials support (tighten in production)
- JWT access tokens + refresh rotation
- Cookie hardening: `HttpOnly`, `SameSite=Lax`, `Secure` in production
- CSRF protection on cookie-based refresh/logout
- Rate limiting via Redis (`rate-limiter-flexible`)
- Input validation via `zod`
- Audit log table for sensitive actions (hook up middleware per service)

Recommended next steps:

- Force HTTPS end-to-end; set `COOKIE_SECURE=true` behind TLS
- Add request signing for internal service-to-service calls (mTLS / JWT between services)
- Add Idempotency middleware using `IdempotencyKey` table
- Implement distributed tracing (OpenTelemetry) and log correlation by `requestId`
- Add Postgres RLS policies for tenant isolation
