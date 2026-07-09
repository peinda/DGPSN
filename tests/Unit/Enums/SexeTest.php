<?php

namespace Tests\Unit\Enums;

use App\Enums\Sexe;
use PHPUnit\Framework\TestCase;

class SexeTest extends TestCase
{
    public function test_label_for_every_case(): void
    {
        $this->assertEquals('Masculin', Sexe::MASCULIN->label());
        $this->assertEquals('Féminin', Sexe::FEMININ->label());
    }
}
