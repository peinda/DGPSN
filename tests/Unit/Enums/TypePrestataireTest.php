<?php

namespace Tests\Unit\Enums;

use App\Enums\TypePrestataire;
use PHPUnit\Framework\TestCase;

class TypePrestataireTest extends TestCase
{
    public function test_label_for_every_case(): void
    {
        $this->assertEquals('Hôpital', TypePrestataire::HOPITAL->label());
        $this->assertEquals('Pharmacie', TypePrestataire::PHARMACIE->label());
        $this->assertEquals('Clinique', TypePrestataire::CLINIQUE->label());
        $this->assertEquals('Autre', TypePrestataire::AUTRE->label());
    }
}
