<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evenement extends Model
{
    protected $fillable = ['type_aide_id', 'nom', 'code', 'description', 'actif'];

    protected $casts = ['actif' => 'boolean'];

    public function typeAide(): BelongsTo
    {
        return $this->belongsTo(TypeAide::class);
    }

    public function periodesOuverture(): HasMany
    {
        return $this->hasMany(PeriodeOuverture::class);
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    public function periodeActiveFor(int $anneeGestionId): ?PeriodeOuverture
    {
        return $this->periodesOuverture()
            ->where('annee_gestion_id', $anneeGestionId)
            ->where('actif', true)
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now())
            ->first();
    }
}
