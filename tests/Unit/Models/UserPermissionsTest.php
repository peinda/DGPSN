<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPermissionsTest extends TestCase
{
    use RefreshDatabase;

    private const EXPECTED_PERMISSIONS = [
        'agent' => [
            'citoyens.voir', 'citoyens.creer', 'citoyens.modifier',
            'demandes.voir', 'demandes.creer', 'demandes.modifier', 'demandes.soumettre',
            'rapports.voir',
        ],
        'comite' => [
            'citoyens.voir',
            'demandes.voir', 'demandes.deliberer', 'demandes.approuver', 'demandes.rejeter',
            'rapports.voir',
        ],
        'administrateur' => [
            'citoyens.voir', 'citoyens.creer', 'citoyens.modifier',
            'demandes.voir', 'demandes.creer', 'demandes.modifier', 'demandes.soumettre',
            'demandes.deliberer', 'demandes.approuver', 'demandes.rejeter',
            'referentiels.voir', 'referentiels.gerer',
            'utilisateurs.voir', 'utilisateurs.gerer',
            'rapports.voir', 'rapports.exporter',
        ],
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_each_seeded_role_has_exactly_its_expected_permission_set(): void
    {
        foreach (self::EXPECTED_PERMISSIONS as $role => $expected) {
            $user = User::factory()->create();
            $user->assignRole($role);

            $actual = $user->getAllPermissions()->pluck('name')->sort()->values()->all();

            sort($expected);
            $this->assertEquals($expected, $actual, "Permission set mismatch for role [$role].");
        }
    }

    public function test_administrateur_has_every_permission_in_the_system(): void
    {
        $user = User::factory()->create();
        $user->assignRole('administrateur');

        $allPermissionNames = \Spatie\Permission\Models\Permission::pluck('name')->sort()->values()->all();
        $userPermissionNames = $user->getAllPermissions()->pluck('name')->sort()->values()->all();

        $this->assertEquals($allPermissionNames, $userPermissionNames);
    }

    public function test_agent_cannot_manage_referentiels_or_utilisateurs(): void
    {
        $user = User::factory()->create();
        $user->assignRole('agent');

        $this->assertFalse($user->can('referentiels.gerer'));
        $this->assertFalse($user->can('utilisateurs.gerer'));
    }

    public function test_comite_cannot_create_demandes(): void
    {
        $user = User::factory()->create();
        $user->assignRole('comite');

        $this->assertFalse($user->can('demandes.creer'));
        $this->assertTrue($user->can('demandes.deliberer'));
    }
}
