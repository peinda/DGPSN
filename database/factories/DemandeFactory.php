<?php

namespace Database\Factories;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\TypeAide;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Demande>
 *
 * Note: `reference` is always overwritten by DemandeObserver::created() — never set it here.
 */
class DemandeFactory extends Factory
{
    protected $model = Demande::class;

    public function definition(): array
    {
        return [
            'citoyen_id'       => Citoyen::factory(),
            'type_aide_id'     => TypeAide::factory(),
            'evenement_id'     => null,
            'annee_gestion_id' => AnneeGestion::factory(),
            'periode_ouverture_id' => null,
            'agent_id'         => User::factory(),
            'comite_user_id'   => null,
            'statut'           => StatutDemande::BROUILLON,
            'montant_total'    => null,
            'commentaire'      => null,
            'date_soumission'  => null,
            'date_deliberation' => null,
            'date_cloture'     => null,
        ];
    }

    /**
     * Lightweight status-only states for populating lists.
     * Use the model's transition methods instead when the transition itself is under test.
     */
    public function soumise(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'          => StatutDemande::SOUMIS,
            'date_soumission' => now(),
        ]);
    }

    public function enExamen(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'          => StatutDemande::EN_EXAMEN,
            'date_soumission' => now(),
            'comite_user_id'  => User::factory(),
        ]);
    }

    public function approuvee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'             => StatutDemande::APPROUVE,
            'date_soumission'    => now(),
            'date_deliberation'  => now(),
            'comite_user_id'     => User::factory(),
        ]);
    }

    public function rejetee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'             => StatutDemande::REJETE,
            'date_soumission'    => now(),
            'date_deliberation'  => now(),
            'comite_user_id'     => User::factory(),
            'commentaire'        => fake()->sentence(),
        ]);
    }

    public function cloturee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut'             => StatutDemande::CLOTURE,
            'date_soumission'    => now(),
            'date_deliberation'  => now(),
            'date_cloture'       => now(),
            'comite_user_id'     => User::factory(),
        ]);
    }
}
