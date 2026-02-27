<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\CustomerInquiryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\MasterDataController;
use App\Http\Controllers\Api\V1\MeasurementController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WorkerController;
use App\Http\Controllers\Api\V1\WorkflowController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API Version 1
Route::prefix('v1')->group(function () {

    // =============================================
    // Public Routes (No Authentication)
    // =============================================
    Route::post('/auth/register', [App\Http\Controllers\Api\V1\TenantRegistrationController::class, 'register']);
    Route::get('/auth/check-subdomain', [App\Http\Controllers\Api\V1\TenantRegistrationController::class, 'checkSubdomain']);
    Route::post('/auth/verify-otp', [App\Http\Controllers\Api\V1\TenantRegistrationController::class, 'verifyOtp']);
    Route::post('/auth/resend-otp', [App\Http\Controllers\Api\V1\TenantRegistrationController::class, 'resendOtp']);
    Route::post('/auth/verify-tenant', [App\Http\Controllers\Api\V1\TenantRegistrationController::class, 'verify']); // legacy — returns 410
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/verify-login-otp', [AuthController::class, 'verifyLoginOtp']);
    Route::post('/auth/resend-login-otp', [AuthController::class, 'resendLoginOtp']);

    // Public inquiry submission (for website forms)
    // Route::post('/inquiries/public', [CustomerInquiryController::class, 'publicSubmit']);

    // =============================================
    // Authenticated Routes
    // =============================================
    Route::middleware(['auth:sanctum', 'tenant.context', 'tenant.active'])->group(function () {

        // -----------------------------------------
        // Authentication
        // -----------------------------------------
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/logout-all', [AuthController::class, 'logoutAll']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::put('/password', [AuthController::class, 'changePassword']);
        });

        // -----------------------------------------
        // Dashboard
        // -----------------------------------------
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/recent-orders', [DashboardController::class, 'recentOrders']);
        Route::get('/dashboard/upcoming-deliveries', [DashboardController::class, 'upcomingDeliveries']);

        // -----------------------------------------
        // Master Data (Read-only for most users)
        // -----------------------------------------
        Route::prefix('masters')->group(function () {
            Route::post('/seed-defaults', [MasterDataController::class, 'seedDefaults']);
            Route::get('/item-types', [MasterDataController::class, 'itemTypes']);
            Route::get('/work-types', [MasterDataController::class, 'workTypes']);
            Route::get('/embellishment-zones', [MasterDataController::class, 'embellishmentZones']);
            Route::get('/inquiry-sources', [MasterDataController::class, 'inquirySources']);
            Route::get('/occasions', [MasterDataController::class, 'occasions']);
            Route::get('/budget-ranges', [MasterDataController::class, 'budgetRanges']);
            Route::get('/measurement-types', [MasterDataController::class, 'measurementTypes']);
            Route::get('/workflow-stages', [MasterDataController::class, 'workflowStages']);
            Route::get('/order-statuses', [MasterDataController::class, 'orderStatuses']);
            Route::get('/order-priorities', [MasterDataController::class, 'orderPriorities']);

            // CRUD for master data (Owner/Manager only)
            Route::middleware(['permission:settings.master_data'])->group(function () {
                $masterTypes = [
                    'item-types',
                    'work-types',
                    'embellishment-zones',
                    'inquiry-sources',
                    'occasions',
                    'budget-ranges'
                ];

                foreach ($masterTypes as $type) {
                    Route::post($type, [MasterDataController::class, 'store'])->defaults('type', $type);
                    Route::put($type . '/{id}', [MasterDataController::class, 'update'])->defaults('type', $type);
                    Route::delete($type . '/{id}', [MasterDataController::class, 'destroy'])->defaults('type', $type);
                }
            });
        });

        // -----------------------------------------
        // Customers
        // -----------------------------------------
        Route::apiResource('customers', CustomerController::class);
        Route::get('/customers/{customer}/orders', [CustomerController::class, 'orders']);
        Route::get('/customers/{customer}/measurements', [CustomerController::class, 'measurements']);
        Route::get('/customers/{customer}/inquiries', [CustomerController::class, 'inquiries']);

        // -----------------------------------------
        // Customer Inquiries
        // -----------------------------------------
        Route::apiResource('inquiries', CustomerInquiryController::class);
        Route::post('/inquiries/{inquiry}/convert', [CustomerInquiryController::class, 'convertToOrder']);
        Route::put('/inquiries/{inquiry}/status', [CustomerInquiryController::class, 'updateStatus']);

        // -----------------------------------------
        // Measurements
        // -----------------------------------------
        Route::prefix('measurements')->group(function () {
            Route::get('/profiles/{customer}', [MeasurementController::class, 'profiles']);
            Route::post('/profiles', [MeasurementController::class, 'createProfile']);
            Route::put('/profiles/{profile}', [MeasurementController::class, 'updateProfile']);
            Route::delete('/profiles/{profile}', [MeasurementController::class, 'deleteProfile']);

            Route::get('/records/{profile}', [MeasurementController::class, 'records']);
            Route::post('/records', [MeasurementController::class, 'createRecord']);
            Route::get('/records/{record}', [MeasurementController::class, 'showRecord']);
        });

        // -----------------------------------------
        // Orders
        // -----------------------------------------
        Route::apiResource('orders', OrderController::class);
        Route::prefix('orders/{order}')->group(function () {
            Route::get('/workflow', [OrderController::class, 'workflow']);
            Route::get('/payments', [OrderController::class, 'payments']);
            Route::get('/invoices', [OrderController::class, 'invoices']);
            Route::put('/status', [OrderController::class, 'updateStatus']);
            Route::post('/duplicate', [OrderController::class, 'duplicate']);
        });

        // Order Items
        Route::prefix('order-items')->group(function () {
            Route::post('/', [OrderController::class, 'addItem']);
            Route::put('/{item}', [OrderController::class, 'updateItem']);
            Route::delete('/{item}', [OrderController::class, 'deleteItem']);
            Route::put('/{item}/fabrics', [OrderController::class, 'updateItemFabrics']);
            Route::put('/{item}/embellishments', [OrderController::class, 'updateItemEmbellishments']);
            Route::put('/{item}/stitching', [OrderController::class, 'updateItemStitching']);

            // Cost estimation (Owner only)
            Route::middleware(['permission:orders.edit_cost'])->group(function () {
                Route::get('/{item}/cost-estimate', [OrderController::class, 'getCostEstimate']);
                Route::put('/{item}/cost-estimate', [OrderController::class, 'updateCostEstimate']);
            });
        });

        // -----------------------------------------
        // Workflow
        // -----------------------------------------
        Route::prefix('workflow')->group(function () {
            Route::get('/', [WorkflowController::class, 'index']);
            Route::get('/board', [WorkflowController::class, 'board']);
            Route::get('/items/{item}', [WorkflowController::class, 'showItem']);
            Route::get('/tasks', [WorkflowController::class, 'tasks']);
            Route::get('/tasks/{task}', [WorkflowController::class, 'showTask']);
            Route::put('/tasks/{task}/status', [WorkflowController::class, 'updateTaskStatus']);
            Route::put('/tasks/{task}/assign', [WorkflowController::class, 'assignTask']);
            Route::post('/tasks/{task}/comments', [WorkflowController::class, 'addComment']);
            Route::post('/tasks/{task}/photos', [WorkflowController::class, 'uploadPhotos']);
        });

        // -----------------------------------------
        // Workers
        // -----------------------------------------
        Route::get('/workers/stats', [WorkerController::class, 'stats']);
        Route::apiResource('workers', WorkerController::class);
        Route::get('/workers/{worker}/skills', [WorkerController::class, 'skills']);
        Route::post('/workers/{worker}/skills', [WorkerController::class, 'addSkill']);
        Route::delete('/workers/{worker}/skills/{skill}', [WorkerController::class, 'removeSkill']);
        Route::get('/workers/{worker}/assignments', [WorkerController::class, 'assignments']);

        // -----------------------------------------
        // Invoices
        // -----------------------------------------
        Route::apiResource('invoices', InvoiceController::class)->except(['update']);
        Route::prefix('invoices/{invoice}')->group(function () {
            Route::get('/pdf', [InvoiceController::class, 'downloadPdf']);
            Route::put('/status', [InvoiceController::class, 'updateStatus']);
            Route::post('/send', [InvoiceController::class, 'send']);
        });

        // -----------------------------------------
        // Payments
        // -----------------------------------------
        Route::apiResource('payments', PaymentController::class)->except(['update', 'destroy']);
        Route::get('/payments/summary/{order}', [PaymentController::class, 'orderSummary']);

        // -----------------------------------------
        // Users (Team Management)
        // -----------------------------------------
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
            Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
            Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:users.view');
            Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:users.edit');
            Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
            Route::put('/{user}/status', [UserController::class, 'updateStatus'])->middleware('permission:users.edit');
            Route::put('/{user}/role', [UserController::class, 'updateRole'])->middleware('permission:users.edit');
        });

        // -----------------------------------------
        // Super Admin Management
        // -----------------------------------------
        Route::middleware(['super-admin'])->prefix('super-admin')->group(function () {
            // Tenant Management
            Route::get('/tenants', [App\Http\Controllers\Api\V1\SuperAdmin\TenantController::class, 'index']);
            Route::get('/tenants/stats', [App\Http\Controllers\Api\V1\SuperAdmin\TenantController::class, 'globalStats']);
            Route::get('/tenants/{tenant}', [App\Http\Controllers\Api\V1\SuperAdmin\TenantController::class, 'show']);
            Route::put('/tenants/{tenant}', [App\Http\Controllers\Api\V1\SuperAdmin\TenantController::class, 'update']);
            Route::put('/tenants/{tenant}/status', [App\Http\Controllers\Api\V1\SuperAdmin\TenantController::class, 'updateStatus']);

            // Admin Management
            Route::get('/admins', [App\Http\Controllers\Api\V1\SuperAdmin\AdminController::class, 'index']);
            Route::post('/admins', [App\Http\Controllers\Api\V1\SuperAdmin\AdminController::class, 'store']);
            Route::delete('/admins/{user}', [App\Http\Controllers\Api\V1\SuperAdmin\AdminController::class, 'destroy']);
        });

        // -----------------------------------------
        // Settings
        // -----------------------------------------
        Route::prefix('settings')->group(function () {
            Route::get('/tenant', [App\Http\Controllers\Api\V1\SettingsController::class, 'getTenantSettings']);
            Route::put('/tenant', [App\Http\Controllers\Api\V1\SettingsController::class, 'updateTenantSettings']);
            Route::put('/onboarding', [App\Http\Controllers\Api\V1\SettingsController::class, 'updateOnboardingStatus']);
            Route::get('/subscription', [App\Http\Controllers\Api\V1\SettingsController::class, 'getSubscription']);
        });
    });
});
