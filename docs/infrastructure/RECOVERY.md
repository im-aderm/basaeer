# Disaster Recovery Plan

In the event of a catastrophic VPS failure, follow these steps to restore the ERP on a fresh server.

## 1. Restore the Database

1. Setup the fresh VPS following `VPS_SETUP.md`.
2. Start the Postgres container: `docker compose up -d postgres`
3. Transfer the `.sql.gz` backup to the server.
4. Extract and restore:

```bash
gunzip -c db_backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i basaer-postgres psql -U basaer -d basaer
```

## 2. Restore the Storage

The user uploads (e.g. Admission Documents, Result templates) must be restored.

1. Transfer the backup folder containing the synced `storage_uploads` volume data.
2. Copy the files into the named volume path (e.g. `/var/lib/docker/volumes/basaer_storage_uploads/_data`).

## 3. Restore the Application

1. Ensure `.env` and `backend/.env` are populated.
2. Ensure NGINX config is intact.
3. Bring up the stack:

```bash
docker compose up -d --build
```

4. Check the health endpoint:

```bash
curl -I http://localhost/api/health
```

You should receive `HTTP/1.1 200 OK`.
