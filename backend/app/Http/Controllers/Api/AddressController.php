<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->orderByDesc('id')->get();

        return ApiResponse::success(AddressResource::collection($addresses)->resolve());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);
        $user = $request->user();

        if (($validated['is_default'] ?? false) || $user->addresses()->doesntExist()) {
            $user->addresses()->update(['is_default' => false]);
            $validated['is_default'] = true;
        }

        $address = $user->addresses()->create($validated);

        return ApiResponse::success((new AddressResource($address))->resolve(), 'Address saved.', 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);
        $validated = $this->validatedPayload($request, true);
        $address->update($validated);

        if ($address->is_default) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        return ApiResponse::success((new AddressResource($address->fresh()))->resolve(), 'Address updated.');
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorize('delete', $address);
        $address->delete();

        return ApiResponse::success(null, 'Address deleted.');
    }

    public function makeDefault(Request $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);
        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return ApiResponse::success((new AddressResource($address->fresh()))->resolve(), 'Default address updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'label' => ['nullable', 'string', 'max:80'],
            'street' => [$required, 'string', 'max:255'],
            'city' => [$required, 'string', 'max:120'],
            'state' => [$required, 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:40'],
            'is_default' => ['nullable', 'boolean'],
        ]);
    }
}
