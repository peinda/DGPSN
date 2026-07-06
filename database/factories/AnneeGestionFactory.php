<?php

namespace Database\Factories;

use App\Enums\StatutAnnee;
use App\Models\AnneeGestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnneeGestion>
 */
class AnneeGestionFactory extends Factory
{
    protected $model = AnneeGestion::class;

    public function definition(): array
    {
        return [
            'annee'          => fake()->unique()->numberBetween(2030, 2100),
            'statut'         => StatutAnnee::OUVERT,
            'date_ouverture' => now()->startOfYear(),
            'date_cloture'   => null,
        ];
    }

    public function cloturee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'       => StatutAnnee::CLOTURE,
            'date_cloture' => now(),
        ]);
    }

    public function archivee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'       => StatutAnnee::ARCHIVE,
            'date_cloture' => now(),
        ]);
    }
}
