<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerCustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $customers = $this->aggregate($storeIds->all());

        if ($request->filled('q')) {
            $q = strtolower((string) $request->query('q'));
            $customers = $customers->filter(function (array $row) use ($q) {
                return str_contains(strtolower($row['name']), $q)
                    || str_contains(strtolower($row['email']), $q);
            })->values();
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 50);
        $total = $customers->count();
        $slice = $customers->forPage($page, $limit)->values();

        return ApiResponse::paginated($slice->all(), $total, $page, $limit);
    }

    public function show(Request $request, string $customer): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $row = $this->aggregate($storeIds->all())->firstWhere('id', $customer);

        if (! $row) {
            abort(404);
        }

        $orders = Order::query()
            ->with(['items', 'store', 'events'])
            ->whereIn('store_id', $storeIds)
            ->where('buyer_id', $customer)
            ->orderByDesc('id')
            ->get();

        $row['orders'] = OrderResource::collection($orders)->resolve();

        return ApiResponse::success($row);
    }

    /**
     * @param  list<int|string>  $storeIds
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function aggregate(array $storeIds)
    {
        $orders = Order::query()
            ->with('items')
            ->whereIn('store_id', $storeIds)
            ->where('status', '!=', 'cancelled')
            ->orderBy('id')
            ->get();

        return $orders
            ->groupBy('buyer_id')
            ->map(function ($group) {
                $first = $group->first();
                $last = $group->last();
                $spent = (float) $group->sum('total');
                $lastAt = $group->max('created_at');

                return [
                    'id' => (string) $first->buyer_id,
                    'name' => $first->buyer_name,
                    'email' => $first->buyer_email,
                    'phone' => $first->shipping_phone,
                    'address' => trim($first->shipping_city.', '.$first->shipping_state, ', '),
                    'orders' => $group->count(),
                    'spent' => $spent,
                    'status' => $lastAt && $lastAt->gte(now()->subDays(30)) ? 'Active' : 'Inactive',
                    'joinDate' => $first->created_at?->toIso8601String(),
                    'tier' => $this->tier($spent),
                    'preferredCategory' => $last?->items->first()?->name_snapshot,
                ];
            })
            ->sortByDesc('spent')
            ->values();
    }

    private function tier(float $spent): string
    {
        return match (true) {
            $spent >= 500000 => 'VIP',
            $spent >= 200000 => 'Gold',
            $spent >= 50000 => 'Silver',
            default => 'Bronze',
        };
    }
}
