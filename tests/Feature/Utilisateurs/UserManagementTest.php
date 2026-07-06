<?php

namespace Tests\Feature\Utilisateurs;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_index_lists_users_with_roles(): void
    {
        $this->actingAsAdministrateur();
        $agent = User::factory()->create();
        $agent->assignRole('agent');

        $response = $this->get(route('utilisateurs.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Utilisateurs/Index')
            ->where('roles', fn ($roles) => in_array('agent', $roles->toArray())));
    }

    public function test_store_creates_user_with_role(): void
    {
        $this->actingAsAdministrateur();

        $response = $this->post(route('utilisateurs.store'), [
            'name'                  => 'Nouvel Agent',
            'email'                 => 'nouvel.agent@dgpsn.sn',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'agent',
        ]);

        $response->assertRedirect(route('utilisateurs.index'));
        $user = User::where('email', 'nouvel.agent@dgpsn.sn')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('agent'));
    }

    public function test_store_requires_unique_email(): void
    {
        $this->actingAsAdministrateur();
        $existing = User::factory()->create();

        $response = $this->post(route('utilisateurs.store'), [
            'name'                  => 'Dup',
            'email'                 => $existing->email,
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'agent',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_store_requires_password_confirmation_match(): void
    {
        $this->actingAsAdministrateur();

        $response = $this->post(route('utilisateurs.store'), [
            'name'                  => 'Test',
            'email'                 => 'test@dgpsn.sn',
            'password'              => 'password123',
            'password_confirmation' => 'different',
            'role'                  => 'agent',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_store_requires_valid_role(): void
    {
        $this->actingAsAdministrateur();

        $response = $this->post(route('utilisateurs.store'), [
            'name'                  => 'Test',
            'email'                 => 'test@dgpsn.sn',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'super-admin-inexistant',
        ]);

        $response->assertSessionHasErrors('role');
    }

    public function test_update_modifies_user_and_role_without_password(): void
    {
        $this->actingAsAdministrateur();
        $user = User::factory()->create(['name' => 'Ancien Nom']);
        $user->assignRole('agent');
        $originalPassword = $user->password;

        $response = $this->put(route('utilisateurs.update', $user), [
            'name'  => 'Nouveau Nom',
            'email' => $user->email,
            'role'  => 'comite',
        ]);

        $response->assertRedirect(route('utilisateurs.index'));
        $user->refresh();
        $this->assertEquals('Nouveau Nom', $user->name);
        $this->assertTrue($user->hasRole('comite'));
        $this->assertFalse($user->hasRole('agent'));
        $this->assertEquals($originalPassword, $user->password);
    }

    public function test_update_changes_password_when_provided(): void
    {
        $this->actingAsAdministrateur();
        $user = User::factory()->create();
        $user->assignRole('agent');
        $originalPassword = $user->password;

        $this->put(route('utilisateurs.update', $user), [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'role'                  => 'agent',
        ]);

        $this->assertNotEquals($originalPassword, $user->fresh()->password);
    }

    public function test_destroy_deletes_other_user(): void
    {
        $this->actingAsAdministrateur();
        $user = User::factory()->create();

        $response = $this->delete(route('utilisateurs.destroy', $user));

        $response->assertRedirect(route('utilisateurs.index'));
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_destroy_blocks_self_delete(): void
    {
        $admin = $this->actingAsAdministrateur();

        $response = $this->delete(route('utilisateurs.destroy', $admin));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
