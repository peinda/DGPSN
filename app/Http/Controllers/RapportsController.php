<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Exports\DemandesExport;
use App\Models\AnneeGestion;
use App\Models\Demande;
use App\Models\Region;
use App\Models\TypeAide;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RapportsController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $anneeId   = $request->get('annee_gestion_id');
        $typeId    = $request->get('type_aide_id');

        $query = Demande::query();
        if ($anneeId) $query->where('annee_gestion_id', $anneeId);
        if ($typeId)  $query->where('type_aide_id', $typeId);

        // Stats par statut
        $parStatut = collect(StatutDemande::cases())->map(fn ($s) => [
            'statut' => $s->value,
            'label'  => $s->label(),
            'count'  => (clone $query)->where('statut', $s->value)->count(),
            'couleur'=> $s->couleur(),
        ]);

        // Stats par type d'aide
        $parType = TypeAide::withCount(['demandes' => function ($q) use ($anneeId) {
            if ($anneeId) $q->where('annee_gestion_id', $anneeId);
        }])->orderByDesc('demandes_count')->get()->map(fn ($t) => [
            'nom'   => $t->nom,
            'total' => $t->demandes_count,
            'approuvees' => $t->demandes()->where('statut', StatutDemande::APPROUVE->value)
                ->when($anneeId, fn ($q) => $q->where('annee_gestion_id', $anneeId))
                ->count(),
        ]);

        // Stats par région
        $parRegion = Region::with(['departements.communes.citoyens.demandes' => function ($q) use ($anneeId, $typeId) {
            if ($anneeId) $q->where('annee_gestion_id', $anneeId);
            if ($typeId)  $q->where('type_aide_id', $typeId);
        }])->get()->map(fn ($r) => [
            'nom'   => $r->nom,
            'total' => Demande::whereHas('citoyen.commune.departement', fn ($q) => $q->where('region_id', $r->id))
                ->when($anneeId, fn ($q) => $q->where('annee_gestion_id', $anneeId))
                ->when($typeId, fn ($q) => $q->where('type_aide_id', $typeId))
                ->count(),
        ])->filter(fn ($r) => $r['total'] > 0)->sortByDesc('total')->values();

        // Évolution mensuelle (12 mois)
        $evolution = collect(range(11, 0))->map(function ($i) use ($query) {
            $mois = now()->subMonths($i);
            return [
                'label' => $mois->locale('fr')->isoFormat('MMM YY'),
                'total' => (clone $query)->whereYear('created_at', $mois->year)->whereMonth('created_at', $mois->month)->count(),
                'approuvees' => (clone $query)->where('statut', StatutDemande::APPROUVE->value)->whereYear('created_at', $mois->year)->whereMonth('created_at', $mois->month)->count(),
            ];
        });

        return inertia('Rapports/Index', [
            'parStatut'   => $parStatut,
            'parType'     => $parType,
            'parRegion'   => $parRegion,
            'evolution'   => $evolution,
            'annees'      => AnneeGestion::orderByDesc('annee')->get(['id', 'annee', 'statut']),
            'typesAide'   => TypeAide::orderBy('nom')->get(['id', 'nom']),
            'totalGeneral'=> $query->count(),
            'filters'     => $request->only(['annee_gestion_id', 'type_aide_id']),
        ]);
    }

    public function exports(Request $request): InertiaResponse
    {
        return inertia('Rapports/Exports', [
            'annees'    => AnneeGestion::orderByDesc('annee')->get(['id', 'annee']),
            'typesAide' => TypeAide::orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        return (new DemandesExport(
            anneeGestionId: $request->get('annee_gestion_id') ?: null,
            typeAideId:     $request->get('type_aide_id')     ?: null,
            statut:         $request->get('statut')           ?: null,
        ))->download();
    }

    public function exportCsv(Request $request): Response
    {
        $anneeId = $request->get('annee_gestion_id');
        $typeId  = $request->get('type_aide_id');
        $statut  = $request->get('statut');

        $demandes = Demande::with(['citoyen.commune', 'typeAide', 'evenement', 'anneeGestion', 'agent'])
            ->when($anneeId, fn ($q) => $q->where('annee_gestion_id', $anneeId))
            ->when($typeId,  fn ($q) => $q->where('type_aide_id', $typeId))
            ->when($statut,  fn ($q) => $q->where('statut', $statut))
            ->orderBy('created_at')
            ->get();

        $csv = "\xEF\xBB\xBF"; // BOM UTF-8 pour Excel
        $csv .= implode(';', ['Référence', 'Date', 'CIN', 'Nom', 'Prénom', 'Téléphone', 'Localité', "Type d'aide", 'Événement', 'Statut', 'Montant total', 'Agent']) . "\n";

        foreach ($demandes as $d) {
            $csv .= implode(';', [
                $d->reference ?? '',
                $d->created_at->format('d/m/Y'),
                $d->citoyen?->cin ?? '',
                $d->citoyen?->nom ?? '',
                $d->citoyen?->prenom ?? '',
                $d->citoyen?->telephone ?? '',
                $d->citoyen?->commune?->nom ?? '',
                $d->typeAide?->nom ?? '',
                $d->evenement?->nom ?? '',
                $d->statut->label(),
                number_format($d->montant_total ?? 0, 0, ',', ' '),
                $d->agent?->name ?? '',
            ]) . "\n";
        }

        $annee    = $anneeId ? AnneeGestion::find($anneeId)?->annee : 'toutes';
        $filename = "export-demandes-{$annee}-" . now()->format('Ymd') . '.csv';

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
