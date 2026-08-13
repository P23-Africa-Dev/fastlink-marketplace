<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MallResource;
use App\Http\Resources\StoreResource;
use App\Models\Mall;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MallController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Mall::query()->withCount('stores')->orderBy('id');

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', $q)
                    ->orWhere('location', 'like', $q)
                    ->orWhere('city', 'like', $q);
            });
        }

        if ($request->filled('city')) {
            $query->where('city', $request->query('city'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 16);
        $total = (clone $query)->count();
        $malls = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            MallResource::collection($malls)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(string $slug): JsonResponse
    {
        $mall = Mall::query()->withCount('stores')->where('slug', $slug)->firstOrFail();

        return ApiResponse::success((new MallResource($mall))->resolve());
    }

    public function stores(Request $request, string $slug): JsonResponse
    {
        $mall = Mall::query()->where('slug', $slug)->firstOrFail();

        $query = $mall->stores()
            ->with(['category', 'mall'])
            ->where('status', 'approved');

        $category = $request->query('category');
        if ($category && $category !== 'all') {
            $query->whereHas('category', function ($inner) use ($category) {
                $inner->where('slug', $category)->orWhere('name', $category);
            });
        }

        $stores = $query->orderBy('name')->get();

        return ApiResponse::success(StoreResource::collection($stores)->resolve());
    }
}
