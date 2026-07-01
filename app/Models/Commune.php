<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Commune extends Model
{
    protected $fillable = ['departement_id', 'nom', 'code'];

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }

    public function citoyens(): HasMany
    {
        return $this->hasMany(Citoyen::class);
    }

    public function prestataires(): HasMany
    {
        return $this->hasMany(Prestataire::class);
    }
}
