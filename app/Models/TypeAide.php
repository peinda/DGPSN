<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeAide extends Model
{
    use HasFactory;

    protected $table = 'types_aide';

    protected $fillable = ['nom', 'code', 'description', 'actif', 'requiert_periode'];

    protected $casts = ['actif' => 'boolean', 'requiert_periode' => 'boolean'];

    private const CODES_MEDICAUX = ['ASSIST_MED', 'HOSP'];

    public function estMedical(): bool
    {
        return in_array($this->code, self::CODES_MEDICAUX, true);
    }

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
