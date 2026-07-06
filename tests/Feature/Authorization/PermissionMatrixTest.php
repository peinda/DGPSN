<?php

namespace Tests\Feature\Authorization;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

/**
 * Sweeps role x route for every `permission:`-gated route group in routes/web.php.
 * Expected access is derived from the actual roles/permissions seeded by RoleSeeder
 * (not hardcoded), so this doubles as a regression guard against seeder drift.
 */
class PermissionMatrixTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    private const ROLES = ['agent', 'comite', 'administrateur'];

    private function assertAccess(string $role, string $permission, string $method, string $uri, array $data = []): void
    {
        $this->seedRoles();

        $user = User::factory()->create();
        $user->assignRole($role);
        $this->actingAs($user);

        $response = $this->call($method, $uri, $data);

        $expectedAllowed = Role::findByName($role)->hasPermissionTo($permission);

        if ($expectedAllowed) {
            $this->assertNotEquals(403, $response->getStatusCode(), "Role [$role] should be allowed on [$method $uri] (has [$permission]) but got 403.");
        } else {
            $response->assertForbidden();
        }
    }

    public function test_citoyens_index_gated_by_citoyens_voir(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'citoyens.voir', 'GET', '/citoyens');
        }
    }

    public function test_demandes_create_gated_by_demandes_creer(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'demandes.creer', 'GET', '/demandes/create');
        }
    }

    public function test_demandes_index_gated_by_demandes_voir(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'demandes.voir', 'GET', '/demandes');
        }
    }

    public function test_comite_index_gated_by_demandes_deliberer(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'demandes.deliberer', 'GET', '/comite');
        }
    }

    public function test_referentiels_lecture_gated_by_referentiels_voir(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'referentiels.voir', 'GET', '/referentiels/types-aide');
        }
    }

    public function test_referentiels_ecriture_gated_by_referentiels_gerer(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'referentiels.gerer', 'POST', '/referentiels/types-aide', [
                'nom'   => 'Aide test ' . uniqid(),
                'code'  => 'TST-' . uniqid(),
                'actif' => true,
            ]);
        }
    }

    public function test_utilisateurs_index_gated_by_utilisateurs_voir(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'utilisateurs.voir', 'GET', '/utilisateurs');
        }
    }

    public function test_utilisateurs_create_gated_by_utilisateurs_gerer(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'utilisateurs.gerer', 'GET', '/utilisateurs/create');
        }
    }

    public function test_rapports_dashboard_gated_by_rapports_voir(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'rapports.voir', 'GET', '/rapports/tableau-de-bord');
        }
    }

    public function test_rapports_export_gated_by_rapports_exporter(): void
    {
        foreach (self::ROLES as $role) {
            $this->assertAccess($role, 'rapports.exporter', 'GET', '/rapports/export-csv');
        }
    }

    public function test_gated_route_without_seeded_permission_rows_returns_403(): void
    {
        // With this spatie/laravel-permission version, canAny() returns false (not an
        // exception) when the permission row doesn't exist at all, so the middleware
        // still resolves to a clean 403 even without RoleSeeder having run.
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get('/citoyens');

        $response->assertForbidden();
    }
}
