<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SellerProductController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $query = Product::query()
            ->with(['images', 'variants', 'store', 'brand', 'category'])
            ->orderByDesc('id');

        if ($request->user()->role !== 'admin') {
            $query->whereIn('store_id', $request->user()->stores()->pluck('id'));
        }

        if (! $request->filled('status') || $request->query('status') === 'All') {
            $query->where('status', '!=', 'archived');
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', $q)->orWhere('sku', 'like', $q);
            });
        }

        if ($request->filled('status') && $request->query('status') !== 'All') {
            $query->where('status', strtolower((string) $request->query('status')));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 50);
        $total = (clone $query)->count();
        $products = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ProductResource::collection($products)->resolve($request),
            $total,
            $page,
            $limit,
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        $store = $this->resolveStore($request);
        $validated = $this->validatedPayload($request);

        $product = Product::query()->create([
            ...$this->productAttributes($validated),
            'store_id' => $store->id,
            'slug' => Product::uniqueSlug($validated['name']),
            'sku' => Product::uniqueSku($validated['sku'] ?? null),
        ]);

        $this->syncImages($product, $validated['image_urls'] ?? []);
        $this->syncVariants($product, $validated['variants'] ?? []);

        $product->load(['images', 'variants', 'store', 'brand', 'category']);

        return ApiResponse::success((new ProductResource($product))->resolve($request), 'Product created.', 201);
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $this->authorize('view', $product);
        $product->load(['images', 'variants', 'store', 'brand', 'category']);

        return ApiResponse::success((new ProductResource($product))->resolve($request));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $validated = $this->validatedPayload($request, $product);
        $product->fill($this->productAttributes($validated));

        if (isset($validated['name']) && $validated['name'] !== $product->getOriginal('name') && empty($validated['slug'])) {
            $product->slug = Product::uniqueSlug($validated['name']);
        }

        $product->save();

        if (array_key_exists('image_urls', $validated)) {
            $product->images()->delete();
            $this->syncImages($product, $validated['image_urls'] ?? []);
        }

        if (array_key_exists('variants', $validated)) {
            $product->variants()->delete();
            $this->syncVariants($product, $validated['variants'] ?? []);
        }

        $product->load(['images', 'variants', 'store', 'brand', 'category']);

        return ApiResponse::success((new ProductResource($product))->resolve($request), 'Product updated.');
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $product->update(['status' => 'archived']);

        return ApiResponse::success(null, 'Product archived.');
    }

    public function images(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $request->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['file', 'image', 'max:5120'],
        ]);

        $start = (int) $product->images()->max('sort_order');
        foreach ($request->file('images', []) as $index => $file) {
            $path = $file->store('products', 'public');
            $product->images()->create([
                'url' => Storage::disk('public')->url($path),
                'alt' => $product->name,
                'is_primary' => $product->images()->count() === 0 && $index === 0,
                'sort_order' => $start + $index + 1,
            ]);
        }

        $product->load(['images', 'variants', 'store', 'brand', 'category']);

        return ApiResponse::success((new ProductResource($product))->resolve($request), 'Images uploaded.');
    }

    public function stock(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $product->update(['stock' => $validated['stock']]);
        $product->load(['images', 'variants', 'store', 'brand', 'category']);

        return ApiResponse::success((new ProductResource($product))->resolve($request), 'Stock updated.');
    }

    private function resolveStore(Request $request): Store
    {
        $user = $request->user();

        if ($user->role === 'admin' && $request->filled('store_id')) {
            return Store::query()->findOrFail($request->input('store_id'));
        }

        $store = $user->store;
        if (! $store) {
            abort(422, 'Create a store before adding products.');
        }

        return $store;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'name' => [$product ? 'sometimes' : 'required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($product?->id)],
            'description' => ['nullable', 'string'],
            'long_description' => ['nullable', 'string'],
            'price' => [$product ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'archived'])],
            'category' => ['nullable', 'string', 'max:120'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'brand' => ['nullable', 'string', 'max:120'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'subcategory' => ['nullable', 'string', 'max:120'],
            'is_featured' => ['nullable', 'boolean'],
            'is_new' => ['nullable', 'boolean'],
            'is_bestseller' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
            'image_urls' => ['nullable', 'array'],
            'image_urls.*' => ['string', 'max:2048'],
            'variants' => ['nullable', 'array'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:40'],
            'variants.*.value' => ['required_with:variants', 'string', 'max:80'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.price_modifier' => ['nullable', 'numeric'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function productAttributes(array $validated): array
    {
        $categoryId = $validated['category_id'] ?? null;
        if (! $categoryId && ! empty($validated['category'])) {
            $categoryId = Category::query()
                ->where('slug', $validated['category'])
                ->orWhere('name', $validated['category'])
                ->value('id');
        }

        $brandId = $validated['brand_id'] ?? null;
        if (! $brandId && ! empty($validated['brand'])) {
            $brandId = Brand::query()
                ->where('slug', $validated['brand'])
                ->orWhere('product_brand', $validated['brand'])
                ->orWhere('name', $validated['brand'])
                ->value('id');
        }

        $status = $validated['status'] ?? 'active';

        return array_filter([
            'name' => $validated['name'] ?? null,
            'description' => $validated['description'] ?? null,
            'long_description' => $validated['long_description'] ?? null,
            'price' => $validated['price'] ?? null,
            'compare_at_price' => $validated['compare_at_price'] ?? null,
            'cost_price' => $validated['cost_price'] ?? null,
            'stock' => $validated['stock'] ?? null,
            'status' => $status,
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'subcategory' => $validated['subcategory'] ?? null,
            'is_featured' => $validated['is_featured'] ?? null,
            'is_new' => $validated['is_new'] ?? null,
            'is_bestseller' => $validated['is_bestseller'] ?? null,
            'tags' => $validated['tags'] ?? null,
        ], fn ($value) => $value !== null);
    }

    /**
     * @param  list<string>  $urls
     */
    private function syncImages(Product $product, array $urls): void
    {
        foreach (array_values($urls) as $index => $url) {
            if (! is_string($url) || $url === '') {
                continue;
            }

            $product->images()->create([
                'url' => $url,
                'alt' => $product->name,
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }
    }

    /**
     * @param  list<array<string, mixed>>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        foreach ($variants as $variant) {
            $product->variants()->create([
                'name' => $variant['name'],
                'value' => $variant['value'],
                'stock' => $variant['stock'] ?? 0,
                'price_modifier' => $variant['price_modifier'] ?? 0,
            ]);
        }
    }
}
