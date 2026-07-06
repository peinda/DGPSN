<?php

namespace Tests\Unit\Models;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\TypeAide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemandeTest extends TestCase
{
    use RefreshDatabase;

    public function test_quota_atteint_boundary(): void
    {
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        $this->assertFalse(Demande::quotaAtteint($citoyen->id, $type->id, $annee->id));

        Demande::factory()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);
        $this->assertFalse(Demande::quotaAtteint($citoyen->id, $type->id, $annee->id));

        Demande::factory()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);
        $this->assertTrue(Demande::quotaAtteint($citoyen->id, $type->id, $annee->id));
    }

    public function test_quota_atteint_excludes_rejete(): void
    {
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        Demande::factory()->count(3)->rejetee()->create([
            'citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id,
        ]);

        $this->assertFalse(Demande::quotaAtteint($citoyen->id, $type->id, $annee->id));
    }

    public function test_quota_atteint_counts_brouillon_approuve_and_cloture(): void
    {
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        Demande::factory()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]); // brouillon
        Demande::factory()->cloturee()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);

        $this->assertTrue(Demande::quotaAtteint($citoyen->id, $type->id, $annee->id));
    }

    public function test_scope_en_attente_includes_only_soumis_and_en_examen(): void
    {
        Demande::factory()->create(); // brouillon
        Demande::factory()->soumise()->create();
        Demande::factory()->enExamen()->create();
        Demande::factory()->approuvee()->create();

        $this->assertEquals(2, Demande::enAttente()->count());
    }

    public function test_scope_par_statut(): void
    {
        Demande::factory()->approuvee()->create();
        Demande::factory()->rejetee()->create();

        $this->assertEquals(1, Demande::parStatut(StatutDemande::APPROUVE)->count());
    }

    public function test_soumettre_sets_statut_and_date(): void
    {
        $demande = Demande::factory()->create();

        $demande->soumettre();

        $this->assertEquals(StatutDemande::SOUMIS, $demande->statut);
        $this->assertNotNull($demande->date_soumission);
    }

    public function test_prendre_en_examen_sets_statut_and_comite_user(): void
    {
        $demande = Demande::factory()->soumise()->create();
        $membre  = User::factory()->create();

        $demande->prendreEnExamen($membre);

        $this->assertEquals(StatutDemande::EN_EXAMEN, $demande->statut);
        $this->assertEquals($membre->id, $demande->comite_user_id);
    }

    public function test_approuver_sets_statut_comite_user_commentaire_and_date(): void
    {
        $demande = Demande::factory()->soumise()->create();
        $membre  = User::factory()->create();

        $demande->approuver($membre, 'Dossier complet');

        $this->assertEquals(StatutDemande::APPROUVE, $demande->statut);
        $this->assertEquals($membre->id, $demande->comite_user_id);
        $this->assertEquals('Dossier complet', $demande->commentaire);
        $this->assertNotNull($demande->date_deliberation);
    }

    public function test_rejeter_sets_statut_comite_user_commentaire_and_date(): void
    {
        $demande = Demande::factory()->soumise()->create();
        $membre  = User::factory()->create();

        $demande->rejeter($membre, 'Pièces manquantes');

        $this->assertEquals(StatutDemande::REJETE, $demande->statut);
        $this->assertEquals($membre->id, $demande->comite_user_id);
        $this->assertEquals('Pièces manquantes', $demande->commentaire);
        $this->assertNotNull($demande->date_deliberation);
    }

    public function test_cloturer_sets_statut_and_date(): void
    {
        $demande = Demande::factory()->approuvee()->create();

        $demande->cloturer();

        $this->assertEquals(StatutDemande::CLOTURE, $demande->statut);
        $this->assertNotNull($demande->date_cloture);
    }
}
