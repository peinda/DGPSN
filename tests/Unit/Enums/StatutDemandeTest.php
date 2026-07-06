<?php

namespace Tests\Unit\Enums;

use App\Enums\StatutDemande;
use PHPUnit\Framework\TestCase;

class StatutDemandeTest extends TestCase
{
    public function test_label_for_every_case(): void
    {
        $this->assertEquals('Brouillon', StatutDemande::BROUILLON->label());
        $this->assertEquals('Soumis', StatutDemande::SOUMIS->label());
        $this->assertEquals('En examen', StatutDemande::EN_EXAMEN->label());
        $this->assertEquals('Approuvé', StatutDemande::APPROUVE->label());
        $this->assertEquals('Rejeté', StatutDemande::REJETE->label());
        $this->assertEquals('Clôturé', StatutDemande::CLOTURE->label());
    }

    public function test_couleur_for_every_case(): void
    {
        $this->assertEquals('gray', StatutDemande::BROUILLON->couleur());
        $this->assertEquals('blue', StatutDemande::SOUMIS->couleur());
        $this->assertEquals('purple', StatutDemande::EN_EXAMEN->couleur());
        $this->assertEquals('green', StatutDemande::APPROUVE->couleur());
        $this->assertEquals('red', StatutDemande::REJETE->couleur());
        $this->assertEquals('slate', StatutDemande::CLOTURE->couleur());
    }

    public function test_est_finalise_true_only_for_approuve_rejete_cloture(): void
    {
        $this->assertFalse(StatutDemande::BROUILLON->estFinalise());
        $this->assertFalse(StatutDemande::SOUMIS->estFinalise());
        $this->assertFalse(StatutDemande::EN_EXAMEN->estFinalise());
        $this->assertTrue(StatutDemande::APPROUVE->estFinalise());
        $this->assertTrue(StatutDemande::REJETE->estFinalise());
        $this->assertTrue(StatutDemande::CLOTURE->estFinalise());
    }
}
