# Architecture technique

## Vue d'ensemble

La plateforme DGPSN est une application **monolithique server-driven** : Laravel reste seul responsable du routage, de l'autorisation et du rendu des données, tandis que le rendu visuel est délégué à des composants React via **Inertia.js**. Il n'y a pas d'API REST/JSON séparée ni de SPA autonome — chaque navigation est une requête HTTP classique interceptée par Inertia, qui échange le JSON de props contre un remplacement de composant React côté client (pas de rechargement complet de page).

```
┌─────────────────────────────┐        requêtes XHR interceptées         ┌──────────────────────────────┐
│   Navigateur (React 19)     │ ───────────────────────────────────────► │   Laravel 13 (PHP 8.3+)      │
│   Pages Inertia (.jsx)      │ ◄─────────────────────────────────────── │   Controllers + Middleware   │
└─────────────────────────────┘   JSON de "props" (Inertia::render)      └──────────────────────────────┘
                                                                                     │
                                                                                     ▼
                                                                  ┌───────────────────────────────────┐
                                                                  │ Models Eloquent / Observers /      │
                                                                  │ Services / Enums (règles métier)   │
                                                                  └───────────────────────────────────┘
                                                                                     │
                                                                                     ▼
                                                                    SQLite (dev) / PostgreSQL 15+ (prod)
```

## Backend — Laravel 13

- **Point d'entrée HTTP** : `public/index.php` → `bootstrap/app.php` (bootstrap Laravel 13 sans `Kernel.php`, configuration des middlewares/exceptions faite directement dans `bootstrap/app.php`).
- **Routage** : un seul fichier `routes/web.php` (pas de `routes/api.php` utilisé) — voir [routes-api.md](routes-api.md) pour le détail complet.
- **Autorisation** : [spatie/laravel-permission](https://spatie.be/docs/laravel-permission), middleware `permission:xxx` posé directement sur les routes/groupes. Voir [roles-permissions.md](roles-permissions.md).
- **Partage de données globales avec Inertia** : `app/Http/Middleware/HandleInertiaRequests.php` injecte dans chaque page `auth.user` (avec son rôle et la liste à plat de ses permissions), les messages flash de session, et le compteur + les 10 dernières notifications non lues.
- **Domaine métier** : Models Eloquent (`app/Models`), Enums PHP 8.1 backés par chaîne (`app/Enums`), un Observer (`app/Observers/DemandeObserver`) qui génère automatiquement la référence `DPS-{ANNEE}-{SEQUENCE}` à la création d'une demande, et un service statique d'audit (`app/Services/AuditService`). Détails dans [modele-de-donnees.md](modele-de-donnees.md) et [workflow-demandes.md](workflow-demandes.md).
- **Génération de documents** :
  - PDF (« bon de prise en charge ») via `barryvdh/laravel-dompdf`, rendu à la volée dans `ComiteController::genererBon()` à partir de la vue Blade `resources/views/pdf/bon-prise-en-charge.blade.php`. Aucune persistance du PDF sur disque.
  - Excel via `phpoffice/phpspreadsheet`, encapsulé dans `app/Exports/DemandesExport.php` (mise en forme aux couleurs DGPSN).
  - CSV streamé en UTF-8 avec BOM directement depuis `RapportsController::exportCsv()`.
- **Notifications** : canal `database` (cloche in-app) systématique + canal `mail` conditionnel. Voir [notifications-emails.md](notifications-emails.md).
- **File d'attente** : driver `database` (table `jobs` via les migrations par défaut), consommée par `php artisan queue:listen` en dev (lancé par `composer run dev`).

## Frontend — React 19 + Inertia.js

> Le README et la mémoire historique du projet mentionnent « React 18 » (nom donné à la migration Vue→React), mais `package.json` fixe `react`/`react-dom` sur `^19.2.7`. C'est bien React 19 qui tourne en pratique.

- **Entrée** : `resources/js/app.jsx` — `createInertiaApp` avec résolution paresseuse des pages via `import.meta.glob('./Pages/**/*.jsx')` (helper `resolvePageComponent` de `laravel-vite-plugin`), montage React 19 via `createRoot`.
- **Un seul layout partagé** : `resources/js/Layouts/AppLayout.jsx` (sidebar + topbar), pas de layout persistant façon Inertia (chaque page importe et enveloppe elle-même `<AppLayout>`, comme au temps de Vue).
- **Pas de State Manager, pas de Router, pas de librairie de formulaires** : tout repose sur les primitives d'Inertia (`useForm`, `usePage`, `router`) et sur `useState`/`useEffect` React natifs.
- **Pas de librairie de graphiques** : les composants `DonutChart` et `LineChart` (`resources/js/Components/Dashboard/`) sont du SVG fait main.
- **`route()` global** : fourni côté Blade par `tightenco/ziggy` (directive `@routes` dans `resources/views/app.blade.php`), pas par un package npm — disponible sans import dans tout composant JS.
- **Style** : TailwindCSS v4 en configuration « CSS-first » (`resources/css/app.css`, pas de `tailwind.config.js`). Couleurs de marque (`#1B3A2D`, `#F5A623`) codées en dur en classes Tailwind arbitraires plutôt qu'en tokens de thème.

Détails complets dans [frontend.md](frontend.md).

## Build & outillage

| Outil | Rôle |
|---|---|
| Vite 8 (`vite.config.js`) | Bundler, dev server HMR sur `127.0.0.1:5173` |
| `laravel-vite-plugin` | Intègre Vite dans Blade (`@vite`, `@viteReactRefresh`), points d'entrée `resources/css/app.css` + `resources/js/app.jsx` |
| `@vitejs/plugin-react` | Support JSX + Fast Refresh |
| `@tailwindcss/vite` | Intégration native Tailwind v4 (sans PostCSS) |
| Composer scripts (`composer.json`) | `composer run setup` (installation complète : install, `.env`, clé, migrations, `npm install`, `npm run build`), `composer run dev` (lance `php artisan serve` + `php artisan queue:listen` + `npm run dev` en parallèle via `npx concurrently`), `composer run test` (`artisan config:clear` puis `artisan test`) |

## Environnements

| | Développement | Production |
|---|---|---|
| Base de données | SQLite (`database/database.sqlite`) | PostgreSQL 15+ |
| Assets | Vite dev server (HMR) | `npm run build` → `public/build/` servi statiquement |
| Cache config/routes/vues | non | `php artisan config:cache` / `route:cache` / `view:cache` |
| Mail | driver `log` par défaut | SMTP configuré via `.env` |

Voir le [README](../README.md) pour la procédure d'installation pas-à-pas.

## Points d'attention identifiés (dette technique)

- Aucun dossier `Hooks/` ou `utils/` côté frontend : les fonctions de formatage (`formatDate`, `formatMontant`, `formatBytes`) et le helper `can(permission)` sont dupliqués dans plusieurs pages (`Pages/Demandes/Index.jsx`, `Pages/Comite/Show.jsx`, `Layouts/AppLayout.jsx`).
- `AppLayout` reçoit une prop `title` par page mais ne l'exploite pas (pas de `<Head>` Inertia) — le `<title>` du navigateur reste celui défini globalement dans `app.jsx`.
- Plusieurs permissions Spatie sont seedées (`citoyens.modifier`, `demandes.modifier`, `demandes.soumettre`, `demandes.approuver`, `demandes.rejeter`) mais ne sont pas réellement utilisées comme garde de route — les routes s'appuient sur les permissions plus larges `demandes.creer` / `demandes.deliberer`. Voir [roles-permissions.md](roles-permissions.md).
- La couverture de `AuditService` est limitée aux décisions du comité (`approuver`/`rejeter`) ; les autres actions sensibles (création, modification, clôture de demande, gestion des utilisateurs) ne sont pas auditées.
