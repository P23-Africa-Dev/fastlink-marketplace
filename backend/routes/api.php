<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MallController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SellerDashboardController;
use App\Http\Controllers\Api\SellerCustomerController;
use App\Http\Controllers\Api\SellerOnboardController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\SellerReviewController;
use App\Http\Controllers\Api\SellerSettingsController;
use App\Http\Controllers\Api\SellerStoreController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\VendorController;
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

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/seller/onboard', [SellerOnboardController::class, 'store']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::patch('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    Route::patch('/addresses/{address}/default', [AddressController::class, 'makeDefault']);

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/checkout/confirm', [CheckoutController::class, 'confirm']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/reviews', [ReviewController::class, 'store']);

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
    });
});
