<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SellerReviewController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $query = Review::query()
            ->with(['buyer', 'product', 'store'])
            ->whereIn('store_id', SellerContext::storeIds($request->user()))
            ->orderByDesc('id');

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $status = strtolower((string) $request->query('status'));
            $query->where('status', $status);
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('body', 'like', $q)
                    ->orWhereHas('buyer', fn ($buyer) => $buyer->where('name', 'like', $q))
                    ->orWhereHas('product', fn ($product) => $product->where('name', 'like', $q));
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 50);
        $total = (clone $query)->count();
        $reviews = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ReviewResource::collection($reviews)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function reply(Request $request, Review $review): JsonResponse
    {
        $review->load('store');
        $this->authorize('reply', $review);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $review->update([
            'seller_reply' => $validated['body'],
            'seller_replied_at' => now(),
            'status' => $review->status === 'pending' ? 'approved' : $review->status,
        ]);

        return ApiResponse::success(
            (new ReviewResource($review->fresh(['buyer', 'product'])))->resolve(),
            'Reply posted.',
        );
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $review->load('store');
        $this->authorize('update', $review);

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $status = strtolower($validated['status']);
        if (in_array($status, ['flag', 'flagged'], true)) {
            $status = 'flagged';
        }
        if (in_array($status, ['hide', 'hidden'], true)) {
            $status = 'hidden';
        }
        if (in_array($status, ['approve', 'approved'], true)) {
            $status = 'approved';
        }

        if (! in_array($status, Review::STATUSES, true)) {
            throw ValidationException::withMessages(['status' => 'Unknown status.']);
        }

        $review->update(['status' => $status]);
        $review->product?->refreshRating();

        return ApiResponse::success(
            (new ReviewResource($review->fresh(['buyer', 'product'])))->resolve(),
            'Review updated.',
        );
    }
}
