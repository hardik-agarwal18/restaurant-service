# Events & Workflows

## Envelope

Events are published as an envelope:

- `id`: unique event id
- `topic`: string topic (e.g. `order.created`)
- `ts`: ISO timestamp
- `tenantId`: tenant scope
- `payload`: JSON payload

## Topics

Defined in [packages/events/src/topics.ts](../packages/events/src/topics.ts).

## Outbox Pattern

- Producer writes business change + `OutboxEvent` in same DB transaction (recommended).
- Outbox publisher retries until publish succeeds.
- Consumers are idempotent.

## Example: Order Created

```mermaid
sequenceDiagram
  participant API as API Gateway
  participant ORD as Order Service
  participant DB as Postgres
  participant PUB as Outbox Publisher
  participant REDIS as Redis Pub/Sub
  participant NOTIF as Notification Service
  participant RT as Realtime Service

  API->>ORD: POST /v1/orders
  ORD->>DB: create Order + OutboxEvent
  DB-->>ORD: commit
  ORD-->>API: 201 Order
  PUB->>DB: fetch unpublished OutboxEvent
  PUB->>REDIS: publish order.created
  REDIS-->>NOTIF: deliver
  NOTIF->>NOTIF: enqueue email/SMS
  REDIS-->>RT: deliver
  RT->>RT: emit socket event
```
