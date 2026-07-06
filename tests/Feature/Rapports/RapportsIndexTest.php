<?php

namespace Tests\Feature\Rapports;

use App\Models\AnneeGestion;
use App\Models\Demande;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class RapportsIndexTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_dashboard_computes_stats_from_known_dataset(): void
    {
        $this->actingAsAdministrateur();
        $type  = TypeAide::factory()->create();
        $annee = AnneeGestion::factory()->create();

        Demande::factory()->count(3)->create(['type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);
        Demande::factory()->count(2)->approuvee()->create(['type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);
        Demande::factory()->rejetee()->create(['type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);

        $response = $this->get(route('rapports.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('totalGeneral', 6)
            ->where('parStatut', fn ($parStatut) => collect($parStatut)->firstWhere('statut', 'approuve')['count'] === 2
                && collect($parStatut)->firstWhere('statut', 'rejete')['count'] === 1));
    }

    public function test_dashboard_filters_by_annee(): void
    {
        $this->actingAsAdministrateur();
        $annee1 = AnneeGestion::factory()->create();
        $annee2 = AnneeGestion::factory()->create();
        Demande::factory()->create(['annee_gestion_id' => $annee1->id]);
        Demande::factory()->create(['annee_gestion_id' => $annee2->id]);

        $response = $this->get(route('rapports.index', ['annee_gestion_id' => $annee1->id]));

        $response->assertInertia(fn ($page) => $page->where('totalGeneral', 1));
    }

    public function test_exports_page_lists_annees_and_types(): void
    {
        $this->actingAsAdministrateur();
        AnneeGestion::factory()->create();
        TypeAide::factory()->create();

        $response = $this->get(route('rapports.exports'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Rapports/Exports'));
    }
}
