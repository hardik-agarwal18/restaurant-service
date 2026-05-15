# Architecture

## Goals

- Multi-tenant SaaS for restaurants/cafes/cloud kitchens/franchises/multi-branch brands
- Microservices + event-driven for loose coupling and horizontal scaling
- Production-grade security (JWT, refresh rotation, RBAC, audit logs, rate limiting)
- Cloud-ready (Docker, reverse proxy, observability, CI)

## Service Topology

```mermaid
flowchart LR
  C[Web/Mobile/POS/KDS] -->|REST /v1| G[API Gateway]
  C -->|Socket.IO| RT[Realtime Service]

  G --> AUTH[Auth Service]
  G --> ORD[Order Service]
  G --> POS[POS Service]
  G --> INV[Inventory Service]
  G --> REST[Restaurant Service]
  G --> USR[User Service]
  G --> PAY[Payment Service]
  G --> DEL[Delivery Service]
  G --> ANA[Analytics Service]
  G --> AI[AI Recommendation Service]

  subgraph EventBus[Redis Pub/Sub]
    R[(Redis)]
  end

  ORD -->|publish| R
  PAY -->|publish| R
  INV -->|publish| R
  R -->|subscribe| NOTIF[Notification Service]
  R -->|subscribe| RT
  R -->|subscribe| ANA

  subgraph Data[PostgreSQL]
    PG[(Postgres)]
  end

  AUTH --> PG
  ORD --> PG
  POS --> PG
  INV --> PG
  REST --> PG
  USR --> PG
  PAY --> PG
  DEL --> PG
```

Notes:

- Current scaffold uses a single Postgres database for simplicity. In a “strict” microservices setup you can split DBs per service later.
- Events are published via Redis Pub/Sub; the [OutboxEvent](../packages/db/prisma/schema.prisma) model enables an outbox pattern for reliable publishing.

## Multi-Tenancy

- Every business entity includes `tenantId`.
- Tenant context is provided via `X-Tenant-Id` header (simplest baseline). In production you can also derive it from subdomain or JWT claims.
- Recommended next hardening step: Postgres Row Level Security (RLS) + per-tenant DB roles.

## Event-Driven Workflows

- Orders publish `order.created` after DB commit by inserting into `OutboxEvent`.
- A publisher (worker/cron) reads pending outbox events and publishes them to Redis.
- Consumers (notifications / realtime / analytics) subscribe and react.
