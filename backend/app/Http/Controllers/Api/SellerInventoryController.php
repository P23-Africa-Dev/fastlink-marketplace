<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerInventoryController extends Controller
{
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
