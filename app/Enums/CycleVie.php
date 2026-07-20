<?php

namespace App\Enums;

enum CycleVie: string
{
    case JEUNE     = 'jeune';
    case ADULTE    = 'adulte';
    case VIEILLARD = 'vieillard';

    public function label(): string
    {
        return match($this) {
            self::JEUNE     => 'Jeune',
            self::ADULTE    => 'Adulte',
            self::VIEILLARD => 'Vieillard',
        };
    }

    public static function depuisAge(int $age): self
    {
        return match(true) {
            $age <= 35 => self::JEUNE,
            $age <= 59 => self::ADULTE,
            default    => self::VIEILLARD,
        };
    }
}
