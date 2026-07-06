<?php

namespace Database\Factories;

use App\Models\TypeAide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TypeAide>
 */
class TypeAideFactory extends Factory
{
    protected $model = TypeAide::class;

    public function definition(): array
    {
        return [
            'nom'              => fake()->unique()->words(3, true),
            'code'             => 'TA-' . fake()->unique()->numerify('####'),
            'description'      => fake()->sentence(),
            'actif'            => true,
            'requiert_periode' => false,
        ];
    }

    public function requiertPeriode(): static
    {
        return $this->state(fn (array $attributes) => [
            'requiert_periode' => true,
        ]);
    }

    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
