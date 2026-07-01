<?php

namespace App\Http\Controllers\Referentiels;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\TypeAide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

class EvenementsController extends Controller
{
    public function index(): Response
    {
        return inertia('Referentiels/Evenements/Index', [
            'typesAide'  => TypeAide::orderBy('nom')->get(),
            'evenements' => Evenement::with('typeAide')->orderBy('nom')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type_aide_id' => 'required|exists:types_aide,id',
            'nom'          => 'required|string|max:255',
            'code'         => 'required|string|max:30|unique:evenements,code',
            'description'  => 'nullable|string|max:1000',
            'actif'        => 'boolean',
        ]);

        Evenement::create($data);

        return back()->with('success', 'Événement créé avec succès.');
    }

    public function update(Request $request, Evenement $evenement): RedirectResponse
    {
        $data = $request->validate([
            'type_aide_id' => 'required|exists:types_aide,id',
            'nom'          => 'required|string|max:255',
            'code'         => ['required', 'string', 'max:30', Rule::unique('evenements', 'code')->ignore($evenement)],
            'description'  => 'nullable|string|max:1000',
            'actif'        => 'boolean',
        ]);

        $evenement->update($data);

        return back()->with('success', 'Événement mis à jour.');
    }

    public function destroy(Evenement $evenement): RedirectResponse
    {
        if ($evenement->demandes()->exists()) {
            return back()->with('error', 'Cet événement est lié à des demandes et ne peut pas être supprimé.');
        }

        $evenement->delete();

        return back()->with('success', 'Événement supprimé.');
    }
}
