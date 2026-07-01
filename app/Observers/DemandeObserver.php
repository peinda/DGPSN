<?php

namespace App\Observers;

use App\Models\Demande;

class DemandeObserver
{
    public function created(Demande $demande): void
    {
        $annee     = $demande->anneeGestion->annee ?? now()->year;
        $sequence  = Demande::where('annee_gestion_id', $demande->annee_gestion_id)->count();
        $reference = sprintf('DPS-%d-%04d', $annee, $sequence);

        $demande->updateQuietly(['reference' => $reference]);
    }
}
