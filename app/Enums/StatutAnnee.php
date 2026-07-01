<?php

namespace App\Enums;

enum StatutAnnee: string
{
    case OUVERT  = 'ouvert';
    case CLOTURE = 'cloture';
    case ARCHIVE = 'archive';

    public function label(): string
    {
        return match($this) {
            self::OUVERT  => 'Ouverte',
            self::CLOTURE => 'Clôturée',
            self::ARCHIVE => 'Archivée',
        };
    }
}
