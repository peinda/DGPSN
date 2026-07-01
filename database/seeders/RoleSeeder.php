<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Définition de toutes les permissions ---
        $permissions = [
            // Citoyens
            'citoyens.voir',
            'citoyens.creer',
            'citoyens.modifier',

            // Demandes
            'demandes.voir',
            'demandes.creer',
            'demandes.modifier',
            'demandes.soumettre',
            'demandes.deliberer',
            'demandes.approuver',
            'demandes.rejeter',

            // Référentiels (admin)
            'referentiels.voir',
            'referentiels.gerer',

            // Utilisateurs (admin)
            'utilisateurs.voir',
            'utilisateurs.gerer',

            // Rapports
            'rapports.voir',
            'rapports.exporter',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // --- Agent : instruit les dossiers au nom du citoyen ---
        $agent = Role::firstOrCreate(['name' => 'agent', 'guard_name' => 'web']);
        $agent->syncPermissions([
            'citoyens.voir',
            'citoyens.creer',
            'citoyens.modifier',
            'demandes.voir',
            'demandes.creer',
            'demandes.modifier',
            'demandes.soumettre',
            'rapports.voir',
        ]);

        // --- Comité : examine et statue sur les demandes ---
        $comite = Role::firstOrCreate(['name' => 'comite', 'guard_name' => 'web']);
        $comite->syncPermissions([
            'citoyens.voir',
            'demandes.voir',
            'demandes.deliberer',
            'demandes.approuver',
            'demandes.rejeter',
            'rapports.voir',
        ]);

        // --- Administrateur : accès complet ---
        $admin = Role::firstOrCreate(['name' => 'administrateur', 'guard_name' => 'web']);
        $admin->syncPermissions(Permission::all());
    }
}
