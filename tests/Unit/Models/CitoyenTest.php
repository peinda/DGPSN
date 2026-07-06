<?php

namespace Tests\Unit\Models;

use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CitoyenTest extends TestCase
{
    use RefreshDatabase;

    public function test_nom_complet_concatenates_prenom_and_nom(): void
    {
        $citoyen = Citoyen::factory()->create(['nom' => 'DIOP', 'prenom' => 'Awa']);

        $this->assertEquals('Awa DIOP', $citoyen->nomComplet());
    }

    public function test_est_recurrent_true_when_prior_year_has_approuve_demande(): void
    {
        $citoyen     = Citoyen::factory()->create();
        $anneePassee = AnneeGestion::factory()->create(['annee' => now()->year - 1]);
        Demande::factory()->approuvee()->create(['citoyen_id' => $citoyen->id, 'annee_gestion_id' => $anneePassee->id]);

        $this->assertTrue($citoyen->estRecurrent());
    }

    public function test_est_recurrent_false_when_prior_year_demande_not_approuve(): void
    {
        $citoyen     = Citoyen::factory()->create();
        $anneePassee = AnneeGestion::factory()->create(['annee' => now()->year - 1]);
        Demande::factory()->rejetee()->create(['citoyen_id' => $citoyen->id, 'annee_gestion_id' => $anneePassee->id]);

        $this->assertFalse($citoyen->estRecurrent());
    }

    public function test_est_recurrent_false_when_no_prior_year_demandes(): void
    {
        $citoyen = Citoyen::factory()->create();
        Demande::factory()->approuvee()->create(['citoyen_id' => $citoyen->id]); // current year annee

        $this->assertFalse($citoyen->estRecurrent());
    }

    public function test_demandes_par_type_et_annee_excludes_rejete(): void
    {
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        Demande::factory()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);
        Demande::factory()->rejetee()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);

        $this->assertEquals(1, $citoyen->demandesParTypeEtAnnee($type->id, $annee->id));
    }
}
