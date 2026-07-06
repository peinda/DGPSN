<?php

namespace Tests\Concerns;

use App\Models\User;
use Database\Seeders\RoleSeeder;

trait CreatesUsers
{
    protected function seedRoles(): void
    {
        $this->seed(RoleSeeder::class);
    }

    protected function actingAsAgent(array $attributes = []): User
    {
        return $this->actingAsRole('agent', $attributes);
    }

    protected function actingAsComite(array $attributes = []): User
    {
        return $this->actingAsRole('comite', $attributes);
    }

    protected function actingAsAdministrateur(array $attributes = []): User
    {
        return $this->actingAsRole('administrateur', $attributes);
    }

    protected function actingAsRole(string $role, array $attributes = []): User
    {
        $this->seedRoles();

        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        $this->actingAs($user);

        return $user;
    }
}
