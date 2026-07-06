<?php

namespace Tests\Feature\Demandes;

use App\Models\Demande;
use App\Models\Prestataire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class DemandeEditDeleteTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_edit_page_accessible_only_for_brouillon(): void
    {
        $this->actingAsAgent();

        $brouillon = Demande::factory()->create();
        $response  = $this->get(route('demandes.edit', $brouillon));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Demandes/Edit'));

        $soumise = Demande::factory()->soumise()->create();
        $response = $this->get(route('demandes.edit', $soumise));
        $response->assertRedirect(route('demandes.show', $soumise));
    }

    public function test_update_syncs_prestataires_and_recomputes_montant(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->create();
        $oldPrestataire = Prestataire::factory()->create();
        $demande->prestataires()->attach($oldPrestataire->id, ['montant_estime' => 1000]);

        $newPrestataire = Prestataire::factory()->create();

        $response = $this->put(route('demandes.update', $demande), [
            'type_aide_id'     => $demande->type_aide_id,
            'annee_gestion_id' => $demande->annee_gestion_id,
            'prestataires'     => [
                ['id' => $newPrestataire->id, 'montant_estime' => 5000],
            ],
        ]);

        $response->assertRedirect(route('demandes.show', $demande));
        $demande->refresh();
        $this->assertEquals([$newPrestataire->id], $demande->prestataires()->pluck('prestataires.id')->all());
        $this->assertEquals(5000, (float) $demande->montant_total);
    }

    public function test_update_blocked_for_non_brouillon(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->soumise()->create();

        $response = $this->put(route('demandes.update', $demande), [
            'type_aide_id'     => $demande->type_aide_id,
            'annee_gestion_id' => $demande->annee_gestion_id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_destroy_deletes_only_brouillon(): void
    {
        $this->actingAsAgent();

        $brouillon = Demande::factory()->create();
        $response  = $this->delete(route('demandes.destroy', $brouillon));
        $response->assertRedirect(route('demandes.index'));
        $this->assertDatabaseMissing('demandes', ['id' => $brouillon->id]);

        $soumise = Demande::factory()->soumise()->create();
        $response = $this->delete(route('demandes.destroy', $soumise));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('demandes', ['id' => $soumise->id]);
    }
}
