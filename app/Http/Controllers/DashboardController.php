<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\TypeAide;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private const COULEURS_TYPE = [
        'ASSIST_MED' => '#16a34a',
        'EVENT_REL'  => '#eab308',
        'HOSP'       => '#3b82f6',
        'URGENCE'    => '#ef4444',
    ];

    public function index()
    {
        $now       = now();
        $debutMois = $now->copy()->startOfMonth();
        $debutMoisPrecedent = $now->copy()->subMonth()->startOfMonth();
        $finMoisPrecedent   = $now->copy()->subMonth()->endOfMonth();

        // L'agent ne voit que les statistiques des demandes qu'il a lui-même saisies
        $isAgent = Auth::user()->hasRole('agent');
        $agentId = Auth::id();
        $base    = fn () => Demande::query()->when($isAgent, fn ($q) => $q->where('agent_id', $agentId));

        // --- KPI totaux ---
        $total      = $base()->count();
        $enAttente  = $base()->whereIn('statut', [StatutDemande::SOUMIS->value, StatutDemande::EN_EXAMEN->value])->count();
        $approuvees = $base()->where('statut', StatutDemande::APPROUVE->value)->count();
        $rejetees   = $base()->where('statut', StatutDemande::REJETE->value)->count();
        $cloturees  = $base()->where('statut', StatutDemande::CLOTURE->value)->count();

        // --- Trends (vs mois précédent) ---
        $totalMois    = $base()->where('created_at', '>=', $debutMois)->count();
        $totalPrecMois= $base()->whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])->count();

        // --- Évolution 6 derniers mois ---
        $evolution = collect(range(5, 0))->map(function ($i) use ($now, $base) {
            $mois = $now->copy()->subMonths($i);
            return [
                'label' => ucfirst($mois->locale('fr')->isoFormat('MMM')),
                'value' => $base()->whereYear('created_at', $mois->year)
                    ->whereMonth('created_at', $mois->month)
                    ->count(),
            ];
        });

        // --- Répartition par type d'aide ---
        $repartition = TypeAide::withCount(['demandes' => fn ($q) => $q->when($isAgent, fn ($q) => $q->where('agent_id', $agentId))])
            ->having('demandes_count', '>', 0)
            ->orderByDesc('demandes_count')
            ->get()
            ->map(fn ($t) => [
                'label' => $t->nom,
                'value' => $t->demandes_count,
                'color' => self::COULEURS_TYPE[$t->code] ?? '#d1d5db',
            ]);

        // --- Répartition par genre (nombre de demandes, déduit du CIN du citoyen — cf. Citoyen::sexe) ---
        $demandesHommes = $base()->whereHas('citoyen', fn ($q) => $q->where('cin', 'like', '1%'))->count();
        $demandesFemmes = $base()->whereHas('citoyen', fn ($q) => $q->where('cin', 'like', '2%'))->count();

        // --- Dernières demandes ---
        $dernieres = $base()->with(['citoyen', 'typeAide'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($d) => [
                'id'        => $d->id,
                'reference' => $d->reference ?? '—',
                'citoyen'   => $d->citoyen ? "{$d->citoyen->prenom} {$d->citoyen->nom}" : '—',
                'type'      => $d->typeAide?->nom ?? '—',
                'statut'    => $d->statut->value,
                'date'      => $d->created_at->format('d/m/Y'),
            ]);

        // --- Activité récente ---
        $activite = $base()->with(['citoyen', 'agent', 'comiteUser'])
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($d) => match ($d->statut) {
                StatutDemande::APPROUVE => [
                    'id'          => $d->id,
                    'icon'        => 'check',
                    'titre'       => 'Demande approuvée',
                    'description' => "{$d->reference} par le comité",
                    'temps'       => $d->date_deliberation?->diffForHumans() ?? '',
                ],
                StatutDemande::REJETE => [
                    'id'          => $d->id,
                    'icon'        => 'x',
                    'titre'       => 'Demande rejetée',
                    'description' => "{$d->reference} par le comité",
                    'temps'       => $d->date_deliberation?->diffForHumans() ?? '',
                ],
                StatutDemande::SOUMIS => [
                    'id'          => $d->id,
                    'icon'        => 'user',
                    'titre'       => 'Demande soumise',
                    'description' => "{$d->reference} par {$d->agent?->name}",
                    'temps'       => $d->date_soumission?->diffForHumans() ?? '',
                ],
                default => [
                    'id'          => $d->id,
                    'icon'        => 'file',
                    'titre'       => 'Nouvelle demande enregistrée',
                    'description' => "{$d->reference} — {$d->citoyen?->prenom} {$d->citoyen?->nom}",
                    'temps'       => $d->created_at->diffForHumans(),
                ],
            });

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'total'            => $total,
                'total_trend'      => $this->trend($totalMois, $totalPrecMois),
                'en_attente'       => $enAttente,
                'en_attente_trend' => 0,
                'approuvees'       => $approuvees,
                'approuvees_trend' => 0,
                'rejetees'         => $rejetees,
                'rejetees_trend'   => 0,
                'cloturees'        => $cloturees,
                'cloturees_trend'  => 0,
            ],
            'evolutionData' => [
                'labels' => $evolution->pluck('label')->toArray(),
                'values' => $evolution->pluck('value')->toArray(),
            ],
            'repartitionData'   => $repartition,
            'genreData'         => [
                ['label' => 'Hommes', 'value' => $demandesHommes, 'color' => '#3b82f6'],
                ['label' => 'Femmes', 'value' => $demandesFemmes, 'color' => '#F5A623'],
            ],
            'dernieresDemandes' => $dernieres,
            'activiteRecente'   => $activite,
        ]);
    }

    private function trend(int $current, int $previous): float
    {
        if ($previous === 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
