# Rôles et permissions

Basé sur [spatie/laravel-permission](https://spatie.be/docs/laravel-permission) — guard unique `web`, pas de gestion multi-tenant. Un utilisateur possède **un seul rôle** en pratique (voir `UserController` / `Utilisateurs/Form.jsx`, qui ne proposent qu'un select simple), même si Spatie autoriserait plusieurs rôles par utilisateur.

## Permissions déclarées (`database/seeders/RoleSeeder.php`)

| Domaine | Permissions |
|---|---|
| Citoyens | `citoyens.voir`, `citoyens.creer`, `citoyens.modifier` |
| Demandes | `demandes.voir`, `demandes.creer`, `demandes.modifier`, `demandes.soumettre`, `demandes.deliberer`, `demandes.approuver`, `demandes.rejeter` |
| Référentiels | `referentiels.voir`, `referentiels.gerer` |
| Utilisateurs | `utilisateurs.voir`, `utilisateurs.gerer` |
| Rapports | `rapports.voir`, `rapports.exporter` |

## Rôles et attribution

| Rôle | Permissions attribuées |
|---|---|
| `agent` | `citoyens.voir`, `citoyens.creer`, `citoyens.modifier`, `demandes.voir`, `demandes.creer`, `demandes.modifier`, `demandes.soumettre`, `rapports.voir` |
| `comite` | `citoyens.voir`, `demandes.voir`, `demandes.deliberer`, `demandes.approuver`, `demandes.rejeter`, `rapports.voir` |
| `administrateur` | **toutes les permissions** |

## Comptes de démonstration (`AdminUserSeeder`)

| Rôle | Email | Mot de passe |
|---|---|---|
| `administrateur` | admin@dgpsn.sn | dgpsn2025 |
| `agent` | agent@dgpsn.sn | dgpsn2025 |
| `comite` | comite@dgpsn.sn | dgpsn2025 |

## ⚠️ Écart entre permissions seedées et permissions réellement vérifiées

Les gardes posées sur les routes (`middleware('permission:...')`, voir [routes-api.md](routes-api.md)) n'utilisent que ce sous-ensemble :

`citoyens.voir`, `citoyens.creer`, `demandes.voir`, `demandes.creer`, `demandes.deliberer`, `referentiels.voir`, `referentiels.gerer`, `utilisateurs.voir`, `utilisateurs.gerer`, `rapports.voir`, `rapports.exporter`

Les permissions suivantes sont **seedées et attribuées aux rôles mais ne servent de garde nulle part dans `routes/web.php`** : `citoyens.modifier`, `demandes.modifier`, `demandes.soumettre`, `demandes.approuver`, `demandes.rejeter`. En pratique :
- La modification d'un citoyen ou d'une demande est couverte par la permission plus large `citoyens.creer` / `demandes.creer` déjà posée sur les mêmes routes `store`/`update`.
- L'approbation/le rejet d'une demande sont couverts par la permission plus large `demandes.deliberer` sur tout le groupe `comite/*`.

**Conséquence pratique** : si un futur rôle personnalisé recevait par exemple `demandes.soumettre` sans `demandes.creer`, il resterait bloqué par les gardes de route actuelles — l'intention de granularité fine des permissions n'est pas honorée au niveau du routage. À corriger si un rôle plus fin que les 3 existants doit un jour être introduit.

## Utilisation côté frontend

Le middleware `app/Http/Middleware/HandleInertiaRequests.php` partage à chaque page :
```
auth.user.role          # nom du rôle Spatie (string)
auth.user.permissions   # liste à plat des permissions (string[])
```

`resources/js/Layouts/AppLayout.jsx` construit un helper local `can(permission)` à partir de `auth.user.permissions` pour afficher/masquer les liens de navigation. Les pages individuelles (ex. `Demandes/Index.jsx`, `Parametres/Index.jsx`) réimplémentent le même pattern `can()` localement plutôt que de le centraliser (voir la note de dette technique dans [architecture.md](architecture.md)).

**Important** : le masquage des liens côté React est un confort d'UX, pas une mesure de sécurité — l'autorisation réelle est appliquée côté serveur par le middleware `permission:` sur chaque route.

## Tests de la matrice de permissions

`tests/Feature/Authorization/PermissionMatrixTest.php` vérifie systématiquement, pour chacun des 3 rôles, l'accès (ou le refus HTTP 403) sur l'ensemble des routes protégées.
