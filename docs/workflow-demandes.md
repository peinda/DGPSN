# Workflow métier — Cycle de vie d'une demande

## Machine à états (`StatutDemande`)

```mermaid
stateDiagram-v2
    [*] --> BROUILLON: DemandesController::store()
    BROUILLON --> SOUMIS: soumettre() — agent
    BROUILLON --> [*]: destroy() — suppression (brouillon uniquement)
    SOUMIS --> EN_EXAMEN: prendreEnExamen() — comité
    EN_EXAMEN --> APPROUVE: approuver() — comité
    EN_EXAMEN --> REJETE: rejeter() — comité (motif ≥ 10 caractères)
    APPROUVE --> CLOTURE: cloturer() — manuel OU automatique
    REJETE --> [*]
    CLOTURE --> [*]
```

Les transitions sont implémentées comme méthodes sur le modèle `Demande` (`app/Models/Demande.php`) : `soumettre()`, `prendreEnExamen(User $membreComite)`, `approuver(User $membreComite, ?string $commentaire)`, `rejeter(User $membreComite, string $commentaire)`, `cloturer()`. Chacune met à jour `statut` ainsi que l'acteur et l'horodatage associés (`agent_id`/`comite_user_id`, `date_soumission`/`date_deliberation`/`date_cloture`).

`StatutDemande::estFinalise()` renvoie `true` pour `APPROUVE`, `REJETE` et `CLOTURE` — utilisé côté UI pour verrouiller l'édition.

## Étape par étape

### 1. Création (brouillon) — `DemandesController::store()`

Un agent (`permission: demandes.creer`) saisit :
- Un citoyen — recherché par CIN (`CitoyensController::search`) ou créé à la volée s'il n'existe pas encore.
- Un type d'aide, éventuellement un événement (si le type le requiert), une année de gestion.
- Un ou plusieurs prestataires avec un montant estimé chacun → `montant_total` = somme des `montant_estime`.
- Des pièces justificatives (upload, table `pieces_jointes`).

Deux règles métier sont vérifiées **avant** la création :

**Règle 1 — Quota (`Demande::quotaAtteint`)**
> Un même citoyen ne peut avoir plus de **2 demandes non rejetées** pour le même type d'aide sur la même année de gestion. Le contrôleur bloque la création avec une erreur de validation si le quota est déjà atteint.

**Règle 2 — Période d'ouverture (uniquement si `TypeAide::requiert_periode === true`)**
> Si le type d'aide sélectionné exige une fenêtre d'ouverture (actuellement seul le type « Événements religieux » l'exige), il doit exister une `PeriodeOuverture` **active** (`actif = true` et date du jour comprise entre `date_debut` et `date_fin`) pour le couple événement/année choisi.

Une demande peut être **créée en brouillon même si la période n'est pas ouverte** — la règle 2 n'est réellement bloquante qu'à la **soumission** (voir étape 2). Si le formulaire de création demande une soumission immédiate (`_soumettre_apres=1`) et que la période n'est pas active, la demande reste en `brouillon` avec un message d'avertissement plutôt que d'échouer silencieusement.

**Vérification côté client en temps réel** : `DemandesController::checkEligibilite()` expose un endpoint JSON (`GET`, `permission: demandes.voir`) consommé en Ajax par le formulaire React pour afficher `quota_atteint` / `periode_active` / `requiert_periode` avant même la soumission du formulaire.

### 2. Édition (brouillon uniquement) — `edit()` / `update()`

Seules les demandes au statut `BROUILLON` sont modifiables (citoyen, prestataires, montants, pièces jointes). Toute tentative sur une demande à un autre statut est rejetée par le contrôleur.

### 3. Soumission — `soumettre()`

Conditions requises :
- Statut courant = `BROUILLON`.
- Au moins **une pièce jointe** est attachée à la demande.
- Si `requiert_periode`, la période d'ouverture liée doit être **active** (`PeriodeOuverture::estActive()`) — sinon message bloquant « la période d'ouverture pour cet événement est clôturée ».

→ passage à `SOUMIS`, horodatage `date_soumission`.

### 4. Prise en examen — `ComiteController::prendreEnExamen()`

Un membre du comité (`permission: demandes.deliberer`) prend en charge une demande `SOUMIS` → `EN_EXAMEN`. Le comité consulte alors (`ComiteController::show()`) le détail complet de la demande **et** l'historique du citoyen, avec un indicateur de récurrence (`Citoyen::estRecurrent()` — a déjà eu une demande approuvée les années précédentes) affiché comme signal d'alerte.

### 5. Délibération — `approuver()` / `rejeter()`

- **Approbation** : `EN_EXAMEN → APPROUVE`. Commentaire optionnel. Journalisée via `AuditService::demande('demande.approuvee', ...)`. Notifie l'agent instructeur (`DemandeDelibereeNotification`).
- **Rejet** : `EN_EXAMEN → REJETE`. Motif **obligatoire, ≥ 10 caractères**. Journalisé (`demande.rejetee`). Notifie l'agent.

Dans les deux cas : `comite_user_id` = membre ayant statué, `date_deliberation` = maintenant.

### 6. Génération du bon de prise en charge — `ComiteController::genererBon()`

Disponible uniquement si `statut === APPROUVE`. Génère à la volée (pas de stockage) un PDF (DomPDF, format A4 portrait) reprenant bénéficiaire, type d'aide, prestataires agréés, montants et emplacements de signature.

### 7. Confirmation des prestataires — `DemandesController::confirmerPrestataire()`

Pour une demande `APPROUVE`, chaque prestataire lié peut être marqué `confirme = true` (+ `date_confirmation`) sur la ligne pivot `demande_prestataire`. **Dès que tous les prestataires liés sont confirmés, la demande passe automatiquement à `CLOTURE`** (appel interne à `cloturer()`).

### 8. Clôture manuelle — `DemandesController::cloturer()`

Une demande `APPROUVE` peut aussi être clôturée manuellement sans attendre la confirmation de tous les prestataires (ex. aide déjà versée autrement).

### 9. Suppression — `destroy()`

Réservée aux demandes encore en `BROUILLON` — impossible de supprimer une demande déjà soumise ou traitée (traçabilité).

## Portée des listes selon le rôle

`DemandesController::index()` filtre automatiquement : un utilisateur avec uniquement `demandes.creer` (agent) ne voit **que ses propres demandes** (`agent_id = auth()->id()`), alors qu'un utilisateur avec `demandes.deliberer` ou une portée plus large voit l'ensemble. Vérifié par `tests/Feature/Demandes/DemandesIndexScopingTest.php`.

## Récapitulatif des règles automatiques

| Règle | Portée | Implémentation |
|---|---|---|
| Quota 2 demandes/type/année/citoyen (non rejetées) | Création | `Demande::quotaAtteint()` |
| Période d'ouverture active requise | Soumission (bloquant), création (avertissement) | `TypeAide::requiert_periode` + `PeriodeOuverture::estActive()` |
| ≥ 1 pièce jointe pour soumettre | Soumission | `DemandesController::soumettre()` |
| Motif de rejet ≥ 10 caractères | Rejet | Validation `ComiteController::rejeter()` |
| Clôture auto si tous prestataires confirmés | Post-approbation | `confirmerPrestataire()` → `cloturer()` |
| Édition/suppression limitées au brouillon | Édition, suppression | Contrôleurs `update()`/`destroy()` |
| Référence unique `DPS-{ANNEE}-{SEQUENCE}` | Création | `DemandeObserver::created()` |
