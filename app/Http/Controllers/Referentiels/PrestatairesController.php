<?php

namespace App\Http\Controllers\Referentiels;

use App\Http\Controllers\Controller;
use App\Models\Prestataire;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PrestatairesController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Prestataire::with(['region', 'departement', 'commune'])
            ->orderBy('nom');

        if ($search = $request->get('search')) {
            $query->where(fn ($q) => $q
                ->where('nom', 'like', "%{$search}%")
                ->orWhere('telephone', 'like', "%{$search}%")
            );
        }

        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->filled('actif')) {
            $query->where('actif', $request->boolean('actif'));
        }

        return inertia('Referentiels/Prestataires/Index', [
            'prestataires' => $query->paginate(20)->withQueryString(),
            'regions'      => Region::with('departements.communes')->orderBy('nom')->get(),
            'filters'      => $request->only(['search', 'type', 'actif']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nom'            => 'required|string|max:255',
            'type'           => 'required|in:hopital,pharmacie,clinique,autre',
            'adresse'        => 'nullable|string|max:500',
            'telephone'      => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'region_id'      => 'nullable|exists:regions,id',
            'departement_id' => 'nullable|exists:departements,id',
            'commune_id'     => 'nullable|exists:communes,id',
            'actif'          => 'boolean',
        ]);

        Prestataire::create($data);

        return back()->with('success', 'Prestataire ajouté avec succès.');
    }

    public function update(Request $request, Prestataire $prestataire): RedirectResponse
    {
        $data = $request->validate([
            'nom'            => 'required|string|max:255',
            'type'           => 'required|in:hopital,pharmacie,clinique,autre',
            'adresse'        => 'nullable|string|max:500',
            'telephone'      => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'region_id'      => 'nullable|exists:regions,id',
            'departement_id' => 'nullable|exists:departements,id',
            'commune_id'     => 'nullable|exists:communes,id',
            'actif'          => 'boolean',
        ]);

        $prestataire->update($data);

        return back()->with('success', 'Prestataire mis à jour.');
    }

    public function destroy(Prestataire $prestataire): RedirectResponse
    {
        if ($prestataire->demandes()->exists()) {
            return back()->with('error', 'Ce prestataire est lié à des demandes et ne peut pas être supprimé.');
        }

        $prestataire->delete();

        return back()->with('success', 'Prestataire supprimé.');
    }

    public function toggle(Prestataire $prestataire): RedirectResponse
    {
        $prestataire->update(['actif' => ! $prestataire->actif]);

        $label = $prestataire->actif ? 'activé' : 'désactivé';

        return back()->with('success', "Prestataire {$label}.");
    }
}
