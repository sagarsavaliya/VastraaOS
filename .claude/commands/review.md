---
description: Code review checklist for the current changes. Run before creating a PR.
---

Perform a code review of the current changes in VastraaOS.

## Step 1: Get the diff
```bash
git diff main
git status
```

## Step 2: Review against this checklist

### Security
- [ ] No hardcoded credentials, API keys, or secrets
- [ ] All user inputs are validated via Form Requests
- [ ] SQL queries use Eloquent/Query Builder (no raw string interpolation)
- [ ] API endpoints are protected with `auth:sanctum` middleware where required
- [ ] Tenant isolation is enforced — no cross-tenant data leakage possible

### Code Quality
- [ ] No `dd()`, `dump()`, `var_dump()`, `console.log` in production code
- [ ] Business logic is in Services, not Controllers
- [ ] No N+1 queries — relationships are eager-loaded where needed
- [ ] Error responses follow the standard `{ success, message, data }` format
- [ ] New models have `tenant_id` if they are tenant-scoped

### Frontend
- [ ] No inline styles — Tailwind utilities only
- [ ] API calls go through `apiClient.js`
- [ ] Loading and error states are handled
- [ ] No direct `window.location` manipulation (use React Router)

### Tests
- [ ] New features have corresponding tests
- [ ] Bug fixes have a regression test
- [ ] All existing tests still pass

### Git
- [ ] Commits follow the convention: `type(scope): description`
- [ ] No `.env` files or secrets in the commit

## Step 3: Summarize findings
List any issues found by category (blocking vs. non-blocking) and suggest specific fixes.
