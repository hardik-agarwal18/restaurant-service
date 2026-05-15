# Restaurant Service — Design

> **Repository:** `hardik-agarwal18/restaurant-service`  
> **Primary language:** TypeScript  
> **Document purpose:** Provide a detailed, implementation-oriented design for the Restaurant Service codebase: architecture, modules, data model, APIs, validation, error handling, observability, testing, security, and operational concerns.

---

## 1. Overview

### 1.1 What this service does
The **Restaurant Service** is a backend service responsible for managing restaurant-related domain data and operations. Typical responsibilities include:

- Storing and retrieving restaurant records (name, location, hours, cuisine, etc.)
- Managing menus and menu items
- Restaurant search / filtering (by location, cuisine, status, etc.)
- Publishing restaurant events for downstream services (optional / future)

This repository is implemented primarily in **TypeScript**.

### 1.2 Goals
- **Correctness & consistency:** predictable domain rules and validations.
- **Simplicity:** a clear layering approach to keep business logic testable.
- **Maintainability:** consistent patterns for handlers, services, repositories.
- **Operational readiness:** health checks, structured logging, metrics.

### 1.3 Non-goals
- Building a full API gateway (assume this service sits behind one).
- Handling user authentication/authorization end-to-end (assume delegated to gateway/identity provider unless explicitly implemented here).
- Owning cross-service transaction orchestration (prefer eventual consistency).

---

## 2. Architecture

### 2.1 High-level
A conventional layered architecture is recommended:

1. **Transport layer**: HTTP server (e.g., Express/Fastify/Nest). Routes/controllers map requests to application services.
2. **Application layer (use-cases)**: orchestrates operations, enforces authorization and cross-entity rules.
3. **Domain layer**: entities/value objects, invariants, pure logic.
4. **Infrastructure layer**: database adapters, messaging, cache, external integrations.

**Dependency direction** should flow inward: transport → application → domain; infrastructure is consumed via interfaces.

### 2.2 Request flow
1. Request arrives at a route/controller.
2. Middleware performs:
   - request ID propagation
   - authentication (if present)
   - input validation
   - rate limiting (if enabled)
3. Controller calls an application service.
4. Service performs domain logic and calls repositories.
5. Response is returned; errors are translated to consistent HTTP responses.

### 2.3 Folder structure (recommended)
If not already present, align to something like:

- `src/`
  - `server/` (bootstrap, HTTP server, middleware)
  - `routes/` (route registration)
  - `controllers/` (HTTP handlers)
  - `services/` (application/use-case services)
  - `domain/` (entities, value objects, domain errors)
  - `repositories/` (interfaces + implementations)
  - `db/` (ORM client, migrations)
  - `schemas/` (request/response validation schemas)
  - `utils/` (logging, config, helpers)
  - `types/` (shared TS types)
- `test/` or `src/**/__tests__/`

> The existing repo may differ; this document describes the intended design and can be adapted to the actual structure.

---

## 3. Core Domain Model

### 3.1 Entities

#### Restaurant
Represents a single restaurant.

**Common fields** (illustrative):
- `id: string` (UUID)
- `name: string`
- `status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'`
- `cuisines: string[]`
- `address` (value object)
- `geo` (lat/lng)
- `hours` (opening hours rules)
- `createdAt`, `updatedAt`

#### Menu
- `id: string`
- `restaurantId: string`
- `name: string`
- `description?: string`
- `active: boolean`

#### MenuItem
- `id: string`
- `menuId: string`
- `name: string`
- `description?: string`
- `price` (value object: currency + amount)
- `available: boolean`
- `tags: string[]`

### 3.2 Value Objects
- **Address**: `line1`, `line2?`, `city`, `state`, `postalCode`, `country`
- **Money**: `amount` (integer minor units recommended), `currency` (ISO 4217)
- **GeoPoint**: `lat`, `lng`
- **OpeningHours**: representation of weekly schedule + special closures

### 3.3 Domain invariants
- Restaurant name must be non-empty and within max length.
- Menu belongs to exactly one restaurant.
- Menu item belongs to exactly one menu.
- Price must be ≥ 0 and in allowed currencies.

### 3.4 Domain events (optional)
If/when the service needs integration events:
- `RestaurantCreated`
- `RestaurantUpdated`
- `MenuCreated`
- `MenuItemUpdated`

Events should be published **after** successful persistence (outbox pattern recommended).

---

## 4. API Design

### 4.1 Principles
- **RESTful resources** with predictable URIs.
- Use **idempotency** where relevant.
- Use **pagination** for list endpoints.
- Return consistent error envelope.

### 4.2 Endpoint sketch
> Adjust to match the actual implementation if endpoints already exist.

#### Restaurants
- `POST /restaurants`
  - Create restaurant
- `GET /restaurants/{id}`
  - Get restaurant by id
- `GET /restaurants?city=&cuisine=&status=&q=&page=&pageSize=`
  - Search/list restaurants
- `PATCH /restaurants/{id}`
  - Partial update
- `DELETE /restaurants/{id}`
  - Soft delete / deactivate

#### Menus
- `POST /restaurants/{restaurantId}/menus`
- `GET /restaurants/{restaurantId}/menus`
- `GET /menus/{id}`
- `PATCH /menus/{id}`

#### Menu Items
- `POST /menus/{menuId}/items`
- `GET /menus/{menuId}/items`
- `GET /items/{id}`
- `PATCH /items/{id}`
- `DELETE /items/{id}`

### 4.3 Request/response conventions
- Use JSON.
- Timestamps in ISO-8601 UTC.
- IDs as UUID strings.

**Example error envelope**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      { "path": "name", "message": "Required" }
    ],
    "requestId": "..."
  }
}
```

---

## 5. Validation & Schema Strategy

### 5.1 Input validation
Use a schema validation library (one of):
- Zod
- Joi
- Yup
- class-validator (Nest)

Validate:
- request body
- route params
- query params

### 5.2 Output validation (optional)
For safety, critical endpoints can validate response objects before sending (helpful when refactoring).

---

## 6. Persistence Layer

### 6.1 Database
The repository may use:
- PostgreSQL (recommended), or
- MySQL, or
- MongoDB

Keep DB details isolated to `db/` and repository implementations.

### 6.2 Repositories
Define interfaces in the domain/application layer and implement them in infrastructure.

Example interfaces:
- `RestaurantRepository`
  - `create(restaurant)`
  - `getById(id)`
  - `search(filters, pagination)`
  - `update(id, patch)`

### 6.3 Migrations
- Maintain migrations in a single tool format (Prisma/Knex/TypeORM migrations).
- Enforce that CI runs migrations against a clean database for integration tests.

### 6.4 Transaction boundaries
- Keep transactions small.
- For multi-entity writes, use a transaction.
- For external side effects, use outbox/eventual consistency.

---

## 7. Configuration

### 7.1 Environment variables
Common configuration:
- `PORT`
- `NODE_ENV`
- `LOG_LEVEL`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `REQUEST_TIMEOUT_MS`

### 7.2 Configuration loading
- Load config once at startup.
- Validate config strictly (fail fast).

---

## 8. Error Handling

### 8.1 Error taxonomy
- **ValidationError** → `400`
- **NotFoundError** → `404`
- **ConflictError** (duplicate, invariant conflicts) → `409`
- **UnauthorizedError** → `401`
- **ForbiddenError** → `403`
- **UnexpectedError** → `500`

### 8.2 Consistent error responses
All errors should map to the same envelope (see §4.3) and include `requestId`.

---

## 9. Observability

### 9.1 Logging
- Structured JSON logs.
- Include: `timestamp`, `level`, `message`, `requestId`, `route`, `statusCode`, `durationMs`.

### 9.2 Metrics
Prometheus-style metrics (recommended):
- request count by route/status
- request latency histogram
- DB query latency
- error counters

### 9.3 Tracing
OpenTelemetry integration (recommended):
- trace incoming HTTP requests
- instrument DB client
- propagate trace context

---

## 10. Security

### 10.1 Authentication & authorization
If this service is called internally:
- Use mTLS or network policy + service-to-service identity.

If external-facing:
- Validate JWT from an identity provider
- Enforce RBAC/ABAC at service layer

### 10.2 Input hardening
- request size limits
- strict validation
- sanitize free-text fields if rendered elsewhere

### 10.3 Secrets
- never commit secrets
- use secret manager in production

---

## 11. Performance & Scalability

- Use pagination on list endpoints.
- Add indexes for search fields (city, cuisine, status, geo).
- Consider read replicas for heavy read workloads.
- Cache hot reads (restaurant profile) with TTL if needed.

---

## 12. Testing Strategy

### 12.1 Unit tests
- domain entities and value objects
- application services

### 12.2 Integration tests
- repository implementations against a real DB (test containers)
- HTTP endpoints with supertest-like framework

### 12.3 Contract tests (optional)
- validate API schema (OpenAPI) and consumer expectations.

---

## 13. CI/CD

### 13.1 Continuous Integration
- lint (ESLint)
- typecheck (tsc)
- unit tests
- build
- integration tests (optional per PR, mandatory on main)

### 13.2 Release
- build docker image
- push to registry
- deploy via Helm/Terraform/etc.

---

## 14. Deployment

### 14.1 Container
Recommended Docker runtime:
- `node:<LTS>-alpine`
- non-root user
- healthcheck endpoint

### 14.2 Health endpoints
- `GET /health` (liveness)
- `GET /ready` (readiness; checks DB connection)

---

## 15. API Documentation

- Maintain **OpenAPI** spec.
- Generate API docs and optionally a client SDK.
- Ensure schema matches runtime validation.

---

## 16. Future Improvements
- Add event outbox + message bus publishing.
- Add geospatial search (PostGIS) if location-based queries are needed.
- Add audit logging for administrative changes.
- Add rate limiting and abuse prevention.

---

## 17. Appendix: Suggested Coding Conventions

- Prefer `strict` TypeScript.
- Avoid `any`; use `unknown` + validation.
- One responsibility per module.
- Keep controllers thin; put logic in services.
- Centralize error mapping and response formatting.

