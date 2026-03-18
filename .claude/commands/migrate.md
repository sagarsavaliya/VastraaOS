---
description: Run database migrations safely. Checks migration status first and confirms before running.
---

Run database migrations for VastraaOS.

## Step 1: Check current migration status
```bash
docker compose exec api php artisan migrate:status
```

List the pending migrations and confirm with the user before proceeding if there are any.

## Step 2: Run migrations
```bash
docker compose exec api php artisan migrate
```

## Step 3: Verify
```bash
docker compose exec api php artisan migrate:status
```
Confirm all migrations now show as "Ran".

---

**Safety rules:**
- Never run `migrate:fresh` or `migrate:reset` in production — these drop all data
- If a migration fails, check the error and fix the migration file before retrying
- For production, always backup the database before running migrations
- If `$ARGUMENTS` contains "fresh" or "seed", confirm with the user that this is intentional (it wipes data)

If `$ARGUMENTS` is provided, append it: `php artisan migrate $ARGUMENTS`
