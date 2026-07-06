<?php

namespace Tests\Feature\Referentiels;

use App\Enums\StatutAnnee;
use App\Models\AnneeGestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class AnneesGestionReferentielTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_store_creates_annee_ouverte(): void
    {
        $this->actingAsAdministrateur();

        $response = $this->post(route('referentiels.annees.store'), ['annee' => 2077]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('annees_gestion', ['annee' => 2077, 'statut' => StatutAnnee::OUVERT->value]);
    }

    public function test_store_requires_unique_annee(): void
    {
        $this->actingAsAdministrateur();
        AnneeGestion::factory()->create(['annee' => 2078]);

        $response = $this->post(route('referentiels.annees.store'), ['annee' => 2078]);

        $response->assertSessionHasErrors('annee');
    }

    public function test_cloturer_requires_ouvert_status(): void
    {
        $this->actingAsAdministrateur();
        $annee = AnneeGestion::factory()->cloturee()->create();

        $response = $this->post(route('referentiels.annees.cloturer', $annee));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutAnnee::CLOTURE, $annee->fresh()->statut);
    }

    public function test_cloturer_success(): void
    {
        $this->actingAsAdministrateur();
        $annee = AnneeGestion::factory()->create(); // ouvert by default

        $response = $this->post(route('referentiels.annees.cloturer', $annee));

        $response->assertSessionHas('success');
        $this->assertEquals(StatutAnnee::CLOTURE, $annee->fresh()->statut);
    }

    public function test_archiver_requires_cloture_status(): void
    {
        $this->actingAsAdministrateur();
        $annee = AnneeGestion::factory()->create(); // ouvert

        $response = $this->post(route('referentiels.annees.archiver', $annee));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutAnnee::OUVERT, $annee->fresh()->statut);
    }

    public function test_archiver_success_after_cloturer(): void
    {
        $this->actingAsAdministrateur();
        $annee = AnneeGestion::factory()->cloturee()->create();

        $response = $this->post(route('referentiels.annees.archiver', $annee));

        $response->assertSessionHas('success');
        $this->assertEquals(StatutAnnee::ARCHIVE, $annee->fresh()->statut);
    }
}
