<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function show(): JsonResponse
    {
        $paid = Order::query()->where('payment_status', 'paid');

        return ApiResponse::success([
            'gmv' => (float) (clone $paid)->sum('total'),
            'orders' => Order::query()->count(),
            'users' => User::query()->count(),
            'buyers' => User::query()->where('role', 'buyer')->count(),
            'sellers' => User::query()->where('role', 'seller')->count(),
            'pendingStores' => Store::query()->where('status', 'pending')->count(),
            'pendingPayouts' => Payout::query()->where('status', 'pending')->count(),
            'pendingPayoutAmount' => (float) Payout::query()->where('status', 'pending')->sum('amount'),
            'products' => Product::query()->count(),
            'payments' => Payment::query()->where('status', 'paid')->count(),
            'take' => (float) Payment::query()->where('status', 'paid')->sum('fees'),
        ]);
    }
}
