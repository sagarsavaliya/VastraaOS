#!/bin/bash
# Exit on error
set -e

# Run standard Laravel production optimizations
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache