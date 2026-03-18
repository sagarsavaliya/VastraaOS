---
description: Run a pre-deployment safety checklist before pushing to production.
---

# Pre-Deployment Checklist for VastraaOS

Run through each item and confirm before deploying.

## 1. Tests
```bash
docker compose exec api php artisan test
```
All tests must pass. If any fail, stop here and fix them.

## 2. Environment Configuration
- [ ] `apps/web/.env.production` has `VITE_API_URL=https://api.vastraos.com/api`
- [ ] `apps/landing/.env.production` has correct API and web app URLs
- [ ] Root `.env` has all required production values (DB, mail, SMS, app key)
- [ ] `APP_ENV=production` and `APP_DEBUG=false` in production `.env`

## 3. Database
```bash
docker compose exec api php artisan migrate:status
```
- [ ] All migrations are up-to-date
- [ ] No pending migrations that could break the API

## 4. Code Quality
```bash
# Check for debug leftovers
grep -r "dd(" apps/api/app/ --include="*.php"
grep -r "console.log" apps/web/src/ --include="*.jsx"
grep -r "console.log" apps/landing/src/ --include="*.jsx"
```
- [ ] No `dd()`, `dump()`, `var_dump()` in PHP code
- [ ] No `console.log` in JS/JSX code

## 5. Build Frontend
```bash
cd apps/web && npm run build
cd apps/landing && npm run build
```
- [ ] Both builds complete without errors
- [ ] Lint passes: `npm run lint`

## 6. Laravel Optimization
```bash
docker compose exec api php artisan optimize
docker compose exec api php artisan config:cache
docker compose exec api php artisan route:cache
```

## 7. Git
```bash
git log --oneline main..HEAD
git diff main
```
- [ ] All changes are committed
- [ ] No sensitive data in commits (API keys, passwords, `.env` files)
- [ ] Branch is up to date with main

## 8. Final Health Check
```bash
docker compose ps
curl -s http://localhost:8080/api/v1/health | jq .
```
- [ ] All containers are running
- [ ] API health endpoint returns 200

**Only proceed with deployment when all items are checked.**
