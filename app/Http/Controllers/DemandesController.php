<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Demande;
use App\Models\Evenement;
use App\Models\PeriodeOuverture;
use App\Models\Prestataire;
use App\Models\TypeAide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class DemandesController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Demande::with(['citoyen', 'typeAide', 'evenement', 'anneeGestion', 'agent'])
            ->latest();

        if ($search = $request->get('search')) {
            $query->where(fn ($q) => $q
                ->where('reference', 'like', "%{$search}%")
                ->orWhereHas('citoyen', fn ($c) => $c
                    ->where('nom',   'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('cin',    'like', "%{$search}%")
                )
            );
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->get('statut'));
        }

        if ($request->filled('type_aide_id')) {
            $query->where('type_aide_id', $request->get('type_aide_id'));
        }

        if ($request->filled('annee_gestion_id')) {
            $query->where('annee_gestion_id', $request->get('annee_gestion_id'));
        }

        // L'agent ne voit que ses propres demandes (sauf admin)
        if (Auth::user()->hasRole('agent')) {
            $query->where('agent_id', Auth::id());
        }

        return inertia('Demandes/Index', [
            'demandes'   => $query->paginate(20)->withQueryString(),
            'typesAide'  => TypeAide::actif()->orderBy('nom')->get(['id', 'nom']),
            'annees'     => AnneeGestion::orderBy('annee', 'desc')->get(['id', 'annee']),
            'statuts'    => collect(StatutDemande::cases())->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()]),
            'filters'    => $request->only(['search', 'statut', 'type_aide_id', 'annee_gestion_id']),
        ]);
    }

    public function create(): Response
    {
        return inertia('Demandes/Create', [
            'typesAide'   => TypeAide::actif()->with('evenements')->orderBy('nom')->get(),
            'periodes'    => PeriodeOuverture::active()->with(['evenement', 'anneeGestion'])->get(),
            'prestataires'=> Prestataire::actif()->with(['commune', 'departement'])->orderBy('nom')->get(),
            'annees'      => AnneeGestion::ouverte()->orderBy('annee', 'desc')->get(),
            'regions'     => \App\Models\Region::with('departements.communes')->orderBy('nom')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            // Citoyen
            'citoyen_id'          => 'nullable|exists:citoyens,id',
            'cin'                 => ['required_without:citoyen_id', 'string', 'min:12', 'max:14', 'regex:/^[12]/'],
            'nom'                 => ['required_without:citoyen_id', 'string', 'max:255', 'regex:/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-\']*$/'],
            'prenom'              => ['required_without:citoyen_id', 'string', 'max:255', 'regex:/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/'],
            'telephone'           => ['nullable', 'string', 'regex:/^\+221(70|71|75|76|77|78)[0-9]{7}$/'],
            'adresse'             => 'nullable|string|max:500',
            'commune_id'          => 'nullable|exists:communes,id',
            // Demande
            'type_aide_id'        => 'required|exists:types_aide,id',
            'evenement_id'        => 'nullable|exists:evenements,id',
            'annee_gestion_id'    => 'required|exists:annees_gestion,id',
            'periode_ouverture_id'=> 'nullable|exists:periodes_ouverture,id',
            // Prestataires
            'prestataires'        => 'nullable|array',
            'prestataires.*.id'   => 'required|exists:prestataires,id',
            'prestataires.*.montant_estime' => 'required|numeric|min:0',
            // Pièces jointes
            'pieces_jointes'        => 'nullable|array',
            'pieces_jointes.*'      => 'file|mimes:pdf,jpg,jpeg,png|max:102400',
        ], [
            'cin.min'                => 'Le CIN doit comporter au moins 12 caractères.',
            'cin.max'                => 'Le CIN ne peut pas dépasser 14 caractères.',
            'cin.regex'              => 'Le CIN doit commencer par 1 ou 2.',
            'telephone.regex'        => 'Format attendu : +221 suivi de 70, 71, 75, 76, 77 ou 78 et 7 chiffres.',
            'nom.regex'              => 'Le nom doit être entièrement en majuscules.',
            'prenom.regex'           => 'Le prénom doit commencer par une majuscule.',
            'pieces_jointes.*.mimes' => 'Formats acceptés : PDF, JPG, PNG.',
            'pieces_jointes.*.max'   => 'Taille maximale par fichier : 100 Mo.',
        ]);

        return DB::transaction(function () use ($data, $request) {
            // Résoudre ou créer le citoyen
            $citoyen = isset($data['citoyen_id']) && $data['citoyen_id']
                ? Citoyen::findOrFail($data['citoyen_id'])
                : Citoyen::firstOrCreate(
                    ['cin' => $data['cin']],
                    [
                        'nom'        => $data['nom'],
                        'prenom'     => $data['prenom'],
                        'telephone'  => $data['telephone']  ?? null,
                        'adresse'    => $data['adresse']    ?? null,
                        'commune_id' => $data['commune_id'] ?? null,
                    ]
                );

            // Règle 1 — Quota
            if (Demande::quotaAtteint($citoyen->id, $data['type_aide_id'], $data['annee_gestion_id'])) {
                return back()->withErrors([
                    'type_aide_id' => "Ce citoyen a déjà atteint le quota de 2 demandes pour ce type d'aide cette année.",
                ]);
            }

            // Règle 2 — Période ouverte (uniquement pour les types qui l'exigent)
            $typeAide = TypeAide::find($data['type_aide_id']);
            if ($typeAide?->requiert_periode && isset($data['evenement_id']) && $data['evenement_id']) {
                $periodeActive = PeriodeOuverture::where('evenement_id', $data['evenement_id'])
                    ->where('annee_gestion_id', $data['annee_gestion_id'])
                    ->active()
                    ->exists();

                if (! $periodeActive) {
                    return back()->withErrors([
                        'evenement_id' => "Aucune période d'ouverture active pour cet événement.",
                    ]);
                }
            }

            // Créer la demande
            $demande = Demande::create([
                'citoyen_id'          => $citoyen->id,
                'type_aide_id'        => $data['type_aide_id'],
                'evenement_id'        => $data['evenement_id'] ?? null,
                'annee_gestion_id'    => $data['annee_gestion_id'],
                'periode_ouverture_id'=> $data['periode_ouverture_id'] ?? null,
                'agent_id'            => Auth::id(),
                'statut'              => StatutDemande::BROUILLON,
            ]);

            // Attacher les prestataires
            if (! empty($data['prestataires'])) {
                $montantTotal = 0;
                foreach ($data['prestataires'] as $p) {
                    $demande->prestataires()->attach($p['id'], [
                        'montant_estime' => $p['montant_estime'],
                    ]);
                    $montantTotal += $p['montant_estime'];
                }
                $demande->update(['montant_total' => $montantTotal]);
            }

            // Stocker les pièces jointes
            if ($request->hasFile('pieces_jointes')) {
                foreach ($request->file('pieces_jointes') as $file) {
                    $path = $file->store("pieces-jointes/{$demande->id}", 'public');
                    $demande->piecesJointes()->create([
                        'nom_original' => $file->getClientOriginalName(),
                        'chemin'       => $path,
                        'type_mime'    => $file->getMimeType(),
                        'taille'       => $file->getSize(),
                    ]);
                }
            }

            // Soumettre immédiatement si demandé depuis le formulaire de création
            if ($request->boolean('_soumettre_apres') && $demande->piecesJointes()->count() > 0) {
                $demande->load('typeAide', 'periodeOuverture');

                if ($demande->typeAide?->requiert_periode && ! $demande->periodeOuverture?->estActive()) {
                    return redirect()->route('demandes.show', $demande)
                        ->with('error', "Demande {$demande->reference} créée en brouillon — la période d'ouverture est clôturée, impossible de la soumettre.");
                }

                $demande->soumettre();
                return redirect()->route('demandes.show', $demande)
                    ->with('success', "Demande {$demande->reference} créée et soumise au comité.");
            }

            return redirect()->route('demandes.show', $demande)
                ->with('success', "Demande {$demande->reference} créée avec succès.");
        });
    }

    public function show(Demande $demande): Response
    {
        $demande->load([
            'citoyen.commune.departement.region',
            'typeAide',
            'evenement',
            'anneeGestion',
            'periodeOuverture',
            'agent',
            'comiteUser',
            'prestataires',
            'piecesJointes',
            'citoyen.demandes.typeAide',
            'citoyen.demandes.anneeGestion',
        ]);

        return inertia('Demandes/Show', [
            'demande' => $demande,
        ]);
    }

    public function destroy(Demande $demande): RedirectResponse
    {
        if ($demande->statut !== StatutDemande::BROUILLON) {
            return back()->with('error', 'Seules les demandes en brouillon peuvent être supprimées.');
        }

        $demande->delete();

        return redirect()->route('demandes.index')->with('success', 'Demande supprimée.');
    }

    public function soumettre(Demande $demande): RedirectResponse
    {
        if ($demande->statut !== StatutDemande::BROUILLON) {
            return back()->with('error', 'Cette demande ne peut pas être soumise.');
        }

        if ($demande->piecesJointes()->count() === 0) {
            return back()->with('error', 'Vous devez joindre au moins une pièce justificative.');
        }

        $demande->load('typeAide', 'periodeOuverture');

        if ($demande->typeAide?->requiert_periode) {
            if (! $demande->periodeOuverture?->estActive()) {
                return back()->with('error',
                    "La période d'ouverture pour cet événement est clôturée. La demande « {$demande->reference} » ne peut plus être soumise."
                );
            }
        }

        $demande->soumettre();

        return back()->with('success', "Demande {$demande->reference} soumise au comité.");
    }

    public function edit(Demande $demande): Response
    {
        if ($demande->statut !== StatutDemande::BROUILLON) {
            return redirect()->route('demandes.show', $demande)
                ->with('error', 'Seules les demandes en brouillon peuvent être modifiées.');
        }

        $demande->load(['citoyen.commune', 'prestataires', 'typeAide', 'evenement', 'anneeGestion']);

        return inertia('Demandes/Edit', [
            'demande'     => $demande,
            'typesAide'   => TypeAide::actif()->with('evenements')->orderBy('nom')->get(),
            'periodes'    => PeriodeOuverture::active()->with(['evenement', 'anneeGestion'])->get(),
            'prestataires'=> Prestataire::actif()->with(['commune', 'departement'])->orderBy('nom')->get(),
            'annees'      => AnneeGestion::ouverte()->orderBy('annee', 'desc')->get(),
        ]);
    }

    public function update(Request $request, Demande $demande): RedirectResponse
    {
        if ($demande->statut !== StatutDemande::BROUILLON) {
            return back()->with('error', 'Seules les demandes en brouillon peuvent être modifiées.');
        }

        $data = $request->validate([
            'type_aide_id'         => 'required|exists:types_aide,id',
            'evenement_id'         => 'nullable|exists:evenements,id',
            'annee_gestion_id'     => 'required|exists:annees_gestion,id',
            'periode_ouverture_id' => 'nullable|exists:periodes_ouverture,id',
            'prestataires'         => 'nullable|array',
            'prestataires.*.id'    => 'required|exists:prestataires,id',
            'prestataires.*.montant_estime' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $demande) {
            $demande->update([
                'type_aide_id'         => $data['type_aide_id'],
                'evenement_id'         => $data['evenement_id']         ?? null,
                'annee_gestion_id'     => $data['annee_gestion_id'],
                'periode_ouverture_id' => $data['periode_ouverture_id'] ?? null,
            ]);

            // Sync prestataires
            $sync = [];
            $montantTotal = 0;
            foreach ($data['prestataires'] ?? [] as $p) {
                $sync[$p['id']] = ['montant_estime' => $p['montant_estime']];
                $montantTotal += $p['montant_estime'];
            }
            $demande->prestataires()->sync($sync);
            $demande->update(['montant_total' => $montantTotal ?: null]);
        });

        return redirect()->route('demandes.show', $demande)
            ->with('success', 'Demande mise à jour.');
    }

    public function confirmerPrestataire(Demande $demande, Prestataire $prestataire): RedirectResponse
    {
        if ($demande->statut !== StatutDemande::APPROUVE) {
            return back()->with('error', 'La demande doit être approuvée pour confirmer une prestation.');
        }

        $demande->prestataires()->updateExistingPivot($prestataire->id, [
            'confirme'          => true,
            'date_confirmation' => now(),
        ]);

        // Clôturer si tous les prestataires ont confirmé
        $tousConfirmes = $demande->prestataires()->wherePivot('confirme', false)->doesntExist();
        if ($tousConfirmes) {
            $demande->cloturer();
        }

        return back()->with('success', 'Prestation confirmée' . ($tousConfirmes ? ' — demande clôturée automatiquement.' : '.'));
    }

    public function cloturer(Demande $demande): RedirectResponse
    {
        if ($demande->statut !== StatutDemande::APPROUVE) {
            return back()->with('error', 'Seules les demandes approuvées peuvent être clôturées.');
        }

        $demande->cloturer();

        return back()->with('success', "Demande {$demande->reference} clôturée.");
    }

    public function checkEligibilite(Request $request): JsonResponse
    {
        $citoyenId  = $request->get('citoyen_id');
        $typeAideId = $request->get('type_aide_id');
        $evenementId= $request->get('evenement_id');
        $anneeId    = $request->get('annee_gestion_id');

        $quotaAtteint = $citoyenId && $typeAideId && $anneeId
            ? Demande::quotaAtteint($citoyenId, $typeAideId, $anneeId)
            : false;

        $typeAide      = $typeAideId ? TypeAide::find($typeAideId) : null;
        $requiertPeriode = $typeAide?->requiert_periode ?? false;

        $periodeActive = false;
        if ($requiertPeriode && $evenementId && $anneeId) {
            $periodeActive = PeriodeOuverture::where('evenement_id', $evenementId)
                ->where('annee_gestion_id', $anneeId)
                ->active()
                ->exists();
        }

        return response()->json([
            'quota_atteint'    => $quotaAtteint,
            'periode_active'   => $periodeActive,
            'requiert_periode' => $requiertPeriode,
        ]);
    }
}
