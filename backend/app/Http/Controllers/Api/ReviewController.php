<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Support\PageViewRecorder;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(string $idOrSlug): JsonResponse
    {
        $product = $this->findProduct($idOrSlug);

        $reviews = Review::query()
            ->with(['buyer', 'product'])
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(ReviewResource::collection($reviews)->resolve());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required'],
            'order_item_id' => ['nullable', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $product = Product::query()->findOrFail($validated['product_id']);
        $buyer = $request->user();

        $item = $this->purchasedItem($buyer->id, $product->id, $validated['order_item_id'] ?? null);
        if (! $item) {
            throw ValidationException::withMessages([
                'product_id' => 'You can only review products you have purchased.',
            ]);
        }

        if (Review::query()->where('buyer_id', $buyer->id)->where('product_id', $product->id)->exists()) {
            throw ValidationException::withMessages([
                'product_id' => 'You have already reviewed this product.',
            ]);
        }

        $review = Review::query()->create([
            'product_id' => $product->id,
            'store_id' => $product->store_id,
            'buyer_id' => $buyer->id,
            'order_item_id' => $item->id,
            'rating' => $validated['rating'],
            'body' => $validated['body'] ?? null,
            'status' => 'approved',
        ]);

        PageViewRecorder::record(
            $buyer,
            $product->store,
            $product,
            '/products/'.$product->slug,
            'review_submitted',
            ['reviewId' => (string) $review->id, 'rating' => (int) $review->rating],
        );

        $product->refreshRating();

        return ApiResponse::success(
            (new ReviewResource($review->load(['buyer', 'product'])))->resolve(),
            'Review posted.',
            201,
        );
    }

    private function findProduct(string $idOrSlug): Product
    {
        return Product::query()
            ->where(function ($query) use ($idOrSlug) {
                $query->where('slug', $idOrSlug);
                if (ctype_digit($idOrSlug)) {
                    $query->orWhere('id', $idOrSlug);
                }
            })
            ->firstOrFail();
    }

    private function purchasedItem(int $buyerId, int $productId, ?int $orderItemId): ?OrderItem
    {
        $query = OrderItem::query()
            ->where('product_id', $productId)
            ->whereHas('order', function ($order) use ($buyerId) {
                $order->where('buyer_id', $buyerId)
                    ->where(function ($inner) {
                        $inner->where('payment_status', 'paid')
                            ->orWhereIn('status', ['confirmed', 'shipped', 'delivered']);
                    });
            });

        if ($orderItemId) {
            $query->whereKey($orderItemId);
        }

        return $query->first();
    }
}
