<?php

namespace Tests\Feature\Demandes;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Demande;
use App\Models\PeriodeOuverture;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class DemandeSoumissionTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_soumettre_requires_brouillon_status(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->soumise()->create();

        $response = $this->post(route('demandes.soumettre', $demande));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutDemande::SOUMIS, $demande->fresh()->statut);
    }

    public function test_soumettre_requires_at_least_one_piece_jointe(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->create();

        $response = $this->post(route('demandes.soumettre', $demande));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutDemande::BROUILLON, $demande->fresh()->statut);
    }

    public function test_soumettre_blocked_when_periode_closed(): void
    {
        $this->actingAsAgent();
        $type    = TypeAide::factory()->requiertPeriode()->create();
        $annee   = AnneeGestion::factory()->create();
        $periode = PeriodeOuverture::factory()->expiree()->create(['annee_gestion_id' => $annee->id]);
        $demande = Demande::factory()->create([
            'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id, 'periode_ouverture_id' => $periode->id,
        ]);
        $demande->piecesJointes()->create(['nom_original' => 'a.pdf', 'chemin' => 'x', 'type_mime' => 'application/pdf', 'taille' => 10]);

        $response = $this->post(route('demandes.soumettre', $demande));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutDemande::BROUILLON, $demande->fresh()->statut);
    }

    public function test_soumettre_success_sets_statut_and_date(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->create();
        $demande->piecesJointes()->create(['nom_original' => 'a.pdf', 'chemin' => 'x', 'type_mime' => 'application/pdf', 'taille' => 10]);

        $response = $this->post(route('demandes.soumettre', $demande));

        $response->assertSessionHas('success');
        $demande->refresh();
        $this->assertEquals(StatutDemande::SOUMIS, $demande->statut);
        $this->assertNotNull($demande->date_soumission);
    }
}
