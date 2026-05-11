# PostgreSQL Setup & Tuning (VPS)

Basaeer's PostgreSQL is containerized but must be treated as a production-grade component.

## Architecture & Security

* **Exposure:** Port 5432 is strictly bound to `127.0.0.1` locally in `docker-compose.yml`. It is inaccessible from the public internet.
* **User:** Basaeer connects via a dedicated `POSTGRES_USER` configured in `.env`.
* **Volumes:** Data is persisted to a named Docker volume (`postgres_data`).

## Production Tuning (Prisma)

The Prisma client has been optimized for local VPS execution. We no longer use `PgBouncer` or `pooler` endpoints.

In `backend/src/prisma/prisma.service.ts`:
* The maximum connection pool size defaults to `20` (`DB_POOL_SIZE`). You can scale this up to `100` depending on the memory capacity of the VPS.
* Connection timeouts are enforced to prevent hanging queries.

## Reconnecting / Restarts

PostgreSQL handles its own startup crash recovery automatically via the official Docker image. 
If the container restarts, NestJS will continuously retry connections because it wraps queries gracefully via Prisma.

## Scaling to Native (Host-Level) PostgreSQL

If the database needs to scale beyond what Docker allows (for example, managing specific shared buffers or kernel parameters), you can install PostgreSQL directly on the host:
1. `sudo apt install postgresql-16`
2. Stop the Docker postgres container.
3. Update `.env` to point `DATABASE_URL` to `localhost` and `port: 5432`.
4. Ensure `pg_hba.conf` allows connections from the Docker bridge network.
