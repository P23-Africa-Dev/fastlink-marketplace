<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreStaff;
use App\Models\User;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SellerStaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $store = SellerContext::storeOrFail($request->user());
        $staff = StoreStaff::query()
            ->with('user')
            ->where('store_id', $store->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn (StoreStaff $member) => $this->serialize($member));

        $owner = $store->owner;

        return ApiResponse::success([
            'owner' => $owner ? [
                'id' => (string) $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
                'role' => 'owner',
            ] : null,
            'staff' => $staff,
        ]);
    }

    public function store(Request $request, NotificationService $notifications): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', Rule::in(StoreStaff::ROLES)],
        ]);

        $store = SellerContext::storeOrFail($request->user());
        $invitee = User::query()->where('email', $validated['email'])->first();

        if (! $invitee) {
            throw ValidationException::withMessages([
                'email' => 'No account exists for that email. Ask them to register first.',
            ]);
        }

        if (in_array($invitee->role, ['admin', 'rider'], true)) {
            throw ValidationException::withMessages([
                'email' => 'That account cannot be added as store staff.',
            ]);
        }

        if ((int) $store->owner_id === (int) $invitee->id) {
            throw ValidationException::withMessages([
                'email' => 'The store owner already has full access.',
            ]);
        }

        if (StoreStaff::query()->where('store_id', $store->id)->where('user_id', $invitee->id)->exists()) {
            throw ValidationException::withMessages([
                'email' => 'That person is already on this store team.',
            ]);
        }

        if ($invitee->role === 'buyer') {
            $invitee->update(['role' => 'seller']);
        }

        $member = StoreStaff::query()->create([
            'store_id' => $store->id,
            'user_id' => $invitee->id,
            'invited_by' => $request->user()->id,
            'role' => $validated['role'],
            'status' => 'active',
        ]);

        $notifications->notify(
            $invitee,
            'staff.invited',
            'You were added to '.$store->name,
            'You can now access the '.$store->name.' seller dashboard as '.$validated['role'].' staff.',
            ['storeId' => (string) $store->id, 'role' => $validated['role']],
        );

        return ApiResponse::success($this->serialize($member->load('user')), 'Team member added.', 201);
    }

    public function update(Request $request, StoreStaff $staff): JsonResponse
    {
        $this->assertOwned($request, $staff);

        $validated = $request->validate([
            'role' => ['sometimes', Rule::in(StoreStaff::ROLES)],
            'status' => ['sometimes', Rule::in(['active', 'revoked'])],
        ]);

        $staff->update($validated);

        if (($validated['status'] ?? null) === 'revoked') {
            $this->maybeDemote($staff->user);
        }

        return ApiResponse::success($this->serialize($staff->fresh('user')), 'Team member updated.');
    }

    public function destroy(Request $request, StoreStaff $staff): JsonResponse
    {
        $this->assertOwned($request, $staff);
        $user = $staff->user;
        $staff->delete();
        $this->maybeDemote($user);

        return ApiResponse::success(null, 'Team member removed.');
    }

    private function assertOwned(Request $request, StoreStaff $staff): void
    {
        $store = SellerContext::storeOrFail($request->user());
        if ((int) $staff->store_id !== (int) $store->id) {
            abort(403);
        }
    }

    private function maybeDemote(?User $user): void
    {
        if (! $user || $user->stores()->exists()) {
            return;
        }

        $stillStaff = StoreStaff::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();

        if (! $stillStaff && $user->role === 'seller') {
            $user->update(['role' => 'buyer']);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(StoreStaff $staff): array
    {
        return [
            'id' => (string) $staff->id,
            'userId' => (string) $staff->user_id,
            'name' => $staff->user?->name,
            'email' => $staff->user?->email,
            'role' => $staff->role,
            'status' => $staff->status,
            'createdAt' => $staff->created_at?->toIso8601String(),
        ];
    }
}
