# Référence des routes

Toutes les routes sont déclarées dans `routes/web.php` (pas de fichier `routes/api.php` utilisé — l'application n'expose pas d'API JSON publique, seulement des endpoints Inertia et deux endpoints Ajax internes). Les noms de route (`->name(...)`) sont utilisables côté React via le helper global `route()` fourni par Ziggy.

## Invité (non authentifié)

| Méthode | URI | Contrôleur | Nom |
|---|---|---|---|
| GET | `/login` | `Auth\LoginController@showLogin` | `login` |
| POST | `/login` | `Auth\LoginController@login` | `login.post` |
| GET | `/mot-de-passe-oublie` | `Auth\ForgotPasswordController@showLinkRequestForm` | `password.request` |
| POST | `/mot-de-passe-oublie` | `Auth\ForgotPasswordController@sendResetLinkEmail` | `password.email` |
| GET | `/reinitialiser-mot-de-passe/{token}` | `Auth\ResetPasswordController@showResetForm` | `password.reset` |
| POST | `/reinitialiser-mot-de-passe` | `Auth\ResetPasswordController@reset` | `password.update` |

`GET /` redirige toujours vers `login`. `POST /logout` (`Auth\LoginController@logout`) ne requiert que `auth`.

## Authentifié — Tableau de bord

| Méthode | URI | Contrôleur | Permission |
|---|---|---|---|
| GET | `/dashboard` | `DashboardController@index` | *(aucune, auth suffit)* |

## Citoyens

| Méthode | URI | Contrôleur | Permission |
|---|---|---|---|
| GET | `/citoyens` | `CitoyensController@index` | `citoyens.voir` |
| GET | `/citoyens/{citoyen}` | `CitoyensController@show` | `citoyens.voir` |
| GET | `/api/citoyens/search` | `CitoyensController@search` | `citoyens.voir` |
| POST | `/citoyens` | `CitoyensController@store` | `citoyens.creer` |
| PUT | `/citoyens/{citoyen}` | `CitoyensController@update` | `citoyens.creer` |

## Demandes

> Ordre volontaire dans `routes/web.php` : les routes statiques (`/demandes/create`) sont déclarées **avant** les routes paramétrées (`/demandes/{demande}`) pour éviter tout conflit de résolution.

| Méthode | URI | Contrôleur | Permission |
|---|---|---|---|
| GET | `/demandes/create` | `DemandesController@create` | `demandes.creer` |
| POST | `/demandes` | `DemandesController@store` | `demandes.creer` |
| GET | `/demandes` | `DemandesController@index` | `demandes.voir` |
| GET | `/api/eligibilite` | `DemandesController@checkEligibilite` | `demandes.voir` |
| GET | `/demandes/{demande}` | `DemandesController@show` | `demandes.voir` |
| GET | `/demandes/{demande}/edit` | `DemandesController@edit` | `demandes.creer` |
| PUT | `/demandes/{demande}` | `DemandesController@update` | `demandes.creer` |
| DELETE | `/demandes/{demande}` | `DemandesController@destroy` | `demandes.creer` |
| POST | `/demandes/{demande}/soumettre` | `DemandesController@soumettre` | `demandes.creer` |
| POST | `/demandes/{demande}/cloturer` | `DemandesController@cloturer` | `demandes.creer` |
| POST | `/demandes/{demande}/prestataires/{prestataire}/confirmer` | `DemandesController@confirmerPrestataire` | `demandes.creer` |
| POST | `/demandes/{demande}/pieces-jointes` | `PiecesJointesController@store` | `demandes.creer` |
| DELETE | `/demandes/{demande}/pieces-jointes/{pieceJointe}` | `PiecesJointesController@destroy` | `demandes.creer` |

## Comité de délibération (`prefix: comite`, `name: comite.`)

Toutes les routes sont protégées par `permission:demandes.deliberer`.

| Méthode | URI | Contrôleur | Nom |
|---|---|---|---|
| GET | `/comite` | `ComiteController@index` | `comite.index` |
| GET | `/comite/{demande}` | `ComiteController@show` | `comite.show` |
| POST | `/comite/{demande}/examiner` | `ComiteController@prendreEnExamen` | `comite.examiner` |
| POST | `/comite/{demande}/approuver` | `ComiteController@approuver` | `comite.approuver` |
| POST | `/comite/{demande}/rejeter` | `ComiteController@rejeter` | `comite.rejeter` |
| GET | `/comite/{demande}/bon-pdf` | `ComiteController@genererBon` | `comite.bon-pdf` |

## Référentiels (`prefix: referentiels`, `name: referentiels.`)

**Lecture** (`permission:referentiels.voir`) :

| Méthode | URI | Contrôleur |
|---|---|---|
| GET | `/referentiels/types-aide` | `Referentiels\TypesAideController@index` |
| GET | `/referentiels/prestataires` | `Referentiels\PrestatairesController@index` |
| GET | `/referentiels/evenements` | `Referentiels\EvenementsController@index` |
| GET | `/referentiels/periodes` | `Referentiels\PeriodesOuvertureController@index` |
| GET | `/referentiels/annees` | `Referentiels\AnneesGestionController@index` |

**Écriture** (`permission:referentiels.gerer`) :

| Méthode | URI | Contrôleur |
|---|---|---|
| POST/PUT/DELETE/PATCH | `/referentiels/prestataires[/{prestataire}][/toggle]` | `PrestatairesController` (`store`/`update`/`destroy`/`toggle`) |
| POST/PUT/DELETE/PATCH | `/referentiels/types-aide[/{typeAide}][/toggle]` | `TypesAideController` (`store`/`update`/`destroy`/`toggle`) |
| POST/PUT/DELETE | `/referentiels/evenements[/{evenement}]` | `EvenementsController` (`store`/`update`/`destroy`) |
| POST/PUT/DELETE | `/referentiels/periodes[/{periode}]` | `PeriodesOuvertureController` (`store`/`update`/`destroy`) |
| POST/PUT | `/referentiels/annees[/{anneeGestion}]` | `AnneesGestionController` (`store`/`update`) |
| POST | `/referentiels/annees/{anneeGestion}/cloturer` | `AnneesGestionController@cloturer` |
| POST | `/referentiels/annees/{anneeGestion}/archiver` | `AnneesGestionController@archiver` |

## Utilisateurs

| Méthode | URI | Contrôleur | Permission |
|---|---|---|---|
| GET | `/utilisateurs` | `UserController@index` | `utilisateurs.voir` |
| GET | `/utilisateurs/create` | `UserController@create` | `utilisateurs.gerer` |
| POST | `/utilisateurs` | `UserController@store` | `utilisateurs.gerer` |
| GET | `/utilisateurs/{user}/edit` | `UserController@edit` | `utilisateurs.gerer` |
| PUT | `/utilisateurs/{user}` | `UserController@update` | `utilisateurs.gerer` |
| DELETE | `/utilisateurs/{user}` | `UserController@destroy` | `utilisateurs.gerer` (auto-suppression bloquée) |

## Rapports (`prefix: rapports`, `name: rapports.`)

| Méthode | URI | Contrôleur | Permission |
|---|---|---|---|
| GET | `/rapports/tableau-de-bord` | `RapportsController@index` | `rapports.voir` |
| GET | `/rapports/exports` | `RapportsController@exports` | `rapports.voir` |
| GET | `/rapports/export-csv` | `RapportsController@exportCsv` | `rapports.exporter` |
| GET | `/rapports/export-excel` | `RapportsController@exportExcel` | `rapports.exporter` |

## Notifications & Paramètres (auth uniquement, pas de permission dédiée — actions self-service)

| Méthode | URI | Handler | Nom |
|---|---|---|---|
| POST | `/notifications/lire` | Closure — marque toutes les notifications comme lues | `notifications.lire` |
| POST | `/notifications/{id}/lire` | Closure — marque une notification comme lue | `notifications.lire-une` |
| GET | `/parametres` | `ParametresController@index` | `parametres.index` |
| PUT | `/parametres/profil` | `ParametresController@updateProfil` | `parametres.update-profil` |
| PUT | `/parametres/mot-de-passe` | `ParametresController@updatePassword` | `parametres.update-password` |

> Ces deux routes de notifications sont implémentées en closures inline dans `routes/web.php` avec `Auth::user()->...` — la façade `Auth` n'est pas explicitement importée en haut du fichier, ce qui fonctionne (résolution dans le namespace global) mais s'écarte de la convention `use` du reste du fichier.
