<?php

namespace Tests\Feature\Demandes;

use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\Prestataire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class PrestataireConfirmationTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_confirmer_prestataire_requires_approuve_status(): void
    {
        $this->actingAsAgent();
        $demande     = Demande::factory()->soumise()->create();
        $prestataire = Prestataire::factory()->create();
        $demande->prestataires()->attach($prestataire->id, ['montant_estime' => 1000]);

        $response = $this->post(route('demandes.prestataires.confirmer', [$demande, $prestataire]));

        $response->assertSessionHas('error');
        $this->assertFalse((bool) $demande->prestataires()->first()->pivot->confirme);
    }

    public function test_confirmer_prestataire_updates_pivot_without_closing_when_others_pending(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->approuvee()->create();
        $p1 = Prestataire::factory()->create();
        $p2 = Prestataire::factory()->create();
        $demande->prestataires()->attach($p1->id, ['montant_estime' => 1000]);
        $demande->prestataires()->attach($p2->id, ['montant_estime' => 2000]);

        $response = $this->post(route('demandes.prestataires.confirmer', [$demande, $p1]));

        $response->assertSessionHas('success');
        $demande->refresh();
        $this->assertTrue((bool) $demande->prestataires()->find($p1->id)->pivot->confirme);
        $this->assertFalse((bool) $demande->prestataires()->find($p2->id)->pivot->confirme);
        $this->assertEquals(StatutDemande::APPROUVE, $demande->statut);
    }

    public function test_confirming_last_pending_prestataire_auto_cloture(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->approuvee()->create();
        $prestataire = Prestataire::factory()->create();
        $demande->prestataires()->attach($prestataire->id, ['montant_estime' => 1000]);

        $response = $this->post(route('demandes.prestataires.confirmer', [$demande, $prestataire]));

        $demande->refresh();
        $this->assertEquals(StatutDemande::CLOTURE, $demande->statut);
        $this->assertNotNull($demande->date_cloture);
    }

    public function test_cloturer_action_requires_approuve_status(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->soumise()->create();

        $response = $this->post(route('demandes.cloturer', $demande));

        $response->assertSessionHas('error');
        $this->assertEquals(StatutDemande::SOUMIS, $demande->fresh()->statut);
    }

    public function test_cloturer_action_success(): void
    {
        $this->actingAsAgent();
        $demande = Demande::factory()->approuvee()->create();

        $response = $this->post(route('demandes.cloturer', $demande));

        $response->assertSessionHas('success');
        $demande->refresh();
        $this->assertEquals(StatutDemande::CLOTURE, $demande->statut);
        $this->assertNotNull($demande->date_cloture);
    }
}
