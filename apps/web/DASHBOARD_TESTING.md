# Dashboard Implementation - Testing Guide

## Prerequisites
1. **Laravel API must be running** on `http://localhost:8000`
2. **Database must be seeded** with demo data

## Testing Steps

### 1. Start Laravel API (if not running)
```bash
cd apps/api
php artisan serve
```

### 2. Verify API is accessible
Open browser and visit: `http://localhost:8000/api/v1`

### 3. Test Login Endpoint
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"owner@demo.naariarts.com","password":"demo@123"}'
```

Expected response:
```json
{
  "token": "your-auth-token-here",
  "user": { ... }
}
```

### 4. Test Dashboard Stats Endpoint
```bash
curl -X GET http://localhost:8000/api/v1/dashboard/stats \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Login to Web App
1. Navigate to `http://localhost:5173`
2. You'll see an error initially (expected - no auth yet)
3. Open browser console
4. Run this to set auth token:
```javascript
localStorage.setItem('auth_token', 'YOUR_TOKEN_FROM_STEP_3');
location.reload();
```

### 6. Verify Dashboard Loads
- Check that KPI cards show real data
- Verify Recent Orders table populates
- Check Upcoming Deliveries widget

## Troubleshooting

### CORS Errors
If you see CORS errors, add this to `apps/api/config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
```

### 401 Unauthorized
- Token expired or invalid
- Re-login using Step 3
- Update token in localStorage

### Network Error
- Check Laravel API is running on port 8000
- Verify `.env` file has correct `VITE_API_BASE_URL`

## Next Steps
- Implement proper login page
- Add token refresh mechanism
- Add logout functionality
