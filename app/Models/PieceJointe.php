<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PieceJointe extends Model
{
    protected $table = 'pieces_jointes';

    protected $fillable = ['demande_id', 'nom_original', 'chemin', 'type_mime', 'taille'];

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }

    public function url(): string
    {
        return Storage::url($this->chemin);
    }

    public function tailleFormatee(): string
    {
        $kb = $this->taille / 1024;
        return $kb >= 1024
            ? number_format($kb / 1024, 1) . ' Mo'
            : number_format($kb, 0) . ' Ko';
    }
}
