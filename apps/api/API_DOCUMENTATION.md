# Naari Arts API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints except `/auth/login` and `/auth/register` require Bearer token authentication.

Include in header:
```
Authorization: Bearer {your_token}
```

---

## Test Credentials
```
Email: owner@demo.naariarts.com
Password: demo@123
```

---

## Quick Test with cURL

### 1. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"owner@demo.naariarts.com","password":"demo@123"}'
```

### 2. Get Current User (use token from login response)
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Dashboard Stats
```bash
curl -X GET http://localhost:8000/api/v1/dashboard/stats \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Item Types
```bash
curl -X GET http://localhost:8000/api/v1/masters/item-types \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new tenant |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | Logout current session |
| POST | `/auth/logout-all` | Logout all sessions |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/password` | Change password |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get statistics |
| GET | `/dashboard/recent-orders` | Recent orders |
| GET | `/dashboard/upcoming-deliveries` | Upcoming deliveries |

### Master Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/masters/item-types` | List item types |
| GET | `/masters/work-types` | List work types |
| GET | `/masters/embellishment-zones` | List zones |
| GET | `/masters/inquiry-sources` | List sources |
| GET | `/masters/occasions` | List occasions |
| GET | `/masters/budget-ranges` | List budget ranges |
| GET | `/masters/measurement-types` | List measurement types |
| GET | `/masters/workflow-stages` | List workflow stages |
| GET | `/masters/order-statuses` | List order statuses |
| GET | `/masters/order-priorities` | List priorities |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |
| GET | `/customers/{id}/orders` | Customer orders |
| GET | `/customers/{id}/measurements` | Customer measurements |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List orders |
| POST | `/orders` | Create order |
| GET | `/orders/{id}` | Get order |
| PUT | `/orders/{id}` | Update order |
| DELETE | `/orders/{id}` | Delete order |
| GET | `/orders/{id}/workflow` | Order workflow |
| GET | `/orders/{id}/payments` | Order payments |
| PUT | `/orders/{id}/status` | Update status |

### Workflow
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflow/board` | Kanban board data |
| GET | `/workflow/tasks` | List tasks |
| PUT | `/workflow/tasks/{id}/status` | Update task status |
| PUT | `/workflow/tasks/{id}/assign` | Assign task |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List invoices |
| POST | `/invoices` | Create invoice |
| GET | `/invoices/{id}` | Get invoice |
| GET | `/invoices/{id}/pdf` | Download PDF |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| POST | `/payments` | Record payment |
| GET | `/payments/summary/{order_id}` | Order payment summary |

---

## Viewing APIs in Browser

### Option 1: Laravel Telescope (Debug Tool)
Visit: http://localhost:8000/telescope

### Option 2: Direct API Testing
Use browser extensions like:
- **Postman** (Desktop app)
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

### Option 3: Browser Console
```javascript
// Login
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'owner@demo.naariarts.com',
    password: 'demo@123'
  })
}).then(r => r.json()).then(console.log)
```

---

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error"]
  }
}
```

### Paginated Response
```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```
