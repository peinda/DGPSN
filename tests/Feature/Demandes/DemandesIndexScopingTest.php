<?php

namespace Tests\Feature\Demandes;

use App\Enums\StatutDemande;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class DemandesIndexScopingTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_agent_only_sees_own_demandes(): void
    {
        $agent1 = $this->actingAsAgent();
        $agent2 = User::factory()->create();

        $ownDemande   = Demande::factory()->create(['agent_id' => $agent1->id]);
        $otherDemande = Demande::factory()->create(['agent_id' => $agent2->id]);

        $response = $this->get(route('demandes.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('demandes.data', 1)
            ->where('demandes.data.0.id', $ownDemande->id));
    }

    public function test_administrateur_sees_all_demandes(): void
    {
        $this->actingAsAdministrateur();
        $agent1 = User::factory()->create();
        $agent2 = User::factory()->create();
        Demande::factory()->create(['agent_id' => $agent1->id]);
        Demande::factory()->create(['agent_id' => $agent2->id]);

        $response = $this->get(route('demandes.index'));

        $response->assertInertia(fn ($page) => $page->has('demandes.data', 2));
    }

    public function test_search_by_citoyen_nom(): void
    {
        $this->actingAsAdministrateur();
        $citoyen = Citoyen::factory()->create(['nom' => 'NDIAYE']);
        $demande = Demande::factory()->create(['citoyen_id' => $citoyen->id]);
        Demande::factory()->create(); // unrelated

        $response = $this->get(route('demandes.index', ['search' => 'NDIAYE']));

        $response->assertInertia(fn ($page) => $page
            ->has('demandes.data', 1)
            ->where('demandes.data.0.id', $demande->id));
    }

    public function test_filter_by_statut(): void
    {
        $this->actingAsAdministrateur();
        Demande::factory()->approuvee()->create();
        Demande::factory()->create(); // brouillon

        $response = $this->get(route('demandes.index', ['statut' => StatutDemande::APPROUVE->value]));

        $response->assertInertia(fn ($page) => $page->has('demandes.data', 1));
    }
}
