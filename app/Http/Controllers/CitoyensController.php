<?php

namespace App\Http\Controllers;

use App\Models\Citoyen;
use App\Models\Commune;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class CitoyensController extends Controller
{
    public function index(Request $request): Response
    {
        $isAgent = Auth::user()->hasRole('agent');
        $agentId = Auth::id();

        // L'agent ne voit que le nombre de demandes qu'il a lui-même saisies pour chaque citoyen
        $query = Citoyen::withCount(['demandes' => fn ($q) => $q->when($isAgent, fn ($q) => $q->where('agent_id', $agentId))])
            ->with('commune.departement.region')
            ->orderBy('nom');

        if ($search = $request->get('search')) {
            $query->where(fn ($q) => $q
                ->where('cin',    'like', "%{$search}%")
                ->orWhere('nom',  'like', "%{$search}%")
                ->orWhere('prenom', 'like', "%{$search}%")
            );
        }

        return inertia('Citoyens/Index', [
            'citoyens' => $query->paginate(20)->withQueryString(),
            'filters'  => $request->only('search'),
        ]);
    }

    public function show(Citoyen $citoyen): Response
    {
        $isAgent = Auth::user()->hasRole('agent');
        $agentId = Auth::id();

        $citoyen->load([
            'commune.departement.region',
            'demandes' => fn ($q) => $q->when($isAgent, fn ($q) => $q->where('agent_id', $agentId)),
            'demandes.typeAide',
            'demandes.evenement',
            'demandes.anneeGestion',
            'demandes.agent',
        ]);

        return inertia('Citoyens/Show', [
            'citoyen' => $citoyen,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $cin = $request->get('cin', '');

        if (strlen($cin) < 3) {
            return response()->json(null);
        }

        $citoyen = Citoyen::where('cin', $cin)
            ->with('commune.departement.region')
            ->first();

        return response()->json($citoyen);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'cin'        => ['required', 'string', 'min:12', 'max:14', 'regex:/^[12]/', 'unique:citoyens,cin'],
            'nom'        => ['required', 'string', 'max:255', 'regex:/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-\']*$/'],
            'prenom'     => ['required', 'string', 'max:255', 'regex:/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/'],
            'telephone'  => 'nullable|string|max:20',
            'adresse'    => 'nullable|string|max:500',
            'commune_id' => 'nullable|exists:communes,id',
        ], [
            'cin.min'          => 'Le CIN doit comporter au moins 12 caractères.',
            'cin.max'          => 'Le CIN ne peut pas dépasser 14 caractères.',
            'cin.regex'        => 'Le CIN doit commencer par 1 ou 2.',
            'cin.unique'       => 'Ce numéro CIN est déjà enregistré.',
            'nom.regex'        => 'Le nom doit être entièrement en majuscules.',
            'prenom.regex'     => 'Le prénom doit commencer par une majuscule.',
        ]);

        $citoyen = Citoyen::create($data);

        return redirect()->route('citoyens.show', $citoyen)->with('success', 'Fiche citoyen créée.');
    }

    public function update(Request $request, Citoyen $citoyen): RedirectResponse
    {
        $data = $request->validate([
            'nom'        => ['required', 'string', 'max:255', 'regex:/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-\']*$/'],
            'prenom'     => ['required', 'string', 'max:255', 'regex:/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/'],
            'telephone'  => 'nullable|string|max:20',
            'adresse'    => 'nullable|string|max:500',
            'commune_id' => 'nullable|exists:communes,id',
        ], [
            'nom.regex'    => 'Le nom doit être entièrement en majuscules.',
            'prenom.regex' => 'Le prénom doit commencer par une majuscule.',
        ]);

        $citoyen->update($data);

        return back()->with('success', 'Fiche citoyen mise à jour.');
    }
}
