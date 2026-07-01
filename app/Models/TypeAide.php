<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeAide extends Model
{
    protected $table = 'types_aide';

    protected $fillable = ['nom', 'code', 'description', 'actif', 'requiert_periode'];

    protected $casts = ['actif' => 'boolean', 'requiert_periode' => 'boolean'];

    public function evenements(): HasMany
    {
        return $this->hasMany(Evenement::class);
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }
}
