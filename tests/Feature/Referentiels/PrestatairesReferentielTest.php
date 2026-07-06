<?php

namespace Tests\Feature\Referentiels;

use App\Models\Demande;
use App\Models\Prestataire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class PrestatairesReferentielTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_index_filters_by_search(): void
    {
        $this->actingAsAdministrateur();
        Prestataire::factory()->create(['nom' => 'Clinique du Point E']);
        Prestataire::factory()->create(['nom' => 'Hopital Fann']);

        $response = $this->get(route('referentiels.prestataires.index', ['search' => 'Point E']));

        $response->assertInertia(fn ($page) => $page->has('prestataires.data', 1));
    }

    public function test_index_filters_by_type(): void
    {
        $this->actingAsAdministrateur();
        Prestataire::factory()->create(['type' => \App\Enums\TypePrestataire::HOPITAL]);
        Prestataire::factory()->create(['type' => \App\Enums\TypePrestataire::PHARMACIE]);

        $response = $this->get(route('referentiels.prestataires.index', ['type' => 'pharmacie']));

        $response->assertInertia(fn ($page) => $page->has('prestataires.data', 1));
    }

    public function test_store_creates_prestataire(): void
    {
        $this->actingAsAdministrateur();

        $response = $this->post(route('referentiels.prestataires.store'), [
            'nom'  => 'Pharmacie Test',
            'type' => 'pharmacie',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('prestataires', ['nom' => 'Pharmacie Test']);
    }

    public function test_update_modifies_prestataire(): void
    {
        $this->actingAsAdministrateur();
        $prestataire = Prestataire::factory()->create();

        $response = $this->put(route('referentiels.prestataires.update', $prestataire), [
            'nom' => 'Nom modifié', 'type' => $prestataire->type->value,
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Nom modifié', $prestataire->fresh()->nom);
    }

    public function test_destroy_blocked_when_has_demandes(): void
    {
        $this->actingAsAdministrateur();
        $prestataire = Prestataire::factory()->create();
        $demande = Demande::factory()->create();
        $demande->prestataires()->attach($prestataire->id, ['montant_estime' => 1000]);

        $response = $this->delete(route('referentiels.prestataires.destroy', $prestataire));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('prestataires', ['id' => $prestataire->id]);
    }

    public function test_destroy_allowed_when_no_demandes(): void
    {
        $this->actingAsAdministrateur();
        $prestataire = Prestataire::factory()->create();

        $response = $this->delete(route('referentiels.prestataires.destroy', $prestataire));

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('prestataires', ['id' => $prestataire->id]);
    }

    public function test_toggle_flips_actif(): void
    {
        $this->actingAsAdministrateur();
        $prestataire = Prestataire::factory()->create(['actif' => true]);

        $this->patch(route('referentiels.prestataires.toggle', $prestataire));

        $this->assertFalse((bool) $prestataire->fresh()->actif);
    }
}
