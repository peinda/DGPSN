<?php

namespace App\Enums;

enum Sexe: string
{
    case MASCULIN = 'm';
    case FEMININ  = 'f';

    public function label(): string
    {
        return match($this) {
            self::MASCULIN => 'Masculin',
            self::FEMININ  => 'Féminin',
        };
    }
}
