<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with('store')->orderByDesc('id');

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', $q)->orWhere('email', 'like', $q);
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $users = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            $users->map(fn (User $user) => [
                ...(new UserResource($user))->resolve(),
                'store' => $user->store ? [
                    'id' => (string) $user->store->id,
                    'name' => $user->store->name,
                    'status' => $user->store->status,
                ] : null,
            ])->values()->all(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(User $user): JsonResponse
    {
        $user->load('store');

        return ApiResponse::success([
            ...(new UserResource($user))->resolve(),
            'store' => $user->store ? [
                'id' => (string) $user->store->id,
                'name' => $user->store->name,
                'slug' => $user->store->slug,
                'status' => $user->store->status,
            ] : null,
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:active,pending,suspended'],
            'role' => ['sometimes', 'in:buyer,seller,admin'],
        ]);

        $user->update($validated);

        if (($validated['status'] ?? null) === 'suspended') {
            $user->tokens()->delete();
            AuditLog::record($request->user(), 'user.suspended', $user);
        } elseif (($validated['status'] ?? null) === 'active') {
            AuditLog::record($request->user(), 'user.activated', $user);
        }

        return ApiResponse::success((new UserResource($user->fresh()))->resolve(), 'User updated.');
    }
}
