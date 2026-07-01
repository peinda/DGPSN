<?php

namespace App\Enums;

enum TypePrestataire: string
{
    case HOPITAL   = 'hopital';
    case PHARMACIE = 'pharmacie';
    case CLINIQUE  = 'clinique';
    case AUTRE     = 'autre';

    public function label(): string
    {
        return match($this) {
            self::HOPITAL   => 'Hôpital',
            self::PHARMACIE => 'Pharmacie',
            self::CLINIQUE  => 'Clinique',
            self::AUTRE     => 'Autre',
        };
    }
}
