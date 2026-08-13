<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ada Buyer',
            'email' => 'ada@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'ada@example.com')
            ->assertJsonPath('data.user.role', 'buyer')
            ->assertJsonStructure(['data' => ['token', 'user']]);

        $this->assertDatabaseHas('users', ['email' => 'ada@example.com']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Other',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_register_rejects_admin_role(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'seller@fastlink.test',
            'password' => 'password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'seller@fastlink.test',
            'password' => 'wrong-password',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_login_returns_token_for_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'seller@fastlink.test',
            'password' => 'password',
            'role' => 'seller',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'seller@fastlink.test',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role', 'seller')
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_me_returns_current_user(): void
    {
        $user = User::factory()->create(['role' => 'buyer']);

        Sanctum::actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_suspended_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'banned@example.com',
            'password' => 'password',
            'status' => 'suspended',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'banned@example.com',
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_seller_onboard_creates_store_and_upgrades_buyer(): void
    {
        $user = User::factory()->create(['role' => 'buyer']);

        Sanctum::actingAs($user);

        $this->postJson('/api/seller/onboard', [
                'business_name' => 'Kano Gadgets',
                'phone' => '08011112222',
                'bank_name' => 'Zenith',
                'bank_account_number' => '1234567890',
                'bank_account_name' => 'Kano Gadgets',
            ])
            ->assertCreated()
            ->assertJsonPath('data.store.status', 'approved');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => 'seller',
        ]);
        $this->assertDatabaseHas('stores', [
            'owner_id' => $user->id,
            'name' => 'Kano Gadgets',
        ]);
    }
}
