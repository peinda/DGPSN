<?php

namespace App\Http\Controllers\Referentiels;

use App\Http\Controllers\Controller;
use App\Models\TypeAide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

class TypesAideController extends Controller
{
    public function index(): Response
    {
        return inertia('Referentiels/TypesAide/Index', [
            'typesAide' => TypeAide::withCount('demandes')->orderBy('nom')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:255',
            'code'        => 'required|string|max:30|unique:types_aide,code',
            'description' => 'nullable|string|max:1000',
            'actif'       => 'boolean',
        ]);

        TypeAide::create($data);

        return back()->with('success', "Type d'aide créé avec succès.");
    }

    public function update(Request $request, TypeAide $typeAide): RedirectResponse
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:255',
            'code'        => ['required', 'string', 'max:30', Rule::unique('types_aide', 'code')->ignore($typeAide)],
            'description' => 'nullable|string|max:1000',
            'actif'       => 'boolean',
        ]);

        $typeAide->update($data);

        return back()->with('success', "Type d'aide mis à jour.");
    }

    public function destroy(TypeAide $typeAide): RedirectResponse
    {
        if ($typeAide->evenements()->exists()) {
            return back()->with('error', "Ce type d'aide possède des événements et ne peut pas être supprimé.");
        }

        $typeAide->delete();

        return back()->with('success', "Type d'aide supprimé.");
    }

    public function toggle(TypeAide $typeAide): RedirectResponse
    {
        $typeAide->update(['actif' => ! $typeAide->actif]);

        $état = $typeAide->actif ? 'activé' : 'désactivé';

        return back()->with('success', "Type d'aide {$état}.");
    }
}
