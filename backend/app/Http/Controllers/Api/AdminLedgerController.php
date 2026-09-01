<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LedgerEntryResource;
use App\Models\LedgerEntry;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLedgerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LedgerEntry::query()->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('store_id')) {
            $query->where('store_id', $request->query('store_id'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 50);
        $total = (clone $query)->count();
        $entries = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            LedgerEntryResource::collection($entries)->resolve(),
            $total,
            $page,
            $limit,
        );
    }
}
