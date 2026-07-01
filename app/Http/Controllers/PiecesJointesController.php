<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\PieceJointe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PiecesJointesController extends Controller
{
    public function store(Request $request, Demande $demande): RedirectResponse
    {
        $request->validate([
            'fichiers'   => 'required|array|min:1',
            'fichiers.*' => 'file|mimes:pdf,jpg,jpeg,png|max:102400',
        ], [
            'fichiers.required'    => 'Veuillez sélectionner au moins un fichier.',
            'fichiers.*.mimes'     => 'Formats acceptés : PDF, JPG, PNG.',
            'fichiers.*.max'       => 'Taille maximale : 100 Mo par fichier.',
        ]);

        foreach ($request->file('fichiers') as $file) {
            $path = $file->store("pieces-jointes/{$demande->id}", 'public');
            $demande->piecesJointes()->create([
                'nom_original' => $file->getClientOriginalName(),
                'chemin'       => $path,
                'type_mime'    => $file->getMimeType(),
                'taille'       => $file->getSize(),
            ]);
        }

        return back()->with('success', 'Pièce(s) jointe(s) ajoutée(s).');
    }

    public function destroy(Demande $demande, PieceJointe $pieceJointe): RedirectResponse
    {
        Storage::disk('public')->delete($pieceJointe->chemin);
        $pieceJointe->delete();

        return back()->with('success', 'Pièce jointe supprimée.');
    }
}
