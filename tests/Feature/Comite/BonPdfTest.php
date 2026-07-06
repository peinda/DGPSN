<?php

namespace Tests\Feature\Comite;

use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\Prestataire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class BonPdfTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    #[DataProvider('nonApprouveStates')]
    public function test_bon_pdf_is_forbidden_for_non_approuve_statuses(string $factoryState): void
    {
        $this->actingAsComite();
        $demande = $factoryState === 'brouillon'
            ? Demande::factory()->create()
            : Demande::factory()->{$factoryState}()->create();

        $response = $this->get(route('comite.bon-pdf', $demande));

        $response->assertForbidden();
    }

    public static function nonApprouveStates(): array
    {
        return [
            ['brouillon'],
            ['soumise'],
            ['enExamen'],
            ['rejetee'],
            ['cloturee'],
        ];
    }

    public function test_bon_pdf_returns_pdf_for_approuve_demande(): void
    {
        if (! extension_loaded('gd')) {
            $this->markTestSkipped('PHP GD extension is required by dompdf to embed the logo PNG and is not installed in this environment.');
        }

        $this->actingAsComite();
        $citoyen     = Citoyen::factory()->create();
        $demande     = Demande::factory()->approuvee()->create(['citoyen_id' => $citoyen->id]);
        $prestataire = Prestataire::factory()->create();
        $demande->prestataires()->attach($prestataire->id, ['montant_estime' => 10000]);
        $demande->update(['montant_total' => 10000]);

        $response = $this->get(route('comite.bon-pdf', $demande));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString("bon-{$demande->reference}.pdf", $response->headers->get('Content-Disposition'));
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }
}
