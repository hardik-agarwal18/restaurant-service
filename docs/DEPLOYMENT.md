# Deployment (Cloud-Ready)

## Containers

- Each service is built from the same reusable Dockerfile: [infra/docker/Dockerfile.service](../infra/docker/Dockerfile.service)
- NGINX sits in front as a reverse proxy.

## Blue/Green Readiness

- Stateless services → safe for blue/green.
- Add readiness gates (DB/Redis connectivity checks) on `/readyz` (currently returns ok; extend).
- Use versioned deployments and gradually shift traffic at the load balancer.

## AWS Reference

- ECS/Fargate or EKS for services
- RDS Postgres
- Elasticache Redis
- CloudWatch / Grafana for dashboards
- ALB for gateway + websocket
