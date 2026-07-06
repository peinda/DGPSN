<?php

namespace Database\Factories;

use App\Enums\TypePrestataire;
use App\Models\Prestataire;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prestataire>
 */
class PrestataireFactory extends Factory
{
    protected $model = Prestataire::class;

    public function definition(): array
    {
        return [
            'nom'            => fake()->unique()->company(),
            'type'           => fake()->randomElement(TypePrestataire::cases()),
            'adresse'        => fake()->address(),
            'telephone'      => fake()->numerify('+221 3# ### ## ##'),
            'email'          => fake()->unique()->safeEmail(),
            'region_id'      => null,
            'departement_id' => null,
            'commune_id'     => null,
            'actif'          => true,
        ];
    }

    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
