<?php

namespace App\Models;

use App\Enums\StatutAnnee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnneeGestion extends Model
{
    protected $table = 'annees_gestion';

    protected $fillable = ['annee', 'statut', 'date_ouverture', 'date_cloture'];

    protected $casts = [
        'statut'         => StatutAnnee::class,
        'date_ouverture' => 'date',
        'date_cloture'   => 'date',
    ];

    public function periodesOuverture(): HasMany
    {
        return $this->hasMany(PeriodeOuverture::class);
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    public function scopeOuverte($query)
    {
        return $query->where('statut', StatutAnnee::OUVERT);
    }

    public static function courante(): ?self
    {
        return static::where('statut', StatutAnnee::OUVERT)
            ->where('annee', now()->year)
            ->first();
    }
}
