<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerInventoryController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $products = Product::query()->whereIn('store_id', $storeIds);
        $movements = InventoryMovement::query()->whereIn('store_id', $storeIds);

        $lowStockProducts = (clone $products)
            ->where('stock', '<=', 5)
            ->where('stock', '>', 0)
            ->orderBy('stock')
            ->limit(8)
            ->get(['id', 'name', 'sku', 'stock'])
            ->map(fn (Product $product) => [
                'id' => (string) $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'stock' => (int) $product->stock,
            ]);

        return ApiResponse::success([
            'totalProducts' => (clone $products)->count(),
            'outOfStockCount' => (clone $products)->where('stock', 0)->count(),
            'lowStockCount' => (clone $products)->where('stock', '<=', 5)->where('stock', '>', 0)->count(),
            'movementCount7d' => (clone $movements)->where('created_at', '>=', now()->subDays(7))->count(),
            'lastMovementAt' => optional((clone $movements)->latest('id')->first())->created_at?->toIso8601String(),
            'lowStockProducts' => $lowStockProducts->values()->all(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $query = InventoryMovement::query()
            ->with(['product:id,name,sku'])
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get()->map(fn (InventoryMovement $row) => [
            'id' => (string) $row->id,
            'type' => $row->type,
            'quantityDelta' => $row->quantity_delta,
            'quantityAfter' => $row->quantity_after,
            'note' => $row->note,
            'product' => $row->product ? [
                'id' => (string) $row->product->id,
                'name' => $row->product->name,
                'sku' => $row->product->sku,
            ] : null,
            'createdAt' => $row->created_at?->toIso8601String(),
        ]);

        return ApiResponse::paginated($rows->all(), $total, $page, $limit);
    }
}
