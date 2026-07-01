<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\TypeAide;
use Inertia\Response;

class ParametresController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('administrateur');

        return inertia('Parametres/Index', [
            'userData' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->getRoleNames()->first() ?? 'agent',
                'created_at' => $user->created_at?->format('d/m/Y'),
            ],
            'typesAide' => $isAdmin
                ? TypeAide::withCount('demandes')->orderBy('nom')->get(['id', 'nom', 'code', 'description', 'actif'])
                : [],
            'isAdmin' => $isAdmin,
        ]);
    }

    public function updateProfil(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ], [
            'email.unique' => 'Cette adresse email est déjà utilisée.',
        ]);

        $user->update($data);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password'      => ['required', 'current_password'],
            'password'              => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.current_password' => 'Le mot de passe actuel est incorrect.',
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Mot de passe modifié avec succès.');
    }
}
