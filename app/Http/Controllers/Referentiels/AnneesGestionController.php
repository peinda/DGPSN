<?php

namespace App\Http\Controllers\Referentiels;

use App\Enums\StatutAnnee;
use App\Http\Controllers\Controller;
use App\Models\AnneeGestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AnneesGestionController extends Controller
{
    public function index(): Response
    {
        return inertia('Referentiels/Annees/Index', [
            'annees' => AnneeGestion::withCount('demandes')
                ->orderBy('annee', 'desc')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'annee'          => 'required|integer|digits:4|unique:annees_gestion,annee',
            'date_ouverture' => 'nullable|date',
        ], [
            'annee.unique' => 'Une année de gestion pour cette année existe déjà.',
        ]);

        AnneeGestion::create([
            ...$data,
            'statut'         => StatutAnnee::OUVERT,
            'date_ouverture' => $data['date_ouverture'] ?? now(),
        ]);

        return back()->with('success', "Année de gestion {$data['annee']} créée.");
    }

    public function update(Request $request, AnneeGestion $anneeGestion): RedirectResponse
    {
        $data = $request->validate([
            'date_ouverture' => 'nullable|date',
            'date_cloture'   => 'nullable|date|after_or_equal:date_ouverture',
        ]);

        $anneeGestion->update($data);

        return back()->with('success', 'Année de gestion mise à jour.');
    }

    public function cloturer(AnneeGestion $anneeGestion): RedirectResponse
    {
        if ($anneeGestion->statut !== StatutAnnee::OUVERT) {
            return back()->with('error', "Cette année n'est pas ouverte.");
        }

        $anneeGestion->update([
            'statut'       => StatutAnnee::CLOTURE,
            'date_cloture' => now(),
        ]);

        return back()->with('success', "Année {$anneeGestion->annee} clôturée.");
    }

    public function archiver(AnneeGestion $anneeGestion): RedirectResponse
    {
        if ($anneeGestion->statut !== StatutAnnee::CLOTURE) {
            return back()->with('error', "Cette année doit être clôturée avant d'être archivée.");
        }

        $anneeGestion->update(['statut' => StatutAnnee::ARCHIVE]);

        return back()->with('success', "Année {$anneeGestion->annee} archivée.");
    }
}
