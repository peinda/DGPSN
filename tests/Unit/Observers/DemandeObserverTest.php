<?php

namespace Tests\Unit\Observers;

use App\Models\AnneeGestion;
use App\Models\Demande;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemandeObserverTest extends TestCase
{
    use RefreshDatabase;

    public function test_reference_matches_dps_annee_sequence_format(): void
    {
        $annee   = AnneeGestion::factory()->create(['annee' => 2077]);
        $demande = Demande::factory()->create(['annee_gestion_id' => $annee->id]);

        $this->assertMatchesRegularExpression('/^DPS-2077-\d{4}$/', $demande->reference);
    }

    public function test_first_demande_for_an_annee_gets_sequence_one(): void
    {
        $annee   = AnneeGestion::factory()->create(['annee' => 2078]);
        $demande = Demande::factory()->create(['annee_gestion_id' => $annee->id]);

        $this->assertEquals('DPS-2078-0001', $demande->reference);
    }

    public function test_sequence_increments_per_annee_gestion_not_globally(): void
    {
        $annee1 = AnneeGestion::factory()->create(['annee' => 2079]);
        $annee2 = AnneeGestion::factory()->create(['annee' => 2080]);

        $d1a = Demande::factory()->create(['annee_gestion_id' => $annee1->id]);
        $d2a = Demande::factory()->create(['annee_gestion_id' => $annee2->id]);
        $d1c = Demande::factory()->create(['annee_gestion_id' => $annee1->id]);

        $this->assertEquals('DPS-2079-0001', $d1a->reference);
        $this->assertEquals('DPS-2080-0001', $d2a->reference); // not 0002, separate sequence
        $this->assertEquals('DPS-2079-0002', $d1c->reference);
    }
}
