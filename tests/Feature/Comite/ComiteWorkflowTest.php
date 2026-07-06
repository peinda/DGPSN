<?php

namespace Tests\Feature\Comite;

use App\Enums\StatutDemande;
use App\Models\AuditLog;
use App\Models\Demande;
use App\Notifications\DemandeDelibereeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class ComiteWorkflowTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_prendre_en_examen_requires_soumis_status(): void
    {
        $this->actingAsComite();
        $demande = Demande::factory()->create();

        $response = $this->post(route('comite.examiner', $demande));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutDemande::BROUILLON, $demande->fresh()->statut);
    }

    public function test_prendre_en_examen_success(): void
    {
        $membre  = $this->actingAsComite();
        $demande = Demande::factory()->soumise()->create();

        $response = $this->post(route('comite.examiner', $demande));

        $response->assertRedirect(route('comite.show', $demande));
        $demande->refresh();
        $this->assertEquals(StatutDemande::EN_EXAMEN, $demande->statut);
        $this->assertEquals($membre->id, $demande->comite_user_id);
    }

    public function test_approuver_requires_soumis_or_en_examen(): void
    {
        $this->actingAsComite();
        $demande = Demande::factory()->create();

        $response = $this->post(route('comite.approuver', $demande));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutDemande::BROUILLON, $demande->fresh()->statut);
    }

    public function test_approuver_success_updates_statut_audits_and_notifies_agent(): void
    {
        Notification::fake();
        $membre  = $this->actingAsComite();
        $agent   = \App\Models\User::factory()->create();
        $demande = Demande::factory()->soumise()->create(['agent_id' => $agent->id]);

        $response = $this->post(route('comite.approuver', $demande), ['commentaire' => 'Dossier complet']);

        $response->assertRedirect(route('comite.show', $demande));
        $demande->refresh();
        $this->assertEquals(StatutDemande::APPROUVE, $demande->statut);
        $this->assertEquals($membre->id, $demande->comite_user_id);
        $this->assertNotNull($demande->date_deliberation);
        $this->assertDatabaseHas('audit_logs', ['action' => 'demande.approuvee', 'model_id' => $demande->id]);
        Notification::assertSentTo($agent, DemandeDelibereeNotification::class);
    }

    public function test_rejeter_requires_commentaire(): void
    {
        $this->actingAsComite();
        $demande = Demande::factory()->soumise()->create();

        $response = $this->post(route('comite.rejeter', $demande));

        $response->assertSessionHasErrors('commentaire');
    }

    public function test_rejeter_requires_commentaire_min_length(): void
    {
        $this->actingAsComite();
        $demande = Demande::factory()->soumise()->create();

        $response = $this->post(route('comite.rejeter', $demande), ['commentaire' => 'court']);

        $response->assertSessionHasErrors('commentaire');
    }

    public function test_rejeter_success_updates_statut_audits_and_notifies_agent(): void
    {
        Notification::fake();
        $agent   = \App\Models\User::factory()->create();
        $this->actingAsComite();
        $demande = Demande::factory()->soumise()->create(['agent_id' => $agent->id]);

        $response = $this->post(route('comite.rejeter', $demande), ['commentaire' => 'Pièces manquantes au dossier']);

        $response->assertRedirect(route('comite.show', $demande));
        $demande->refresh();
        $this->assertEquals(StatutDemande::REJETE, $demande->statut);
        $this->assertDatabaseHas('audit_logs', ['action' => 'demande.rejetee', 'model_id' => $demande->id]);
        Notification::assertSentTo($agent, DemandeDelibereeNotification::class);
    }

    public function test_comite_index_lists_en_attente_and_traitees(): void
    {
        $this->actingAsComite();
        Demande::factory()->soumise()->create();
        Demande::factory()->enExamen()->create();
        Demande::factory()->approuvee()->create();
        Demande::factory()->create(); // brouillon, should appear in neither list

        $response = $this->get(route('comite.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('enAttente', 2)
            ->has('traitees', 1));
    }
}
