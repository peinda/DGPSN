<?php

namespace App\Models;

use App\Enums\StatutDemande;
use App\Observers\DemandeObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy(DemandeObserver::class)]
class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'citoyen_id',
        'type_aide_id',
        'evenement_id',
        'annee_gestion_id',
        'periode_ouverture_id',
        'agent_id',
        'comite_user_id',
        'statut',
        'montant_total',
        'montant_approuve',
        'commentaire',
        'date_soumission',
        'date_deliberation',
        'date_cloture',
    ];

    protected $casts = [
        'statut'             => StatutDemande::class,
        'montant_total'      => 'decimal:2',
        'montant_approuve'   => 'decimal:2',
        'date_soumission'    => 'datetime',
        'date_deliberation'  => 'datetime',
        'date_cloture'       => 'datetime',
    ];

    // Relations
    public function citoyen(): BelongsTo
    {
        return $this->belongsTo(Citoyen::class);
    }

    public function typeAide(): BelongsTo
    {
        return $this->belongsTo(TypeAide::class);
    }

    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class);
    }

    public function anneeGestion(): BelongsTo
    {
        return $this->belongsTo(AnneeGestion::class);
    }

    public function periodeOuverture(): BelongsTo
    {
        return $this->belongsTo(PeriodeOuverture::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function comiteUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'comite_user_id');
    }

    public function prestataires(): BelongsToMany
    {
        return $this->belongsToMany(Prestataire::class, 'demande_prestataire')
            ->withPivot(['montant_estime', 'confirme', 'date_confirmation'])
            ->withTimestamps();
    }

    public function piecesJointes(): HasMany
    {
        return $this->hasMany(PieceJointe::class);
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->whereIn('statut', [
            StatutDemande::SOUMIS->value,
            StatutDemande::EN_EXAMEN->value,
        ]);
    }

    public function scopeParStatut($query, StatutDemande $statut)
    {
        return $query->where('statut', $statut->value);
    }

    // Règle 1 — Quota : max 2 demandes même type/citoyen/année (hors rejetées)
    public static function quotaAtteint(int $citoyenId, int $typeAideId, int $anneeGestionId): bool
    {
        return static::where('citoyen_id', $citoyenId)
            ->where('type_aide_id', $typeAideId)
            ->where('annee_gestion_id', $anneeGestionId)
            ->whereNotIn('statut', [StatutDemande::REJETE->value])
            ->count() >= 2;
    }

    // Transitions de statut
    public function soumettre(): void
    {
        $this->update([
            'statut'          => StatutDemande::SOUMIS,
            'date_soumission' => now(),
        ]);
    }

    public function prendreEnExamen(User $membreComite): void
    {
        $this->update([
            'statut'         => StatutDemande::EN_EXAMEN,
            'comite_user_id' => $membreComite->id,
        ]);
    }

    public function approuver(User $membreComite, ?string $commentaire = null, ?float $montantApprouve = null): void
    {
        $this->update([
            'statut'            => StatutDemande::APPROUVE,
            'comite_user_id'    => $membreComite->id,
            'commentaire'       => $commentaire,
            'montant_approuve'  => $montantApprouve,
            'date_deliberation' => now(),
        ]);
    }

    public function rejeter(User $membreComite, string $commentaire): void
    {
        $this->update([
            'statut'            => StatutDemande::REJETE,
            'comite_user_id'    => $membreComite->id,
            'commentaire'       => $commentaire,
            'date_deliberation' => now(),
        ]);
    }

    public function cloturer(): void
    {
        $this->update([
            'statut'       => StatutDemande::CLOTURE,
            'date_cloture' => now(),
        ]);
    }
}
