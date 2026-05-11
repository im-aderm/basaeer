# Redis Local Setup

Redis is used by BullMQ to orchestrate heavy computations (report cards, broadsheets) and file exports.

## Persistence (AOF)

Because jobs must survive server restarts, Redis is configured with Append-Only File (AOF) persistence.

In `docker-compose.yml`, the command explicitly enables this:
```yaml
command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
```

This guarantees that any queued exports or computations that were pending during a reboot will be recovered and re-processed by BullMQ immediately upon startup.

## Security

* Redis is bound to `127.0.0.1`.
* It requires a password (`REDIS_PASSWORD`).
* No public port is exposed.

## Monitoring Queue Backlogs

You can monitor Redis and the queues directly using the CLI from the host:

```bash
docker exec -it basaeer-redis redis-cli -a <YOUR_REDIS_PASSWORD> info memory
```

For BullMQ specifically, watch the backend logs:
```bash
docker logs -f basaeer-backend
```
BullMQ automatically emits lifecycle hooks (`OnWorkerEvent`) into the NestJS logger.
