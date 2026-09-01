<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use App\Support\ApiResponse;
use App\Support\NotificationPreferences;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id');

        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get();
        $unread = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return ApiResponse::success([
            'items' => UserNotificationResource::collection($rows)->resolve(),
            'unreadCount' => $unread,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    public function read(Request $request, UserNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['read_at' => now()]);

        return ApiResponse::success((new UserNotificationResource($notification))->resolve());
    }

    public function readAll(Request $request): JsonResponse
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ApiResponse::success(null, 'All notifications marked as read.');
    }
}

class NotificationPreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'notifications' => NotificationPreferences::normalize($request->user()->notification_preferences),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notifications' => ['required', 'array'],
            'notifications.sale' => ['sometimes', 'array'],
            'notifications.sale.email' => ['sometimes', 'boolean'],
            'notifications.sale.push' => ['sometimes', 'boolean'],
            'notifications.order' => ['sometimes', 'array'],
            'notifications.order.email' => ['sometimes', 'boolean'],
            'notifications.order.push' => ['sometimes', 'boolean'],
            'notifications.stock' => ['sometimes', 'array'],
            'notifications.stock.email' => ['sometimes', 'boolean'],
            'notifications.stock.push' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $user->notification_preferences = NotificationPreferences::normalize(
            array_merge(
                NotificationPreferences::normalize($user->notification_preferences),
                $validated['notifications'],
            ),
        );
        $user->save();

        return ApiResponse::success([
            'notifications' => NotificationPreferences::normalize($user->notification_preferences),
        ], 'Preferences updated.');
    }
}
