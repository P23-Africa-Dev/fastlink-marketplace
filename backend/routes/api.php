<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AdminAnalyticsController;
use App\Http\Controllers\Api\AdminAuditLogController;
use App\Http\Controllers\Api\AdminCatalogController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminFinanceController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminStoreController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MallController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RiderController;
use App\Http\Controllers\Api\SellerDashboardController;
use App\Http\Controllers\Api\SellerCustomerController;
use App\Http\Controllers\Api\SellerOnboardController;
use App\Http\Controllers\Api\SellerAnalyticsController;
use App\Http\Controllers\Api\SellerCampaignController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerPaymentController;
use App\Http\Controllers\Api\SellerPayoutController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\SellerReviewController;
use App\Http\Controllers\Api\SellerSettingsController;
use App\Http\Controllers\Api\SellerStoreController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::patch('/profile', [AuthController::class, 'updateProfile']);
    });
});

Route::get('/malls', [MallController::class, 'index']);
Route::get('/malls/{slug}', [MallController::class, 'show']);
Route::get('/malls/{slug}/stores', [MallController::class, 'stores']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{slug}', [BrandController::class, 'show']);
Route::get('/brands/{slug}/categories', [BrandController::class, 'categories']);
Route::get('/deals', [DealController::class, 'index']);
Route::get('/vendors/emerging', [VendorController::class, 'emerging']);
Route::get('/stores/nationwide', [StoreController::class, 'nationwide']);
Route::get('/stores/{slug}', [StoreController::class, 'show']);
Route::get('/stores/{slug}/products', [StoreController::class, 'products']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{idOrSlug}/reviews', [ReviewController::class, 'index']);
Route::get('/products/{idOrSlug}', [ProductController::class, 'show']);
Route::get('/search', [ProductController::class, 'search']);
Route::get('/orders/{order}/track', [OrderController::class, 'track']);
Route::post('/webhooks/paystack', PaystackWebhookController::class);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/seller/onboard', [SellerOnboardController::class, 'store']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::patch('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    Route::patch('/addresses/{address}/default', [AddressController::class, 'makeDefault']);

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/checkout/initialize', [CheckoutController::class, 'initialize']);
    Route::post('/checkout/verify', [CheckoutController::class, 'verify']);
    Route::post('/checkout/confirm', [CheckoutController::class, 'confirm']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'message']);
    Route::patch('/conversations/{conversation}/read', [ConversationController::class, 'read']);
    Route::patch('/conversations/{conversation}', [ConversationController::class, 'update']);
    Route::delete('/conversations/{conversation}', [ConversationController::class, 'destroy']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);

    Route::post('/rider/register', [RiderController::class, 'register']);

    Route::middleware('role:rider')->group(function (): void {
        Route::get('/rider/me', [RiderController::class, 'me']);
        Route::get('/rider/orders', [RiderController::class, 'orders']);
    });

    Route::middleware('role:seller,admin')->group(function (): void {
        Route::get('/seller/products', [SellerProductController::class, 'index']);
        Route::post('/seller/products', [SellerProductController::class, 'store']);
        Route::get('/seller/products/{product}', [SellerProductController::class, 'show']);
        Route::put('/seller/products/{product}', [SellerProductController::class, 'update']);
        Route::patch('/seller/products/{product}', [SellerProductController::class, 'update']);
        Route::delete('/seller/products/{product}', [SellerProductController::class, 'destroy']);
        Route::post('/seller/products/{product}/images', [SellerProductController::class, 'images']);
        Route::patch('/seller/products/{product}/stock', [SellerProductController::class, 'stock']);

        Route::get('/seller/orders', [SellerOrderController::class, 'index']);
        Route::get('/seller/orders/{order}', [SellerOrderController::class, 'show']);
        Route::patch('/seller/orders/{order}/status', [SellerOrderController::class, 'updateStatus']);

        Route::get('/seller/dashboard', [SellerDashboardController::class, 'show']);
        Route::get('/seller/customers', [SellerCustomerController::class, 'index']);
        Route::get('/seller/customers/{customer}', [SellerCustomerController::class, 'show']);
        Route::get('/seller/store', [SellerStoreController::class, 'show']);
        Route::patch('/seller/store', [SellerStoreController::class, 'update']);
        Route::get('/seller/settings', [SellerSettingsController::class, 'show']);
        Route::patch('/seller/settings', [SellerSettingsController::class, 'update']);
        Route::get('/seller/reviews', [SellerReviewController::class, 'index']);
        Route::post('/seller/reviews/{review}/reply', [SellerReviewController::class, 'reply']);
        Route::patch('/seller/reviews/{review}', [SellerReviewController::class, 'update']);

        Route::get('/seller/payments', [SellerPaymentController::class, 'index']);
        Route::get('/seller/payouts', [SellerPayoutController::class, 'index']);
        Route::post('/seller/payouts', [SellerPayoutController::class, 'store']);
        Route::get('/seller/payout-accounts', [SellerPayoutController::class, 'accounts']);
        Route::post('/seller/payout-accounts', [SellerPayoutController::class, 'updateAccount']);

        Route::get('/seller/analytics', [SellerAnalyticsController::class, 'show']);
        Route::get('/seller/marketing/campaigns', [SellerCampaignController::class, 'index']);
        Route::post('/seller/marketing/campaigns', [SellerCampaignController::class, 'store']);
        Route::patch('/seller/marketing/campaigns/{campaign}', [SellerCampaignController::class, 'update']);

        Route::get('/seller/support/tickets', [SupportTicketController::class, 'index']);
        Route::post('/seller/support/tickets', [SupportTicketController::class, 'store']);
        Route::get('/seller/support/tickets/{ticket}', [SupportTicketController::class, 'show']);
        Route::post('/seller/support/tickets/{ticket}/messages', [SupportTicketController::class, 'message']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/dashboard', [AdminDashboardController::class, 'show']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);

        Route::get('/stores', [AdminStoreController::class, 'index']);
        Route::get('/stores/{store}', [AdminStoreController::class, 'show']);
        Route::post('/stores/{store}/approve', [AdminStoreController::class, 'approve']);
        Route::post('/stores/{store}/reject', [AdminStoreController::class, 'reject']);
        Route::post('/stores/{store}/suspend', [AdminStoreController::class, 'suspend']);

        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::patch('/products/{product}/unpublish', [AdminProductController::class, 'unpublish']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

        Route::get('/payments', [AdminFinanceController::class, 'payments']);
        Route::get('/payouts', [AdminFinanceController::class, 'payouts']);
        Route::post('/payouts/{payout}/approve', [AdminFinanceController::class, 'approvePayout']);
        Route::post('/payouts/{payout}/reject', [AdminFinanceController::class, 'rejectPayout']);
        Route::get('/settings/commission', [AdminFinanceController::class, 'commission']);
        Route::patch('/settings/commission', [AdminFinanceController::class, 'updateCommission']);

        Route::get('/malls', [AdminCatalogController::class, 'malls']);
        Route::post('/malls', [AdminCatalogController::class, 'storeMall']);
        Route::patch('/malls/{mall}', [AdminCatalogController::class, 'updateMall']);
        Route::delete('/malls/{mall}', [AdminCatalogController::class, 'destroyMall']);
        Route::get('/categories', [AdminCatalogController::class, 'categories']);
        Route::post('/categories', [AdminCatalogController::class, 'storeCategory']);
        Route::patch('/categories/{category}', [AdminCatalogController::class, 'updateCategory']);
        Route::delete('/categories/{category}', [AdminCatalogController::class, 'destroyCategory']);
        Route::get('/brands', [AdminCatalogController::class, 'brands']);
        Route::post('/brands', [AdminCatalogController::class, 'storeBrand']);
        Route::patch('/brands/{brand}', [AdminCatalogController::class, 'updateBrand']);
        Route::delete('/brands/{brand}', [AdminCatalogController::class, 'destroyBrand']);

        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
        Route::get('/analytics', [AdminAnalyticsController::class, 'show']);

        Route::get('/support/tickets', [SupportTicketController::class, 'index']);
        Route::get('/support/tickets/{ticket}', [SupportTicketController::class, 'show']);
        Route::post('/support/tickets/{ticket}/messages', [SupportTicketController::class, 'message']);
        Route::patch('/support/tickets/{ticket}', [SupportTicketController::class, 'update']);

        Route::get('/riders', [RiderController::class, 'adminIndex']);
        Route::post('/riders/{rider}/approve', [RiderController::class, 'approve']);
        Route::patch('/orders/{order}/assign-rider', [RiderController::class, 'assign']);
    });
});
