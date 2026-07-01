<?php

namespace App\Http\Controllers\Referentiels;

use App\Http\Controllers\Controller;
use App\Models\AnneeGestion;
use App\Models\Evenement;
use App\Models\PeriodeOuverture;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

class PeriodesOuvertureController extends Controller
{
    public function index(): Response
    {
        return inertia('Referentiels/Periodes/Index', [
            'periodes'  => PeriodeOuverture::with(['evenement.typeAide', 'anneeGestion'])
                ->orderBy('date_debut', 'desc')
                ->get(),
            'evenements' => Evenement::with('typeAide')
                ->actif()
                ->whereHas('typeAide', fn ($q) => $q->where('requiert_periode', true))
                ->orderBy('nom')
                ->get(),
            'annees'     => AnneeGestion::orderBy('annee', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'evenement_id'     => 'required|exists:evenements,id',
            'annee_gestion_id' => ['required', 'exists:annees_gestion,id',
                Rule::unique('periodes_ouverture')->where(fn ($q) =>
                    $q->where('evenement_id', $request->evenement_id)
                ),
            ],
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after:date_debut',
            'actif'      => 'boolean',
        ], [
            'annee_gestion_id.unique' => 'Une période pour cet événement et cette année existe déjà.',
            'date_fin.after'          => 'La date de fin doit être postérieure à la date de début.',
        ]);

        $evenement = Evenement::with('typeAide')->find($data['evenement_id']);
        if (! $evenement?->typeAide?->requiert_periode) {
            return back()->withErrors([
                'evenement_id' => "Ce type d'aide est disponible à tout moment et ne nécessite pas de période d'ouverture.",
            ]);
        }

        PeriodeOuverture::create($data);

        return back()->with('success', "Période d'ouverture créée.");
    }

    public function update(Request $request, PeriodeOuverture $periode): RedirectResponse
    {
        $data = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after:date_debut',
            'actif'      => 'boolean',
        ], [
            'date_fin.after' => 'La date de fin doit être postérieure à la date de début.',
        ]);

        $periode->update($data);

        return back()->with('success', "Période d'ouverture mise à jour.");
    }

    public function destroy(PeriodeOuverture $periode): RedirectResponse
    {
        $periode->delete();

        return back()->with('success', "Période d'ouverture supprimée.");
    }
}
