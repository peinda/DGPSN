<?php

use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\CitoyensController;
use App\Http\Controllers\ComiteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemandesController;
use App\Http\Controllers\ParametresController;
use App\Http\Controllers\PiecesJointesController;
use App\Http\Controllers\RapportsController;
use App\Http\Controllers\Referentiels\AnneesGestionController;
use App\Http\Controllers\Referentiels\EvenementsController;
use App\Http\Controllers\Referentiels\PeriodesOuvertureController;
use App\Http\Controllers\Referentiels\PrestatairesController;
use App\Http\Controllers\Referentiels\TypesAideController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'));

Route::middleware('guest')->group(function () {
    Route::get('/login',  [LoginController::class, 'showLogin'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.post');

    Route::get('/mot-de-passe-oublie',  [ForgotPasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/mot-de-passe-oublie', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');

    Route::get('/reinitialiser-mot-de-passe/{token}', [ResetPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reinitialiser-mot-de-passe',        [ResetPasswordController::class, 'reset'])->name('password.update');
});

Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- Citoyens ---
    Route::middleware('permission:citoyens.voir')->group(function () {
        Route::get('/citoyens',                    [CitoyensController::class, 'index'])->name('citoyens.index');
        Route::get('/citoyens/{citoyen}',          [CitoyensController::class, 'show'])->name('citoyens.show');
        Route::get('/api/citoyens/search',         [CitoyensController::class, 'search'])->name('citoyens.search');
    });
    Route::middleware('permission:citoyens.creer')->group(function () {
        Route::post('/citoyens', [CitoyensController::class, 'store'])->name('citoyens.store');
        Route::put('/citoyens/{citoyen}', [CitoyensController::class, 'update'])->name('citoyens.update');
    });

    // --- Demandes ---
    // Routes statiques EN PREMIER (avant les routes paramétrées)
    Route::middleware('permission:demandes.creer')->group(function () {
        Route::get('/demandes/create',   [DemandesController::class, 'create'])->name('demandes.create');
        Route::post('/demandes',         [DemandesController::class, 'store'])->name('demandes.store');
    });
    Route::middleware('permission:demandes.voir')->group(function () {
        Route::get('/demandes',          [DemandesController::class, 'index'])->name('demandes.index');
        Route::get('/api/eligibilite',   [DemandesController::class, 'checkEligibilite'])->name('demandes.eligibilite');
        // Routes paramétrées APRÈS les routes statiques
        Route::get('/demandes/{demande}',         [DemandesController::class, 'show'])->name('demandes.show');
    });
    Route::middleware('permission:demandes.creer')->group(function () {
        Route::get('/demandes/{demande}/edit',    [DemandesController::class, 'edit'])->name('demandes.edit');
        Route::put('/demandes/{demande}',         [DemandesController::class, 'update'])->name('demandes.update');
        Route::delete('/demandes/{demande}',      [DemandesController::class, 'destroy'])->name('demandes.destroy');
        Route::post('/demandes/{demande}/soumettre',                            [DemandesController::class, 'soumettre'])->name('demandes.soumettre');
        Route::post('/demandes/{demande}/cloturer',                             [DemandesController::class, 'cloturer'])->name('demandes.cloturer');
        Route::post('/demandes/{demande}/prestataires/{prestataire}/confirmer', [DemandesController::class, 'confirmerPrestataire'])->name('demandes.prestataires.confirmer');
        Route::post('/demandes/{demande}/pieces-jointes',                       [PiecesJointesController::class, 'store'])->name('pieces-jointes.store');
        Route::delete('/demandes/{demande}/pieces-jointes/{pieceJointe}',       [PiecesJointesController::class, 'destroy'])->name('pieces-jointes.destroy');
    });

    // --- Comité ---
    Route::middleware('permission:demandes.deliberer')->prefix('comite')->name('comite.')->group(function () {
        Route::get('/',                              [ComiteController::class, 'index'])->name('index');
        Route::get('/{demande}',                     [ComiteController::class, 'show'])->name('show');
        Route::post('/{demande}/examiner',           [ComiteController::class, 'prendreEnExamen'])->name('examiner');
        Route::post('/{demande}/approuver',          [ComiteController::class, 'approuver'])->name('approuver');
        Route::post('/{demande}/rejeter',            [ComiteController::class, 'rejeter'])->name('rejeter');
        Route::get('/{demande}/bon-pdf',             [ComiteController::class, 'genererBon'])->name('bon-pdf');
    });

    // --- Référentiels lecture ---
    Route::middleware('permission:referentiels.voir')->prefix('referentiels')->name('referentiels.')->group(function () {
        Route::get('/types-aide',   [TypesAideController::class,         'index'])->name('types-aide.index');
        Route::get('/prestataires', [PrestatairesController::class,      'index'])->name('prestataires.index');
        Route::get('/evenements',   [EvenementsController::class,        'index'])->name('evenements.index');
        Route::get('/periodes',     [PeriodesOuvertureController::class, 'index'])->name('periodes.index');
        Route::get('/annees',       [AnneesGestionController::class,     'index'])->name('annees.index');
    });

    // --- Référentiels écriture ---
    Route::middleware('permission:referentiels.gerer')->prefix('referentiels')->name('referentiels.')->group(function () {
        Route::post('/prestataires',                       [PrestatairesController::class, 'store'])->name('prestataires.store');
        Route::put('/prestataires/{prestataire}',          [PrestatairesController::class, 'update'])->name('prestataires.update');
        Route::delete('/prestataires/{prestataire}',       [PrestatairesController::class, 'destroy'])->name('prestataires.destroy');
        Route::patch('/prestataires/{prestataire}/toggle', [PrestatairesController::class, 'toggle'])->name('prestataires.toggle');

        Route::post('/types-aide',                        [TypesAideController::class, 'store'])->name('types-aide.store');
        Route::put('/types-aide/{typeAide}',              [TypesAideController::class, 'update'])->name('types-aide.update');
        Route::delete('/types-aide/{typeAide}',           [TypesAideController::class, 'destroy'])->name('types-aide.destroy');
        Route::patch('/types-aide/{typeAide}/toggle',     [TypesAideController::class, 'toggle'])->name('types-aide.toggle');

        Route::post('/evenements',               [EvenementsController::class, 'store'])->name('evenements.store');
        Route::put('/evenements/{evenement}',    [EvenementsController::class, 'update'])->name('evenements.update');
        Route::delete('/evenements/{evenement}', [EvenementsController::class, 'destroy'])->name('evenements.destroy');

        Route::post('/periodes',           [PeriodesOuvertureController::class, 'store'])->name('periodes.store');
        Route::put('/periodes/{periode}',  [PeriodesOuvertureController::class, 'update'])->name('periodes.update');
        Route::delete('/periodes/{periode}',[PeriodesOuvertureController::class, 'destroy'])->name('periodes.destroy');

        Route::post('/annees',                        [AnneesGestionController::class, 'store'])->name('annees.store');
        Route::put('/annees/{anneeGestion}',          [AnneesGestionController::class, 'update'])->name('annees.update');
        Route::post('/annees/{anneeGestion}/cloturer',[AnneesGestionController::class, 'cloturer'])->name('annees.cloturer');
        Route::post('/annees/{anneeGestion}/archiver',[AnneesGestionController::class, 'archiver'])->name('annees.archiver');
    });

    // --- Utilisateurs ---
    Route::middleware('permission:utilisateurs.voir')->group(function () {
        Route::get('/utilisateurs', [UserController::class, 'index'])->name('utilisateurs.index');
    });
    Route::middleware('permission:utilisateurs.gerer')->group(function () {
        Route::get('/utilisateurs/create',       [UserController::class, 'create'])->name('utilisateurs.create');
        Route::post('/utilisateurs',             [UserController::class, 'store'])->name('utilisateurs.store');
        Route::get('/utilisateurs/{user}/edit',  [UserController::class, 'edit'])->name('utilisateurs.edit');
        Route::put('/utilisateurs/{user}',       [UserController::class, 'update'])->name('utilisateurs.update');
        Route::delete('/utilisateurs/{user}',    [UserController::class, 'destroy'])->name('utilisateurs.destroy');
    });

    // --- Rapports ---
    Route::middleware('permission:rapports.voir')->prefix('rapports')->name('rapports.')->group(function () {
        Route::get('/tableau-de-bord', [RapportsController::class, 'index'])->name('index');
    });
    Route::middleware('permission:rapports.exporter')->prefix('rapports')->name('rapports.')->group(function () {
        Route::get('/exports',      [RapportsController::class, 'exports'])->name('exports');
        Route::get('/export-csv',   [RapportsController::class, 'exportCsv'])->name('export-csv');
        Route::get('/export-excel', [RapportsController::class, 'exportExcel'])->name('export-excel');
    });

    Route::post('/notifications/lire', function () {
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);
        return back();
    })->name('notifications.lire');

    Route::post('/notifications/{id}/lire', function (string $id) {
        Auth::user()->notifications()->where('id', $id)->update(['read_at' => now()]);
        return back();
    })->name('notifications.lire-une');

    Route::get('/parametres',                  [ParametresController::class, 'index'])->name('parametres.index');
    Route::put('/parametres/profil',           [ParametresController::class, 'updateProfil'])->name('parametres.update-profil');
    Route::put('/parametres/mot-de-passe',     [ParametresController::class, 'updatePassword'])->name('parametres.update-password');
});
