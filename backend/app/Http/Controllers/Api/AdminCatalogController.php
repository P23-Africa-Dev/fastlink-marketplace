<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\MallResource;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Mall;
use App\Support\ApiResponse;
use App\Support\UniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCatalogController extends Controller
{
    public function malls(): JsonResponse
    {
        $malls = Mall::query()->withCount('stores')->orderBy('name')->get();

        return ApiResponse::success(MallResource::collection($malls)->resolve());
    }

    public function storeMall(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'location' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        $mall = Mall::query()->create([
            ...$validated,
            'slug' => $validated['slug'] ?? UniqueSlug::make(Mall::class, $validated['name']),
        ]);

        AuditLog::record($request->user(), 'mall.created', $mall);

        return ApiResponse::success((new MallResource($mall->loadCount('stores')))->resolve(), 'Mall created.', 201);
    }

    public function updateMall(Request $request, Mall $mall): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:malls,slug,'.$mall->id],
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = UniqueSlug::make(Mall::class, $validated['name'], $mall->id);
        }

        $mall->update($validated);
        AuditLog::record($request->user(), 'mall.updated', $mall);

        return ApiResponse::success((new MallResource($mall->fresh()->loadCount('stores')))->resolve(), 'Mall updated.');
    }

    public function destroyMall(Request $request, Mall $mall): JsonResponse
    {
        AuditLog::record($request->user(), 'mall.deleted', $mall, ['name' => $mall->name]);
        $mall->delete();

        return ApiResponse::success(null, 'Mall deleted.');
    }

    public function categories(): JsonResponse
    {
        $categories = Category::query()->withCount('products')->orderBy('name')->get();

        return ApiResponse::success(CategoryResource::collection($categories)->resolve());
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        $category = Category::query()->create([
            ...$validated,
            'slug' => $validated['slug'] ?? UniqueSlug::make(Category::class, $validated['name']),
        ]);

        AuditLog::record($request->user(), 'category.created', $category);

        return ApiResponse::success((new CategoryResource($category))->resolve(), 'Category created.', 201);
    }

    public function updateCategory(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:categories,slug,'.$category->id],
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = UniqueSlug::make(Category::class, $validated['name'], $category->id);
        }

        $category->update($validated);
        AuditLog::record($request->user(), 'category.updated', $category);

        return ApiResponse::success((new CategoryResource($category->fresh()))->resolve(), 'Category updated.');
    }

    public function destroyCategory(Request $request, Category $category): JsonResponse
    {
        AuditLog::record($request->user(), 'category.deleted', $category, ['name' => $category->name]);
        $category->delete();

        return ApiResponse::success(null, 'Category deleted.');
    }

    public function brands(): JsonResponse
    {
        $brands = Brand::query()->orderBy('name')->get();

        return ApiResponse::success(BrandResource::collection($brands)->resolve());
    }

    public function storeBrand(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'product_brand' => ['nullable', 'string', 'max:255'],
            'logo_style' => ['nullable', 'string', 'max:32'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        $brand = Brand::query()->create([
            ...$validated,
            'slug' => $validated['slug'] ?? UniqueSlug::make(Brand::class, $validated['name']),
        ]);

        AuditLog::record($request->user(), 'brand.created', $brand);

        return ApiResponse::success((new BrandResource($brand))->resolve(), 'Brand created.', 201);
    }

    public function updateBrand(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'product_brand' => ['sometimes', 'nullable', 'string', 'max:255'],
            'logo_style' => ['sometimes', 'nullable', 'string', 'max:32'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:brands,slug,'.$brand->id],
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = UniqueSlug::make(Brand::class, $validated['name'], $brand->id);
        }

        $brand->update($validated);
        AuditLog::record($request->user(), 'brand.updated', $brand);

        return ApiResponse::success((new BrandResource($brand->fresh()))->resolve(), 'Brand updated.');
    }

    public function destroyBrand(Request $request, Brand $brand): JsonResponse
    {
        AuditLog::record($request->user(), 'brand.deleted', $brand, ['name' => $brand->name]);
        $brand->delete();

        return ApiResponse::success(null, 'Brand deleted.');
    }
}
