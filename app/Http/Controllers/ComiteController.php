<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Notifications\DemandeDelibereeNotification;
use App\Services\AuditService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Response as InertiaResponse;

class ComiteController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $enAttente = Demande::with(['citoyen', 'typeAide', 'evenement', 'anneeGestion', 'agent'])
            ->whereIn('statut', [StatutDemande::SOUMIS->value, StatutDemande::EN_EXAMEN->value])
            ->orderBy('date_soumission')
            ->get();

        $traitees = Demande::with(['citoyen', 'typeAide', 'comiteUser'])
            ->whereIn('statut', [StatutDemande::APPROUVE->value, StatutDemande::REJETE->value])
            ->orderByDesc('date_deliberation')
            ->limit(20)
            ->get();

        return inertia('Comite/Index', [
            'enAttente' => $enAttente,
            'traitees'  => $traitees,
        ]);
    }

    public function show(Demande $demande): InertiaResponse
    {
        $demande->load([
            'citoyen.commune.departement.region',
            'typeAide',
            'evenement',
            'anneeGestion',
            'agent',
            'comiteUser',
            'prestataires',
            'piecesJointes',
            'citoyen.demandes.typeAide',
            'citoyen.demandes.anneeGestion',
        ]);

        return inertia('Comite/Show', [
            'demande' => $demande,
        ]);
    }

    public function prendreEnExamen(Demande $demande): RedirectResponse
    {
        if ($demande->statut !== StatutDemande::SOUMIS) {
            return back()->with('error', 'Cette demande ne peut pas être mise en examen.');
        }

        $demande->prendreEnExamen(Auth::user());

        return redirect()->route('comite.show', $demande)
            ->with('success', "Demande {$demande->reference} prise en examen.");
    }

    public function approuver(Request $request, Demande $demande): RedirectResponse
    {
        if (! in_array($demande->statut->value, [StatutDemande::SOUMIS->value, StatutDemande::EN_EXAMEN->value])) {
            return back()->with('error', 'Cette demande ne peut pas être approuvée.');
        }

        $request->validate([
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $demande->approuver(Auth::user(), $request->get('commentaire'));

        AuditService::demande('demande.approuvee', $demande, "Demande {$demande->reference} approuvée par " . Auth::user()->name);

        // Notification à l'agent
        $demande->agent?->notify(new DemandeDelibereeNotification($demande));

        return redirect()->route('comite.show', $demande)
            ->with('success', "Demande {$demande->reference} approuvée. Le bon PDF est disponible.");
    }

    public function rejeter(Request $request, Demande $demande): RedirectResponse
    {
        if (! in_array($demande->statut->value, [StatutDemande::SOUMIS->value, StatutDemande::EN_EXAMEN->value])) {
            return back()->with('error', 'Cette demande ne peut pas être rejetée.');
        }

        $request->validate([
            'commentaire' => 'required|string|min:10|max:1000',
        ], [
            'commentaire.required' => 'Un motif de rejet est obligatoire.',
            'commentaire.min'      => 'Le motif doit contenir au moins 10 caractères.',
        ]);

        $demande->rejeter(Auth::user(), $request->get('commentaire'));

        AuditService::demande('demande.rejetee', $demande, "Demande {$demande->reference} rejetée par " . Auth::user()->name);

        // Notification à l'agent
        $demande->agent?->notify(new DemandeDelibereeNotification($demande));

        return redirect()->route('comite.show', $demande)
            ->with('success', "Demande {$demande->reference} rejetée.");
    }

    public function genererBon(Demande $demande): Response|\Symfony\Component\HttpFoundation\Response
    {
        if ($demande->statut !== StatutDemande::APPROUVE) {
            abort(403, 'Le bon ne peut être généré que pour une demande approuvée.');
        }

        $demande->load(['citoyen.commune.departement.region', 'typeAide', 'evenement', 'anneeGestion', 'prestataires', 'comiteUser', 'agent']);

        $pdf = Pdf::loadView('pdf.bon-prise-en-charge', ['demande' => $demande])
            ->setPaper('a4', 'portrait');

        $filename = "bon-{$demande->reference}.pdf";

        return $pdf->download($filename);
    }
}
