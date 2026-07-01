<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Citoyen extends Model
{
    protected $fillable = ['cin', 'nom', 'prenom', 'telephone', 'adresse', 'commune_id'];

    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class);
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    public function nomComplet(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    public function estRecurrent(): bool
    {
        $anneeActuelle = now()->year;

        return $this->demandes()
            ->whereHas('anneeGestion', fn ($q) => $q->where('annee', '<', $anneeActuelle))
            ->where('statut', 'approuve')
            ->exists();
    }

    public function demandesParTypeEtAnnee(int $typeAideId, int $anneeGestionId): int
    {
        return $this->demandes()
            ->where('type_aide_id', $typeAideId)
            ->where('annee_gestion_id', $anneeGestionId)
            ->whereNotIn('statut', ['rejete'])
            ->count();
    }
}
