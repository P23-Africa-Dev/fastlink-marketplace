<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\AuditLog;
use App\Models\Product;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['store', 'category', 'brand', 'images'])->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', $q)->orWhere('sku', 'like', $q)->orWhere('slug', 'like', $q);
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $products = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ProductResource::collection($products)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['store', 'category', 'brand', 'images', 'variants']);

        return ApiResponse::success((new ProductResource($product))->resolve());
    }

    public function unpublish(Request $request, Product $product): JsonResponse
    {
        $product->update(['status' => 'archived']);
        AuditLog::record($request->user(), 'product.unpublished', $product);

        $product->loadMissing('store.owner');
        if ($product->store?->owner) {
            app(NotificationService::class)->notify(
                $product->store->owner,
                'product.unpublished',
                'Your listing was unpublished',
                $product->name.' was taken down from the marketplace catalog.',
                [
                    'productId' => (string) $product->id,
                    'productName' => $product->name,
                    'ctaUrl' => rtrim((string) config('app.frontend_url'), '/').'/all-products',
                    'ctaLabel' => 'View products',
                ],
            );
        }

        return ApiResponse::success(
            (new ProductResource($product->fresh(['store', 'category', 'brand', 'images'])))->resolve(),
            'Product unpublished.',
        );
    }

    public function moderation(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with(['store', 'category', 'brand', 'images'])
            ->whereIn('status', ['submitted', 'under_review'])
            ->orderByDesc('id');

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $products = $query->forPage($page, $limit)->get();

        return ApiResponse::success([
            'data' => ProductResource::collection($products)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pendingCount' => Product::query()->where('status', 'submitted')->count(),
        ]);
    }

    public function approveModeration(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        if (! in_array($product->status, ['submitted', 'under_review'], true)) {
            throw ValidationException::withMessages(['status' => 'Product is not awaiting moderation.']);
        }

        $product->update([
            'status' => 'published',
            'moderation_note' => $validated['note'] ?? null,
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);
        AuditLog::record($request->user(), 'product.approved', $product, ['note' => $validated['note'] ?? null]);

        $product->loadMissing('store.owner');
        if ($product->store?->owner) {
            app(NotificationService::class)->notify(
                $product->store->owner,
                'product.approved',
                'Your listing was approved',
                $product->name.' is now live on Fastlink.',
                [
                    'productId' => (string) $product->id,
                    'productName' => $product->name,
                    'ctaUrl' => rtrim((string) config('app.frontend_url'), '/').'/all-products',
                    'ctaLabel' => 'View listing',
                ],
            );
        }

        return ApiResponse::success(
            (new ProductResource($product->fresh(['store', 'category', 'brand', 'images'])))->resolve(),
            'Product approved and published.',
        );
    }

    public function rejectModeration(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        if (! in_array($product->status, ['submitted', 'under_review'], true)) {
            throw ValidationException::withMessages(['status' => 'Product is not awaiting moderation.']);
        }

        $product->update([
            'status' => 'rejected',
            'moderation_note' => $validated['note'] ?? null,
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);
        AuditLog::record($request->user(), 'product.rejected', $product, ['note' => $validated['note'] ?? null]);

        $product->loadMissing('store.owner');
        if ($product->store?->owner) {
            app(NotificationService::class)->notify(
                $product->store->owner,
                'product.rejected',
                'Your listing was rejected',
                $product->name.' was not approved.'.(! empty($validated['note']) ? ' Note: '.$validated['note'] : ''),
                [
                    'productId' => (string) $product->id,
                    'productName' => $product->name,
                    'reason' => $validated['note'] ?? null,
                    'ctaUrl' => rtrim((string) config('app.frontend_url'), '/').'/all-products',
                    'ctaLabel' => 'Edit listing',
                ],
            );
        }

        return ApiResponse::success(
            (new ProductResource($product->fresh(['store', 'category', 'brand', 'images'])))->resolve(),
            'Product rejected.',
        );
    }
}
