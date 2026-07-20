<?php

namespace App\Models;

use App\Enums\CycleVie;
use App\Enums\Sexe;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Citoyen extends Model
{
    use HasFactory;

    protected $fillable = ['cin', 'nom', 'prenom', 'telephone', 'date_naissance', 'adresse', 'commune_id'];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    protected $appends = ['sexe', 'age', 'cycle_vie'];

    /**
     * Déduit du premier chiffre du CIN sénégalais : 1 = masculin, 2 = féminin.
     */
    protected function sexe(): Attribute
    {
        return Attribute::make(
            get: fn () => str_starts_with($this->cin, '2') ? Sexe::FEMININ : Sexe::MASCULIN,
        );
    }

    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->date_naissance ? (int) $this->date_naissance->diffInYears(now()) : null,
        );
    }

    protected function cycleVie(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->age === null ? null : CycleVie::depuisAge($this->age),
        );
    }

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
