# Scaling Strategy

## Horizontal Scaling

- API Gateway: scale by CPU/RPS; keep it stateless.
- Realtime Service: scale with Socket.IO Redis adapter.
- Workers (Notification): scale by queue depth.

## Data Layer

- Start: single Postgres with `tenantId`.
- Next: read replicas for analytics-heavy reads.
- Later: split services into separate DBs or schemas per bounded context.

## Eventing

- Current: Redis Pub/Sub.
- Later: migrate to Kafka/NATS for stronger delivery guarantees and replay.
