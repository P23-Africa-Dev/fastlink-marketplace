<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\Store;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Conversation::query()
            ->with(['buyer', 'store', 'order', 'product', 'latestMessage'])
            ->withCount(['messages as unread_count' => function ($messages) use ($user) {
                $messages->whereNull('read_at')->where('sender_id', '!=', $user->id);
            }])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id');

        if ($user->role === 'seller' || $user->role === 'admin') {
            $storeIds = SellerContext::storeIds($user);
            if ($storeIds->isNotEmpty() && $user->role === 'seller') {
                $query->whereIn('store_id', $storeIds);
            } elseif ($user->role === 'seller') {
                $query->whereRaw('1 = 0');
            }
        } else {
            $query->where('buyer_id', $user->id);
        }

        if ($request->filled('status')) {
            $status = $this->normalizeStatus((string) $request->query('status'));
            if ($status) {
                $query->where('status', $status);
            }
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->whereHas('buyer', fn ($buyer) => $buyer->where('name', 'like', $q)->orWhere('email', 'like', $q))
                    ->orWhereHas('messages', fn ($message) => $message->where('body', 'like', $q));
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $conversations = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ConversationResource::collection($conversations)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_id' => ['required'],
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'product_id' => ['nullable'],
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $store = Store::query()->findOrFail($validated['store_id']);
        $product = isset($validated['product_id'])
            ? Product::query()->find($validated['product_id'])
            : null;

        $conversation = Conversation::query()->firstOrCreate(
            [
                'store_id' => $store->id,
                'buyer_id' => $request->user()->id,
            ],
            [
                'order_id' => $validated['order_id'] ?? null,
                'product_id' => $product?->id,
                'status' => 'open',
            ],
        );

        if (! $conversation->order_id && ! empty($validated['order_id'])) {
            $conversation->order_id = $validated['order_id'];
        }
        if (! $conversation->product_id && $product) {
            $conversation->product_id = $product->id;
        }

        $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);
        $conversation->forceFill([
            'status' => $conversation->status === 'resolved' ? 'open' : $conversation->status,
            'last_message_at' => now(),
        ])->save();

        return ApiResponse::success(
            (new ConversationResource($conversation->fresh($this->eager())))->resolve(),
            'Message sent.',
            201,
        );
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);
        $conversation->load($this->eager());

        return ApiResponse::success((new ConversationResource($conversation))->resolve());
    }

    public function message(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);
        $conversation->update([
            'status' => $conversation->status === 'resolved' ? 'open' : $conversation->status,
            'last_message_at' => now(),
        ]);

        return ApiResponse::success(
            (new ConversationResource($conversation->fresh($this->eager())))->resolve(),
            'Message sent.',
        );
    }

    public function read(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation);
        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        return ApiResponse::success(
            (new ConversationResource($conversation->fresh($this->eager())))->resolve(),
            'Marked read.',
        );
    }

    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation, sellerOnly: true);
        $validated = $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved,New,In Progress,Resolved'],
        ]);

        $conversation->update([
            'status' => $this->normalizeStatus($validated['status']) ?? 'open',
        ]);

        return ApiResponse::success(
            (new ConversationResource($conversation->fresh($this->eager())))->resolve(),
            'Conversation updated.',
        );
    }

    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request, $conversation, sellerOnly: true);
        $conversation->delete();

        return ApiResponse::success(null, 'Conversation deleted.');
    }

    /**
     * @return list<string>
     */
    private function eager(): array
    {
        return ['buyer', 'store', 'order.items', 'product', 'messages.sender', 'latestMessage'];
    }

    private function authorizeConversation(Request $request, Conversation $conversation, bool $sellerOnly = false): void
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return;
        }

        $ownsStore = SellerContext::storeIds($user)->contains($conversation->store_id);
        $isBuyer = $conversation->buyer_id === $user->id;

        if ($sellerOnly && ! $ownsStore) {
            abort(403);
        }
        if (! $ownsStore && ! $isBuyer) {
            abort(403);
        }
    }

    private function normalizeStatus(string $status): ?string
    {
        return match (strtolower($status)) {
            'new', 'open' => 'open',
            'in progress', 'in_progress' => 'in_progress',
            'resolved' => 'resolved',
            default => null,
        };
    }
}
