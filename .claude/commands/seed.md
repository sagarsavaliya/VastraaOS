---
description: Seed the development database with test data for VastraaOS.
---

Seed the VastraaOS development database.

## Step 1: Confirm environment
```bash
docker compose exec api php artisan env
```
Verify this is NOT production (`APP_ENV=local` or `APP_ENV=development`). **Never seed production.**

## Step 2: Run seeders
```bash
# Run all seeders
docker compose exec api php artisan db:seed

# Or run a specific seeder (if $ARGUMENTS provided)
docker compose exec api php artisan db:seed --class="$ARGUMENTS"
```

## Step 3: Verify seed data
```bash
docker compose exec api php artisan tinker --execute="echo 'Tenants: ' . \App\Models\Tenant::count(); echo PHP_EOL; echo 'Users: ' . \App\Models\User::count(); echo PHP_EOL; echo 'Customers: ' . \App\Models\Customer::count(); echo PHP_EOL; echo 'Orders: ' . \App\Models\Order::count();"
```

Report the counts of seeded records.

---

**Note:** If you need a completely fresh database with seed data:
```bash
docker compose exec api php artisan migrate:fresh --seed
```
This will **drop all tables and recreate them** — only use in development.
