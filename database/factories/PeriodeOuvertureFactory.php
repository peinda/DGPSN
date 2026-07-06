<?php

namespace Database\Factories;

use App\Models\AnneeGestion;
use App\Models\Evenement;
use App\Models\PeriodeOuverture;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PeriodeOuverture>
 */
class PeriodeOuvertureFactory extends Factory
{
    protected $model = PeriodeOuverture::class;

    public function definition(): array
    {
        return [
            'evenement_id'      => Evenement::factory(),
            'annee_gestion_id'  => AnneeGestion::factory(),
            'date_debut'        => now()->subDays(5),
            'date_fin'          => now()->addDays(5),
            'actif'             => true,
        ];
    }

    public function expiree(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_debut' => now()->subDays(30),
            'date_fin'   => now()->subDays(10),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
