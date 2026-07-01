<?php

namespace App\Enums;

enum StatutDemande: string
{
    case BROUILLON  = 'brouillon';
    case SOUMIS     = 'soumis';
    case EN_EXAMEN  = 'en_examen';
    case APPROUVE   = 'approuve';
    case REJETE     = 'rejete';
    case CLOTURE    = 'cloture';

    public function label(): string
    {
        return match($this) {
            self::BROUILLON  => 'Brouillon',
            self::SOUMIS     => 'Soumis',
            self::EN_EXAMEN  => 'En examen',
            self::APPROUVE   => 'Approuvé',
            self::REJETE     => 'Rejeté',
            self::CLOTURE    => 'Clôturé',
        };
    }

    public function couleur(): string
    {
        return match($this) {
            self::BROUILLON  => 'gray',
            self::SOUMIS     => 'blue',
            self::EN_EXAMEN  => 'purple',
            self::APPROUVE   => 'green',
            self::REJETE     => 'red',
            self::CLOTURE    => 'slate',
        };
    }

    public function estFinalise(): bool
    {
        return in_array($this, [self::APPROUVE, self::REJETE, self::CLOTURE]);
    }
}
