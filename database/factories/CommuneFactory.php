<?php

namespace Database\Factories;

use App\Models\Commune;
use App\Models\Departement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Commune>
 */
class CommuneFactory extends Factory
{
    protected $model = Commune::class;

    public function definition(): array
    {
        return [
            'departement_id' => Departement::factory(),
            'nom'            => fake()->unique()->city(),
            'code'           => 'CM-' . fake()->unique()->numerify('####'),
        ];
    }
}
