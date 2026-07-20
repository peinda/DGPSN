<?php

namespace Database\Factories;

use App\Models\Citoyen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Citoyen>
 */
class CitoyenFactory extends Factory
{
    protected $model = Citoyen::class;

    public function definition(): array
    {
        return [
            'cin'        => '1' . fake()->unique()->numerify('###########'),
            'nom'        => mb_strtoupper(fake()->unique()->lastName()),
            'prenom'     => fake()->firstName(),
            'telephone'  => fake()->randomElement(['70', '71', '75', '76', '77', '78'])
                . fake()->numerify('#######'),
            'date_naissance' => fake()->dateTimeBetween('-85 years', '-18 years'),
            'adresse'    => fake()->address(),
            'commune_id' => null,
        ];
    }

    public function withTelephone(): static
    {
        return $this->state(fn (array $attributes) => [
            'telephone' => '+221' . fake()->randomElement(['70', '71', '75', '76', '77', '78'])
                . fake()->numerify('#######'),
        ]);
    }
}
