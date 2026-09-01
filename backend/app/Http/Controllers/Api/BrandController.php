<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Models\Brand;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::query()->orderBy('id')->get();

        return ApiResponse::success(BrandResource::collection($brands)->resolve());
    }

    public function show(string $slug): JsonResponse
    {
        $brand = Brand::query()->where('slug', $slug)->firstOrFail();

        return ApiResponse::success((new BrandResource($brand))->resolve());
    }

    public function categories(string $slug): JsonResponse
    {
        Brand::query()->where('slug', $slug)->firstOrFail();

        $categories = Category::query()
            ->withCount('products')
            ->whereNull('parent_id')
            ->orderBy('id')
            ->get();

        return ApiResponse::success(CategoryResource::collection($categories)->resolve());
    }
}
