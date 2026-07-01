<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@dgpsn.sn'],
            [
                'name'     => 'Administrateur DGPSN',
                'password' => Hash::make('dgpsn2025'),
            ]
        );

        $admin->assignRole('administrateur');

        $agent = User::firstOrCreate(
            ['email' => 'agent@dgpsn.sn'],
            [
                'name'     => 'Agent Test',
                'password' => Hash::make('dgpsn2025'),
            ]
        );

        $agent->assignRole('agent');

        $comite = User::firstOrCreate(
            ['email' => 'comite@dgpsn.sn'],
            [
                'name'     => 'Membre Comité',
                'password' => Hash::make('dgpsn2025'),
            ]
        );

        $comite->assignRole('comite');
    }
}
