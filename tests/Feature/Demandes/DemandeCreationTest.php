<?php

namespace Tests\Feature\Demandes;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\Evenement;
use App\Models\PeriodeOuverture;
use App\Models\Prestataire;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class DemandeCreationTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_demandes_create_route_is_not_swallowed_by_show_route(): void
    {
        $this->actingAsAgent();

        $response = $this->get(route('demandes.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Demandes/Create'));
    }

    public function test_agent_can_create_demande_with_existing_citoyen(): void
    {
        $agent  = $this->actingAsAgent();
        $citoyen= Citoyen::factory()->create();
        $type   = TypeAide::factory()->create();
        $annee  = AnneeGestion::factory()->create();

        $response = $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
        ]);

        $demande = Demande::first();
        $response->assertRedirect(route('demandes.show', $demande));
        $this->assertEquals($citoyen->id, $demande->citoyen_id);
        $this->assertEquals($agent->id, $demande->agent_id);
        $this->assertEquals(StatutDemande::BROUILLON, $demande->statut);
    }

    public function test_creating_demande_with_new_citoyen_data_creates_citoyen(): void
    {
        $this->actingAsAgent();
        $type  = TypeAide::factory()->create();
        $annee = AnneeGestion::factory()->create();

        $response = $this->post(route('demandes.store'), [
            'cin'              => '123456789012',
            'nom'              => 'DIALLO',
            'prenom'           => 'Fatou',
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
        ]);

        $response->assertSessionDoesntHaveErrors();
        $this->assertDatabaseHas('citoyens', ['cin' => '123456789012', 'nom' => 'DIALLO', 'prenom' => 'Fatou']);
        $citoyen = Citoyen::where('cin', '123456789012')->first();
        $this->assertEquals($citoyen->id, Demande::first()->citoyen_id);
    }

    public function test_quota_blocks_third_non_rejected_demande(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        Demande::factory()->count(2)->create([
            'citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id,
        ]);

        $response = $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
        ]);

        $response->assertSessionHasErrors('type_aide_id');
        $this->assertEquals(2, Demande::count());
    }

    public function test_quota_allows_third_demande_when_one_prior_is_rejetee(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        Demande::factory()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);
        Demande::factory()->rejetee()->create(['citoyen_id' => $citoyen->id, 'type_aide_id' => $type->id, 'annee_gestion_id' => $annee->id]);

        $response = $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
        ]);

        $response->assertSessionDoesntHaveErrors();
        $this->assertEquals(3, Demande::count());
    }

    public function test_requiert_periode_type_blocks_creation_without_active_period(): void
    {
        $this->actingAsAgent();
        $citoyen   = Citoyen::factory()->create();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();
        // no active PeriodeOuverture for this evenement/annee combination

        $response = $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'evenement_id'     => $evenement->id,
            'annee_gestion_id' => $annee->id,
        ]);

        $response->assertSessionHasErrors('evenement_id');
        $this->assertEquals(0, Demande::count());
    }

    public function test_soumettre_apres_succeeds_when_periode_ouverture_id_is_supplied_and_active(): void
    {
        Storage::fake('public');
        $this->actingAsAgent();
        $citoyen   = Citoyen::factory()->create();
        $type      = TypeAide::factory()->requiertPeriode()->create();
        $evenement = Evenement::factory()->create(['type_aide_id' => $type->id]);
        $annee     = AnneeGestion::factory()->create();
        $periode   = PeriodeOuverture::factory()->create(['evenement_id' => $evenement->id, 'annee_gestion_id' => $annee->id]);

        $this->post(route('demandes.store'), [
            'citoyen_id'           => $citoyen->id,
            'type_aide_id'         => $type->id,
            'evenement_id'         => $evenement->id,
            'annee_gestion_id'     => $annee->id,
            'periode_ouverture_id' => $periode->id,
            'pieces_jointes'       => [UploadedFile::fake()->create('justificatif.pdf', 100, 'application/pdf')],
            '_soumettre_apres'     => '1',
        ]);

        $demande = Demande::first();
        $this->assertEquals(StatutDemande::SOUMIS, $demande->statut);
    }

    public function test_prestataires_are_attached_and_montant_total_computed(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();
        $p1      = Prestataire::factory()->create();
        $p2      = Prestataire::factory()->create();

        $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
            'prestataires'     => [
                ['id' => $p1->id, 'montant_estime' => 15000],
                ['id' => $p2->id, 'montant_estime' => 25000],
            ],
        ]);

        $demande = Demande::first();
        $this->assertEquals(2, $demande->prestataires()->count());
        $this->assertEquals(40000, (float) $demande->montant_total);
    }

    public function test_pieces_jointes_are_stored_on_public_disk(): void
    {
        Storage::fake('public');
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
            'pieces_jointes'   => [UploadedFile::fake()->create('justificatif.pdf', 100, 'application/pdf')],
        ]);

        $demande = Demande::first();
        $this->assertEquals(1, $demande->piecesJointes()->count());
        Storage::disk('public')->assertExists($demande->piecesJointes()->first()->chemin);
    }

    public function test_soumettre_apres_submits_immediately_when_pieces_present(): void
    {
        Storage::fake('public');
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        $this->post(route('demandes.store'), [
            'citoyen_id'         => $citoyen->id,
            'type_aide_id'       => $type->id,
            'annee_gestion_id'   => $annee->id,
            'pieces_jointes'     => [UploadedFile::fake()->create('justificatif.pdf', 100, 'application/pdf')],
            '_soumettre_apres'   => '1',
        ]);

        $demande = Demande::first();
        $this->assertEquals(StatutDemande::SOUMIS, $demande->statut);
        $this->assertNotNull($demande->date_soumission);
    }

    public function test_soumettre_apres_stays_brouillon_when_no_pieces(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();
        $type    = TypeAide::factory()->create();
        $annee   = AnneeGestion::factory()->create();

        $this->post(route('demandes.store'), [
            'citoyen_id'       => $citoyen->id,
            'type_aide_id'     => $type->id,
            'annee_gestion_id' => $annee->id,
            '_soumettre_apres' => '1',
        ]);

        $this->assertEquals(StatutDemande::BROUILLON, Demande::first()->statut);
    }

    public function test_soumettre_apres_blocked_when_selected_periode_is_expired(): void
    {
        Storage::fake('public');
        $this->actingAsAgent();
        $citoyen  = Citoyen::factory()->create();
        $type     = TypeAide::factory()->requiertPeriode()->create();
        $annee    = AnneeGestion::factory()->create();
        $periode  = PeriodeOuverture::factory()->expiree()->create(['annee_gestion_id' => $annee->id]);

        $this->post(route('demandes.store'), [
            'citoyen_id'           => $citoyen->id,
            'type_aide_id'         => $type->id,
            'annee_gestion_id'     => $annee->id,
            'periode_ouverture_id' => $periode->id,
            'pieces_jointes'       => [UploadedFile::fake()->create('justificatif.pdf', 100, 'application/pdf')],
            '_soumettre_apres'     => '1',
        ]);

        $demande = Demande::first();
        $this->assertEquals(StatutDemande::BROUILLON, $demande->statut);
    }
}
