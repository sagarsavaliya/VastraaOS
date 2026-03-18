# VastraaOS — Claude Code Reference

## What is VastraaOS?
A multi-tenant SaaS platform for custom fashion order management. Built for Naari Arts (Surat, India) — digitizes the entire workflow from customer inquiry to garment delivery, including 21-stage order tracking, body measurements, GST invoicing, and artisan/worker management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Laravel 12 (PHP 8.4) |
| Web Dashboard | React 19 + Vite 7 |
| Landing Page | React 19 + Vite 7 |
| Database | MySQL 8.0 |
| Auth | Laravel Sanctum + OTP (Brevo SMS) |
| Permissions | spatie/laravel-permission |
| Email/SMS | Brevo (SMTP + SMS API) |
| PDF | barryvdh/laravel-dompdf |
| Excel | maatwebsite/excel |
| Audit Log | owen-it/laravel-auditing |
| Containerization | Docker + Nginx |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion 12 |
| HTTP Client | Axios |

---

## Project Structure

```
VastraaOS/
├── apps/
│   ├── api/                    # Laravel 12 backend
│   │   ├── app/Http/Controllers/Api/V1/   # 15 API controllers
│   │   ├── app/Models/                    # 30+ Eloquent models
│   │   ├── app/Services/                  # Business logic
│   │   ├── database/migrations/           # 30+ migrations
│   │   └── routes/api.php                 # All API routes
│   ├── web/                    # React tenant dashboard (port 3001 dev)
│   │   └── src/
│   │       ├── pages/          # Route-level page components
│   │       ├── components/     # Reusable UI components
│   │       ├── contexts/       # AuthContext, ThemeContext
│   │       ├── layouts/        # DashboardLayout, etc.
│   │       └── services/       # apiClient.js, masterDataService.js
│   └── landing/                # React landing page (port 3000 dev)
│       └── src/
│           ├── pages/          # LandingPage, SignUp, SignIn, VerificationPage
│           └── services/       # apiClient.js
├── nginx/
│   ├── web.conf                # Routes /api → Laravel, / → React
│   └── landing.conf
├── Requirements/
│   ├── Naari_Arts_System_Overview.md   # Full system design
│   └── Blueprint_Naari_Art.md
└── docker-compose.yml
```

---

## Architecture

- **Multi-tenant:** All data scoped by `tenant_id`. Users belong to a tenant. Subdomains route to tenant context.
- **API versioning:** All routes under `/api/v1/`
- **RBAC:** Roles via spatie/laravel-permission (Owner, Manager, Staff)
- **Order Workflow:** 21-stage Kanban-style tracking (OrderWorkflowTask model)
- **Invoicing:** GST-compliant with split billing, invoice number sequences per tenant

---

## Key API Controllers (`apps/api/app/Http/Controllers/Api/V1/`)

| Controller | Responsibility |
|---|---|
| AuthController | Login, OTP, registration |
| CustomerController | Customer CRUD + history |
| OrderController | Order lifecycle management |
| WorkflowController | 21-stage task tracking |
| PaymentController | Payment recording |
| InvoiceController | GST + non-GST invoicing |
| WorkerController | Artisan management |
| MeasurementController | Body measurement profiles |
| DashboardController | Analytics & KPIs |
| MasterDataController | Tenant config (item types, work types, etc.) |

---

## Key Models (`apps/api/app/Models/`)

- Core: `Tenant`, `User`, `Customer`, `Order`, `OrderItem`
- Workflow: `OrderWorkflowTask`, `OrderStatus`, `OrderPriority`
- Measurements: `MeasurementProfile`, `MeasurementRecord`, `MeasurementType`, `MeasurementValue`
- Finance: `Invoice`, `InvoiceItem`, `Payment`, `OrderPaymentSummary`
- Masters: `ItemType`, `WorkType`, `EmbellishmentZone`, `Occasion`
- Workers: `Worker`

---

## Conventions

### API (Laravel)
- Controllers stay thin — business logic lives in `app/Services/`
- All responses use consistent JSON structure: `{ success, message, data }`
- Use Form Requests for validation (never validate in controllers)
- Migrations use `tenant_id` foreign key for all tenant-scoped tables
- Soft deletes on all core models
- API routes grouped under `auth:sanctum` middleware + tenant scope middleware

### Frontend (React)
- Pages in `src/pages/`, shared components in `src/components/`
- API calls go through `src/services/apiClient.js` (Axios instance with base URL + auth header)
- Auth state managed via `AuthContext`
- Tailwind utility classes only — no custom CSS files
- React Router 7 for navigation
- Framer Motion for transitions and animations
- No `console.log` in production code

### Git Workflow
- Branch format: `feature/short-description`, `fix/issue-description`, `chore/task`
- Commit format: `type(scope): description` — e.g., `feat(api): add measurement history endpoint`
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
- Always run `php artisan test` before merging API changes

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f api
docker compose logs -f web

# Run artisan commands
docker compose exec api php artisan migrate
docker compose exec api php artisan migrate:fresh --seed
docker compose exec api php artisan tinker

# Clear caches
docker compose exec api php artisan optimize:clear

# Rebuild a container
docker compose build api --no-cache
docker compose up -d api
```

---

## Environment Setup

1. Copy `.env.example` to `.env` and fill in values
2. `docker compose up -d`
3. `docker compose exec api php artisan migrate --seed`
4. Web dashboard: http://localhost:8080
5. Landing page: http://localhost:8081
6. API: http://localhost:8080/api/v1

**Production domains:**
- API: https://api.vastraos.com
- Web app: https://app.vastraos.com
- Landing: https://vastraos.com

---

## Active Agents

Use `@agent-name` to invoke a specialist:

| Agent | When to use |
|---|---|
| `@api-developer` | Laravel controllers, models, migrations, services, routes |
| `@frontend-developer` | React components, pages, hooks, Tailwind, Axios |
| `@devops-engineer` | Docker, Nginx, env configs, deployment, CI/CD |
| `@qa-engineer` | PHPUnit tests, API testing, bug investigation, code quality |
| `@ux-ui-developer` | UI design, component layout, Tailwind styling, UX flows |
| `@product-architect` | System design, feature planning, DB schema, architecture decisions |

## Available Commands

| Command | Action |
|---|---|
| `/feature` | Start a new feature branch with context |
| `/deploy-check` | Pre-deployment safety checklist |
| `/docker-status` | Check all container health |
| `/migrate` | Run database migrations |
| `/test` | Run PHPUnit + ESLint |
| `/review` | Code review checklist |
| `/seed` | Seed the development database |
