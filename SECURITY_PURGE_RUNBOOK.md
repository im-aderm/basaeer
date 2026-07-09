# Runbook — Purge DB dump + .env.save from git history

**Goal:** Remove `backend/backups/backup-2026-05-16T15-28-41-567Z.sql` (contains real bcrypt
hashes + PII) and `.env.save` from ALL git history, then rotate the exposed user passwords.

**Production impact:** NONE to data or logins. This rewrites the git repo only. The live
PostgreSQL DB, deployed code, and user sessions are untouched. The only effect is that every
commit SHA changes, so existing clones must re-sync and the Railway deploy will redeploy the
same code (a functional no-op).

**Files in history:** `backend/backups/backup-2026-05-16T15-28-41-567Z.sql`, `.env.save`
**Branches carrying the dump:** `main`, `feature/events-module` (force-push BOTH; leave the
`railway/fix-deploy-*` branches alone — they are already clean).

---

## Step 1 — Reversible backup (do this first)
```bash
cd ~/Desktop
git clone --mirror https://github.com/im-aderm/basaeer.git basaeer-backup.git
# Keep basaeer-backup.git safe. To fully undo the rewrite:
#   cd basaeer-backup.git && git push --force --mirror https://github.com/im-aderm/basaeer.git
```

## Step 2 — Install git-filter-repo
```bash
pipx install git-filter-repo        # preferred
# or: pip install --user git-filter-repo
# or: sudo apt-get install git-filter-repo
git filter-repo --version           # confirm it runs
```

## Step 3 — Fresh clone to rewrite (keeps your working dir + real .env untouched)
```bash
cd ~/Desktop
git clone https://github.com/im-aderm/basaeer.git basaeer-purge
cd basaeer-purge
# pull the other affected branch locally so it gets rewritten too
git fetch origin feature/events-module:feature/events-module
```

## Step 4 — Rewrite history (strips the files from every commit on every local branch)
```bash
git filter-repo \
  --invert-paths \
  --path .env.save \
  --path-glob 'backend/backups/*.sql'
```

## Step 5 — Verify the files are gone from ALL refs (must print nothing)
```bash
git log --all --oneline -- 'backend/backups/*.sql' .env.save
git rev-list --all --objects | grep -E 'backup-2026-05-16|\.env\.save' || echo "CLEAN"
```

## Step 6 — Re-add origin (filter-repo removes it as a safety measure) and force-push
```bash
git remote add origin https://github.com/im-aderm/basaeer.git
git push origin --force-with-lease main
git push origin --force-with-lease feature/events-module
# If GitHub rejects force-with-lease after a full rewrite, use plain --force:
#   git push origin --force main
#   git push origin --force feature/events-module
```
> If branch protection blocks force-push on `main`, temporarily disable "Do not allow force
> pushes" in GitHub → Settings → Branches, push, then re-enable it.

## Step 7 — Rotate the exposed credentials (SAFE — no data loss, no forced logout errors)
The dump exposed **bcrypt password hashes**, so force a password change for the accounts in it.
Setting `mustChangePassword = true` does NOT delete data or break sessions — it just prompts a
change on next login. Run against PRODUCTION DB (verify DATABASE_URL points at prod first):
```sql
-- Minimum: privileged/demo accounts from the dump
UPDATE "User" SET "mustChangePassword" = true
WHERE email IN ('super.admin@basaeer.com','branch.admin@basaeer.com','teacher@basaeer.com');

-- Stronger: force reset for every user that existed as of the 2026-05-16 dump
-- UPDATE "User" SET "mustChangePassword" = true WHERE "createdAt" <= '2026-05-16';
```
Also rotate any infra secret whose VALUE (not just name) ever sat in a committed file. `.env.save`
held placeholders, so no infra rotation is strictly required from it — but if the REAL `.env` was
ever committed in the past, rotate `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_SECRET`,
`BOOTSTRAP_SECRET`, DB and Redis passwords. (Rotating `JWT_SECRET` will invalidate active
sessions — do it during a maintenance window if you choose to.)

## Step 8 — Re-sync every other clone (avoid re-introducing the dump)
On any machine/CI with an old clone:
```bash
git fetch origin
git reset --hard origin/main         # discards local rewritten-away history
# or simplest: delete the folder and re-clone
```

## Step 9 — Re-sync the VPS + GitHub caches
The app is hosted on a **VPS** (not Railway). The VPS has its own git clone whose `.git`
history STILL contains the dump blob until you re-sync it. On the VPS:
```bash
ssh <user>@<vps-host>
cd /path/to/basaeer                 # the deploy checkout on the VPS
git fetch origin
git reset --hard origin/main        # replaces the diverged (dump-bearing) history
git reflog expire --expire=now --all
git gc --prune=now                  # physically drop the old dump blob from the VPS .git

# Verify the dump is gone from the VPS clone (want 0):
git log --all --oneline -- 'backend/backups/*.sql' .env.save | wc -l
```
NOTE: `reset --hard origin/main` also brings the **Phase 0 code** (Redis throttler + bcrypt 12)
onto the VPS. That is login-safe, but before restarting the app: confirm `REDIS_HOST`/
`REDIS_PORT`/`REDIS_PASSWORD` are set in the VPS `.env`, then rebuild + restart
(e.g. `docker compose up -d --build`, or `npm ci && npm run build && pm2 restart` — match your
setup). The VPS `.env` (real secrets) lives on disk, is gitignored, and is untouched by this.

- GitHub may keep the old blob reachable via its cache / any forks / open PRs for a while.
  Close/rebase open PRs that predate the rewrite. For a guaranteed purge of the cached blob,
  contact GitHub Support to run garbage collection on the repo after the force-push.

## Step 10 — Clean up (local workstation)
```bash
cd ~/Desktop && rm -rf basaeer-purge        # keep basaeer-backup.git until you're confident
```

---

## STATUS (updated 2026-07-09)
- [x] Step 1  mirror backup (`basaeer-backup.git`)
- [x] Step 2  git-filter-repo installed
- [x] Step 3  fresh clone (feature/events-module skipped — it was local-only, never on remote)
- [x] Step 4  history rewritten
- [x] Step 5  verified clean in the purge clone
- [x] Step 6  force-pushed to `origin/main` (now at `ddb3d91`, 0 dump commits) via plain `--force`
- [x] Primary working clone `~/Desktop/basaeer` re-synced + gc'd (0 dump commits, stale branch deleted)
- [ ] **Step 7  rotate credentials — YOU: run the SQL against the PRODUCTION DB**
- [ ] **Step 9  re-sync the VPS clone (+ rebuild/restart) — YOU: SSH to the VPS**
- [ ] Step 10 remove `basaeer-purge` (keep `basaeer-backup.git`)
