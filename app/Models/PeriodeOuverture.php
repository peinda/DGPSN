<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeriodeOuverture extends Model
{
    use HasFactory;

    protected $table = 'periodes_ouverture';

    protected $fillable = [
        'evenement_id',
        'annee_gestion_id',
        'date_debut',
        'date_fin',
        'actif',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
        'actif'      => 'boolean',
    ];

    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class);
    }

    public function anneeGestion(): BelongsTo
    {
        return $this->belongsTo(AnneeGestion::class);
    }

    public function estActive(): bool
    {
        return $this->actif
            && now()->between($this->date_debut, $this->date_fin);
    }

    public function scopeActive($query)
    {
        return $query->where('actif', true)
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now());
    }
}
