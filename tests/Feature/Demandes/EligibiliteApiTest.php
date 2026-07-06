<?php

namespace Tests\Feature\Demandes;

use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\Evenement;
use App\Models\PeriodeOuverture;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class EligibiliteApiTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_missing_params_return_safe_defaults(): void
    {
        $this->actingAsAgent();

        $response = $this->getJson(route('demandes.eligibilite'));

        $response->assertOk();
        $response->assertJson([
            'quota_atteint'    => false,
            'periode_active'   => false,
            'requiert_periode' => false,
        ]);
    }

    public function test_quota_atteint_reported_correctly(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();
        Demande::factory()->count(2)->create([
            'citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id,
        ]);

        $response = $this->getJson(route('demandes.eligibilite', [
            'citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id,
        ]));

        $response->assertJson(['quota_atteint' => true]);
    }

    public function test_requiert_periode_and_periode_active_flags(): void
    {
        $this->actingAsAgent();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();
        PeriodeOuverture::factory()->create(['evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id]);

        $response = $this->getJson(route('demandes.eligibilite', [
            'type_aide_id' => $type->id, 'evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id,
        ]));

        $response->assertJson(['requiert_periode' => true, 'periode_active' => true]);
    }

    public function test_periode_inactive_when_expired(): void
    {
        $this->actingAsAgent();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();
        PeriodeOuverture::factory()->expiree()->create(['evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id]);

        $response = $this->getJson(route('demandes.eligibilite', [
            'type_aide_id' => $type->id, 'evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id,
        ]));

        $response->assertJson(['requiert_periode' => true, 'periode_active' => false]);
    }
}
