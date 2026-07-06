<?php

namespace Tests\Feature\Referentiels;

use App\Models\AnneeGestion;
use App\Models\Evenement;
use App\Models\PeriodeOuverture;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class PeriodesOuvertureReferentielTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_store_creates_periode_for_requiert_periode_type(): void
    {
        $this->actingAsAdministrateur();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();

        $response = $this->post(route('referentiels.periodes.store'), [
            'evenement_id'     => $evenement->id,
            'annee_gestion_id' => $annee->id,
            'date_debut'       => now()->toDateString(),
            'date_fin'         => now()->addDays(10)->toDateString(),
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('periodes_ouverture', ['evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id]);
    }

    public function test_store_blocked_for_type_not_requiring_periode(): void
    {
        $this->actingAsAdministrateur();
        $type      = TypeAide::factory()->create(); // requiert_periode = false
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();

        $response = $this->post(route('referentiels.periodes.store'), [
            'evenement_id'     => $evenement->id,
            'annee_gestion_id' => $annee->id,
            'date_debut'       => now()->toDateString(),
            'date_fin'         => now()->addDays(10)->toDateString(),
        ]);

        $response->assertSessionHasErrors('evenement_id');
    }

    public function test_store_blocked_by_unique_evenement_annee(): void
    {
        $this->actingAsAdministrateur();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();
        PeriodeOuverture::factory()->create(['evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id]);

        $response = $this->post(route('referentiels.periodes.store'), [
            'evenement_id'     => $evenement->id,
            'annee_gestion_id' => $annee->id,
            'date_debut'       => now()->toDateString(),
            'date_fin'         => now()->addDays(10)->toDateString(),
        ]);

        $response->assertSessionHasErrors('annee_gestion_id');
    }

    public function test_store_requires_date_fin_after_date_debut(): void
    {
        $this->actingAsAdministrateur();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();

        $response = $this->post(route('referentiels.periodes.store'), [
            'evenement_id'     => $evenement->id,
            'annee_gestion_id' => $annee->id,
            'date_debut'       => now()->toDateString(),
            'date_fin'         => now()->subDays(1)->toDateString(),
        ]);

        $response->assertSessionHasErrors('date_fin');
    }

    public function test_update_modifies_dates(): void
    {
        $this->actingAsAdministrateur();
        $periode = PeriodeOuverture::factory()->create();

        $response = $this->put(route('referentiels.periodes.update', $periode), [
            'date_debut' => now()->toDateString(),
            'date_fin'   => now()->addDays(20)->toDateString(),
        ]);

        $response->assertSessionHas('success');
    }

    public function test_destroy_deletes_periode(): void
    {
        $this->actingAsAdministrateur();
        $periode = PeriodeOuverture::factory()->create();

        $response = $this->delete(route('referentiels.periodes.destroy', $periode));

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('periodes_ouverture', ['id' => $periode->id]);
    }
}
