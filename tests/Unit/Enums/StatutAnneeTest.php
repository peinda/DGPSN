<?php

namespace Tests\Unit\Enums;

use App\Enums\StatutAnnee;
use PHPUnit\Framework\TestCase;

class StatutAnneeTest extends TestCase
{
    public function test_label_for_every_case(): void
    {
        $this->assertEquals('Ouverte', StatutAnnee::OUVERT->label());
        $this->assertEquals('Clôturée', StatutAnnee::CLOTURE->label());
        $this->assertEquals('Archivée', StatutAnnee::ARCHIVE->label());
    }
}
