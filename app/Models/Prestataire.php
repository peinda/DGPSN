<?php

namespace App\Models;

use App\Enums\TypePrestataire;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Prestataire extends Model
{
    protected $fillable = [
        'nom',
        'type',
        'adresse',
        'telephone',
        'email',
        'region_id',
        'departement_id',
        'commune_id',
        'actif',
    ];

    protected $casts = [
        'type' => TypePrestataire::class,
        'actif' => 'boolean',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }

    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class);
    }

    public function demandes(): BelongsToMany
    {
        return $this->belongsToMany(Demande::class, 'demande_prestataire')
            ->withPivot(['montant_estime', 'confirme', 'date_confirmation'])
            ->withTimestamps();
    }

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }
}
