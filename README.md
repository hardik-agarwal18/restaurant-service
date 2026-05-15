# Restaurant Management SaaS Platform (Microservices)

This repository scaffolds a production-grade, event-driven Restaurant Management SaaS backend using:

- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- Redis + BullMQ
- Socket.IO (with Redis adapter)
- Prometheus + Grafana + Loki

## Quickstart (Docker)

1. Create an `.env` from `.env.example`.
2. Run `docker compose up --build`.

Optional (observability): `docker compose --profile observability up --build`.

## Structure

- `apps/*` – microservices (API gateway, auth, orders, etc.)
- `packages/*` – shared libraries (db, auth, events, platform)
- `infra/*` – docker/monitoring config
- `docs/*` – architecture, workflows, deployment
