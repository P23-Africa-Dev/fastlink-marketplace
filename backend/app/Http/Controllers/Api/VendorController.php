<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class VendorController extends Controller
{
    public function emerging(): JsonResponse
    {
        $stores = Store::query()
            ->with('category')
            ->where('type', 'emerging')
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        $data = $stores->map(function (Store $store) {
            return [
                'id' => (string) $store->id,
                'name' => $store->name,
                'category' => $store->headline ?: ($store->category?->name ?? ''),
                'image' => $store->logo,
                'href' => '/stores/'.$store->slug,
            ];
        })->values()->all();

        return ApiResponse::success($data);
    }
}
