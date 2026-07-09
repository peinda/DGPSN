# Plateforme DGPSN — Gestion des Demandes de Prise en Charge Sociale

Système de gestion numérique des demandes d'aide sociale pour la **Délégation Générale à la Protection Sociale et à la Solidarité Nationale** (DGPSN) du Sénégal.

📚 **Documentation technique complète** : [docs/README.md](docs/README.md) (architecture, modèle de données, workflow métier, routes, permissions, frontend, tests).

📄 **Rapport de présentation du projet** (pour la hiérarchie) : [docs/RAPPORT-PROJET-DGPSN.md](docs/RAPPORT-PROJET-DGPSN.md).

---

## Stack technique

| Composant | Technologie |
|---|---|
| Backend | Laravel 13 (PHP 8.3+) |
| Frontend | React 18 + Inertia.js + TailwindCSS |
| Base de données | SQLite (dev) / PostgreSQL 15+ (prod) |
| Rôles & permissions | Spatie Laravel Permission |
| Export PDF | barryvdh/laravel-dompdf |
| Export Excel | phpoffice/phpspreadsheet |
| Routing frontend | Tighten Ziggy |
| Files d'attente | Laravel Queue (driver database) |

---

## Prérequis

- PHP 8.3+
- Node.js 20+
- Composer 2+
- SQLite (dev) ou PostgreSQL 15+ (prod)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Prise_EnChargeDgpsn
```

### 2. Installation automatique

```bash
composer run setup
```

Cette commande effectue en une seule fois :
- `composer install`
- Copie de `.env.example` → `.env`
- Génération de la clé applicative
- Migration de la base de données
- `npm install` + `npm run build`

### 3. Peupler la base de données

```bash
php artisan db:seed
```

Crée les rôles, les comptes de test, les référentiels (14 régions, 45 départements, 336 communes, types d'aide, événements, années de gestion, prestataires agréés), ainsi que des citoyens et demandes de test couvrant tous les statuts.

---

## Démarrage en développement

```bash
composer run dev
```

Lance en parallèle :
- Serveur Laravel (`php artisan serve`)
- Worker de file d'attente (`php artisan queue:listen`)
- Logs en temps réel (`php artisan pail`)
- Vite avec HMR (`npm run dev`)

L'application est accessible sur **http://localhost:8000**

---

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@dgpsn.sn | dgpsn2025 |
| Agent | agent@dgpsn.sn | dgpsn2025 |
| Comité | comite@dgpsn.sn | dgpsn2025 |

---

## Rôles et permissions

### Agent
- Créer, modifier et soumettre des demandes au nom des citoyens
- Consulter l'historique de ses propres demandes
- Ajouter des pièces justificatives
- Recevoir des notifications lors des délibérations

### Comité
- Examiner les demandes soumises
- Approuver ou rejeter avec commentaire
- Générer le bon de prise en charge PDF

### Administrateur
- Accès complet à toutes les demandes
- Gérer les utilisateurs (création, rôles)
- Gérer les référentiels (types d'aide, prestataires, événements, périodes, années)
- Accéder aux rapports et exports

---

## Modules

### Demandes sociales
Workflow en 5 statuts : **Brouillon → Soumis → En examen → Approuvé/Rejeté → Clôturé**

Règles métier automatiques :
- **Quota** : max 2 demandes du même type par citoyen et par année de gestion
- **Période ouverte** : les demandes ne sont acceptées que si une période d'ouverture active existe pour l'événement concerné

### Comité de délibération
File d'attente des demandes soumises. Chaque membre peut prendre une demande en examen, consulter l'historique complet du citoyen (indicateur de récurrence), puis approuver ou rejeter.

### Bon PDF
Généré automatiquement à l'approbation. Inclut les informations du bénéficiaire, le type d'aide, les prestataires agréés, les montants et les signatures.

### Référentiels (admin)
- **Types d'aide** : Événements religieux, Assistance médicale, Prise en charge hospitalière, Urgence sociale
- **Événements** : liés aux types d'aide (Tabaski, Korité, Gamou, etc.)
- **Prestataires** : hôpitaux, pharmacies, cliniques agréés
- **Périodes d'ouverture** : fenêtres de dépôt par événement et par année
- **Années de gestion** : cycle annuel avec statuts Ouverte / Clôturée / Archivée

### Rapports & Statistiques
- KPI par statut (brouillon, soumis, approuvé, rejeté, clôturé)
- Évolution mensuelle sur 12 mois
- Répartition par type d'aide et par région
- Filtres par année et par type d'aide
- Export CSV et Excel

### Notifications
Les agents reçoivent une notification en base (+ email si configuré) à chaque délibération de leurs demandes. La cloche dans la topbar affiche le compteur en temps réel.

---

## Structure des dossiers clés

```
app/
├── Enums/              # StatutDemande, StatutAnnee, TypePrestataire
├── Http/Controllers/
│   ├── Referentiels/   # TypesAide, Evenements, Periodes, Annees, Prestataires
│   ├── ComiteController.php
│   ├── DemandesController.php
│   └── RapportsController.php
├── Models/             # Demande, Citoyen, TypeAide, Prestataire, Region…
├── Notifications/      # DemandeDelibereeNotification
├── Observers/          # DemandeObserver (génération de la référence DPS-YYYY-NNNN)
└── Services/           # AuditService

resources/js/Pages/
├── Demandes/           # Index, Create, Edit, Show
├── Comite/             # Index, Show
├── Citoyens/           # Index, Show
├── Referentiels/       # Annees, Evenements, Periodes, Prestataires, TypesAide
├── Rapports/           # Index, Exports
└── Parametres/         # Index (profil + types d'aide admin)

database/
├── migrations/         # Tables : users, demandes, citoyens, regions, types_aide…
└── seeders/
    ├── RoleSeeder.php
    ├── AdminUserSeeder.php
    ├── ReferentielSeeder.php
    └── DemandesSeeder.php   # Citoyens et demandes de test (tous statuts)
```

---

## Références des demandes

Format généré automatiquement à la création : `DPS-{ANNEE}-{SEQUENCE}`

Exemple : `DPS-2026-0001`

---

## Configuration email (optionnel)

Par défaut les emails sont écrits dans les logs. Pour activer l'envoi réel, configurer dans `.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=user@example.com
MAIL_PASSWORD=secret
MAIL_FROM_ADDRESS=noreply@dgpsn.sn
MAIL_FROM_NAME="DGPSN"
```

---

## Production (PostgreSQL)

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dgpsn
DB_USERNAME=postgres
DB_PASSWORD=secret
```

Puis :

```bash
php artisan migrate --force
php artisan db:seed
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```
