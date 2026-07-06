<?php

namespace Database\Factories;

use App\Models\Evenement;
use App\Models\TypeAide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evenement>
 */
class EvenementFactory extends Factory
{
    protected $model = Evenement::class;

    public function definition(): array
    {
        return [
            'type_aide_id' => TypeAide::factory(),
            'nom'          => fake()->unique()->words(2, true),
            'code'         => 'EV-' . fake()->unique()->numerify('####'),
            'description'  => fake()->sentence(),
            'actif'        => true,
        ];
    }

    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
