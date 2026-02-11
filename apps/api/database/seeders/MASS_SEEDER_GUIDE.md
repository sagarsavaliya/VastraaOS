# Mass Data Seeder - Usage Guide

## Overview
The `MassDataSeeder` generates thousands of realistic test records for development and performance testing.

## What It Creates
- **500 Customers** with realistic Indian names, addresses, and contact details
- **2,000 Orders** with varying statuses, priorities, and dates
- **Order Items** (1-4 items per order)
- **Payments** (realistic payment patterns)
- **Invoices** (60% of orders)
- **Payment Summaries**

## Configuration
Edit these variables in `MassDataSeeder.php`:
```php
$numCustomers = 500;  // Number of customers
$numOrders = 2000;    // Number of orders
```

## How to Run

### Option 1: Run via Artisan Command
```bash
cd apps/api
php artisan db:seed --class=MassDataSeeder
```

### Option 2: Fresh Database with Mass Data
```bash
cd apps/api
php artisan migrate:fresh
php artisan db:seed --class=DatabaseSeeder
php artisan db:seed --class=MassDataSeeder
```

## Performance
- Uses batch inserts (100 customers, 50 orders per batch)
- Processes in chunks to avoid memory issues
- Shows progress for each batch
- Typical execution time:
  - 500 customers: ~5-10 seconds
  - 2,000 orders: ~30-60 seconds

## Data Characteristics
- **Customers**: Indian names, realistic mobile numbers, addresses
- **Orders**: 
  - Dates: Last 180 days
  - Amounts: ₹5,000 to ₹1,00,000
  - Payment Status: 70% partial, 20% paid, 10% pending
  - Delivery: 7-45 days from order date
- **Payments**: Multiple installments, various methods (cash, UPI, bank transfer, card)

## Tips
1. **Start Small**: Test with 100 customers and 500 orders first
2. **Monitor Performance**: Check dashboard load times with different data volumes
3. **Clean Up**: Use `php artisan migrate:fresh` to reset database
4. **Adjust Ratios**: Modify payment status percentages in the code as needed

## Troubleshooting
- **Memory Issues**: Reduce batch sizes or total counts
- **Timeout**: Increase PHP `max_execution_time` in php.ini
- **Foreign Key Errors**: Ensure `DatabaseSeeder` ran first to create master data
