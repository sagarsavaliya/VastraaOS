---
description: Run all tests — PHPUnit for the API and ESLint for both frontend apps. Usage: /test [filter]
---

Run VastraaOS test suite.

## API Tests (PHPUnit)
```bash
# Run all tests
docker compose exec api php artisan test

# With optional filter (if $ARGUMENTS provided)
docker compose exec api php artisan test --filter="$ARGUMENTS"
```

## Frontend Lint (ESLint)
```bash
# Web dashboard
cd apps/web && npm run lint

# Landing page
cd apps/landing && npm run lint
```

## After running tests:
- Report how many tests passed / failed
- If any tests failed, show the failure output and identify the root cause
- If lint errors exist, list them by file and suggest fixes
- Only mark the task complete when all tests pass and lint is clean

> Tip: To run a specific test class: `/test OrderTest`
> Tip: To run a specific test method: `/test test_owner_can_create_order`
