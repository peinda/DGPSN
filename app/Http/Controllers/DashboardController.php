<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
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

        // --- KPI totaux ---
        $total      = Demande::count();
        $enAttente  = Demande::whereIn('statut', [StatutDemande::SOUMIS->value, StatutDemande::EN_EXAMEN->value])->count();
        $approuvees = Demande::where('statut', StatutDemande::APPROUVE->value)->count();
        $rejetees   = Demande::where('statut', StatutDemande::REJETE->value)->count();
        $cloturees  = Demande::where('statut', StatutDemande::CLOTURE->value)->count();

        // --- Trends (vs mois précédent) ---
        $totalMois    = Demande::where('created_at', '>=', $debutMois)->count();
        $totalPrecMois= Demande::whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])->count();

        // --- Évolution 6 derniers mois ---
        $evolution = collect(range(5, 0))->map(function ($i) use ($now) {
            $mois = $now->copy()->subMonths($i);
            return [
                'label' => ucfirst($mois->locale('fr')->isoFormat('MMM')),
                'value' => Demande::whereYear('created_at', $mois->year)
                    ->whereMonth('created_at', $mois->month)
                    ->count(),
            ];
        });

        // --- Répartition par type d'aide ---
        $repartition = TypeAide::withCount('demandes')
            ->having('demandes_count', '>', 0)
            ->orderByDesc('demandes_count')
            ->get()
            ->map(fn ($t) => [
                'label' => $t->nom,
                'value' => $t->demandes_count,
                'color' => self::COULEURS_TYPE[$t->code] ?? '#d1d5db',
            ]);

        // --- Dernières demandes ---
        $dernieres = Demande::with(['citoyen', 'typeAide'])
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
        $activite = Demande::with(['citoyen', 'agent', 'comiteUser'])
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
