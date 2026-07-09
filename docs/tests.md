# Tests

## Exécution

```bash
composer run test
# équivalent à :
php artisan config:clear
php artisan test
```

Configuration (`phpunit.xml`) : suites `Unit` (`tests/Unit`) et `Feature` (`tests/Feature`), environnement `testing` avec SQLite **en mémoire** (`DB_DATABASE=:memory:`), `QUEUE_CONNECTION=sync`, `SESSION_DRIVER=array`, `MAIL_MAILER=array`, `BCRYPT_ROUNDS=4` (hash accéléré pour la vitesse des tests).

## Support commun

`tests/Concerns/CreatesUsers.php` — trait factorisant la création d'utilisateurs de test avec un rôle Spatie donné (agent/comité/administrateur), utilisé par la quasi-totalité des tests Feature pour s'authentifier avec le bon niveau de permission.

`database/factories/` fournit une factory par modèle métier (`AnneeGestionFactory`, `CitoyenFactory`, `CommuneFactory`, `DemandeFactory`, `DepartementFactory`, `EvenementFactory`, `PeriodeOuvertureFactory`, `PrestataireFactory`, `RegionFactory`, `TypeAideFactory`).

## Tests Feature (`tests/Feature/`)

| Fichier | Couverture |
|---|---|
| `Auth/LoginTest.php` | Connexion/déconnexion, identifiants invalides |
| `Auth/PasswordResetTest.php` | Demande + réinitialisation de mot de passe |
| `Authorization/PermissionMatrixTest.php` | Matrice complète rôle × route protégée (accès/403) |
| `Citoyens/CitoyenCrudTest.php` | Création/édition d'un citoyen, validations |
| `Citoyens/CitoyenSearchTest.php` | Recherche par CIN (`/api/citoyens/search`) |
| `Comite/BonPdfTest.php` | Génération du bon PDF, restreinte aux demandes `APPROUVE` |
| `Comite/ComiteWorkflowTest.php` | Prise en examen, approbation, rejet, notifications |
| `Demandes/DemandeCreationTest.php` | Création de demande, règles de quota et de période |
| `Demandes/DemandeEditDeleteTest.php` | Édition/suppression limitées au statut `BROUILLON` |
| `Demandes/DemandeSoumissionTest.php` | Soumission (pièce jointe requise, période active requise) |
| `Demandes/DemandesIndexScopingTest.php` | Portée de la liste des demandes selon le rôle (agent = ses demandes uniquement) |
| `Demandes/EligibiliteApiTest.php` | Endpoint `/api/eligibilite` (quota/période en temps réel) |
| `Demandes/PrestataireConfirmationTest.php` | Confirmation de prestataire, clôture automatique |
| `Parametres/ParametresTest.php` | Mise à jour du profil et du mot de passe |
| `Rapports/RapportsExportTest.php` | Export CSV/Excel |
| `Rapports/RapportsIndexTest.php` | Page de statistiques et filtres |
| `Referentiels/AnneesGestionReferentielTest.php` | CRUD années de gestion + transitions `ouvert`→`cloture`→`archive` |
| `Referentiels/EvenementsReferentielTest.php` | CRUD événements, blocage de suppression si demandes liées |
| `Referentiels/PeriodesOuvertureReferentielTest.php` | CRUD périodes d'ouverture, unicité événement+année |
| `Referentiels/PrestatairesReferentielTest.php` | CRUD prestataires, activation/désactivation |
| `Referentiels/TypesAideReferentielTest.php` | CRUD types d'aide, blocage de suppression si événements liés |
| `Utilisateurs/UserManagementTest.php` | CRUD utilisateurs, blocage de l'auto-suppression |

## Tests Unit (`tests/Unit/`)

| Fichier | Couverture |
|---|---|
| `Enums/StatutAnneeTest.php` | Libellés et cas de `StatutAnnee` |
| `Enums/StatutDemandeTest.php` | Libellés, couleurs, `estFinalise()` de `StatutDemande` |
| `Enums/TypePrestataireTest.php` | Libellés de `TypePrestataire` |
| `Models/CitoyenTest.php` | `nomComplet()`, `estRecurrent()`, `demandesParTypeEtAnnee()` |
| `Models/DemandeTest.php` | Transitions d'état (`soumettre`, `approuver`, `rejeter`, `cloturer`), `quotaAtteint()` |
| `Models/UserPermissionsTest.php` | Attribution de rôle/permissions à un utilisateur |
| `Observers/DemandeObserverTest.php` | Génération de la référence `DPS-{ANNEE}-{SEQUENCE}` |
| `Services/AuditServiceTest.php` | Écriture des entrées `AuditLog` |

## Notes

- Les anciens tests placeholders de Laravel (`tests/Feature/ExampleTest.php`, `tests/Unit/ExampleTest.php`) ont été supprimés au profit de cette suite dédiée au métier.
- Aucun test JavaScript/React (pas de Vitest/Jest/RTL configuré) — la logique frontend n'est couverte que par les tests Feature Laravel qui vérifient les props Inertia renvoyées par les contrôleurs, pas le rendu React lui-même. Une vérification manuelle en navigateur reste nécessaire pour les changements d'UI.
