# Backup System

This describes the automated backup strategy for the Basaer ERP on a VPS.

## 1. Database Backups (pg_dump)

Create a nightly cron job to export the PostgreSQL database and compress it.

**Script:** `/opt/basaer/scripts/backup_db.sh`

```bash
#!/bin/bash
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec basaer-postgres pg_dump -U basaer basaer | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Retain only last 7 days of backups
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
```

**Cron Configuration:**

```bash
0 2 * * * /opt/basaer/scripts/backup_db.sh
```

## 2. File Storage Backups (Uploads/Exports)

The named Docker volumes containing user uploads and generated templates must be synced.

**Script:** `/opt/basaer/scripts/backup_storage.sh`

```bash
#!/bin/bash
BACKUP_DIR="/backup/storage"
SOURCE_DIR="/var/lib/docker/volumes/basaer_storage_uploads/_data"

mkdir -p $BACKUP_DIR
# Sync using rsync for delta updates
rsync -avz --delete $SOURCE_DIR $BACKUP_DIR/
```

## 3. Redis Snapshots

Redis automatically manages an `appendonly.aof` file in the `redis_data` volume. Backing up the physical volume directory ensures you capture queue states, though BullMQ queues are largely transient.
