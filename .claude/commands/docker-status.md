---
description: Check the health and status of all VastraaOS Docker containers.
---

Check the status of all VastraaOS Docker services.

```bash
# Container status overview
docker compose ps

# Resource usage (CPU, Memory)
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Status}}"

# Recent logs from each service (last 20 lines)
echo "=== API logs ===" && docker compose logs --tail=20 api
echo "=== Web logs ===" && docker compose logs --tail=20 web
echo "=== Landing logs ===" && docker compose logs --tail=20 landing
echo "=== Nginx Web logs ===" && docker compose logs --tail=20 vastraaos_nginx_web

# Database connectivity check
docker compose exec db mysqladmin ping -h localhost -u root --silent && echo "DB: OK" || echo "DB: FAILED"

# API health check
curl -s -o /dev/null -w "API HTTP status: %{http_code}\n" http://localhost:8080/api/v1
```

Report the status of each service and highlight any containers that are not running or have errors in their logs.
