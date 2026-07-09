# Frontend — React 19 + Inertia.js

## Arborescence

```
resources/js/
├── app.jsx                       # point d'entrée Inertia/React
├── Layouts/
│   └── AppLayout.jsx              # unique layout partagé (sidebar + topbar)
├── Components/
│   ├── UI/                        # primitives génériques
│   │   ├── FlashMessage.jsx
│   │   ├── Modal.jsx
│   │   ├── NavGroup.jsx
│   │   ├── NavItem.jsx
│   │   ├── StatusBadge.jsx
│   │   └── icons/                  # 8 icônes SVG inline
│   └── Dashboard/                 # widgets de data-viz (SVG fait main)
│       ├── ActivityItem.jsx
│       ├── DonutChart.jsx
│       ├── KpiCard.jsx
│       └── LineChart.jsx
└── Pages/                         # une entrée par Inertia::render(), groupée par domaine
    ├── Auth/                       # Login, ForgotPassword, ResetPassword
    ├── Citoyens/                   # Index, Show
    ├── Comite/                     # Index, Show
    ├── Dashboard/                  # Index
    ├── Demandes/                   # Index, Create, Edit, Show
    ├── Parametres/                 # Index
    ├── Rapports/                   # Index, Exports
    ├── Referentiels/               # TypesAide, Prestataires, Evenements, Periodes, Annees (chacun Index)
    └── Utilisateurs/                # Index, Form
```

Aucun dossier `Hooks/`, `utils/` ou `lib/` n'existe : voir la section « Dette technique » plus bas.

## Point d'entrée — `resources/js/app.jsx`

```jsx
createInertiaApp({
    title: (title) => title ? `${title} — DGPSN` : 'DGPSN',
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#16a34a' },
});
```

- Résolution paresseuse des pages via `import.meta.glob`.
- Montage React 19 (`createRoot`), pas de `<StrictMode>`.
- `resources/views/app.blade.php` charge `@viteReactRefresh` **avant** `@vite(...)` (obligatoire avec `@vitejs/plugin-react`, sinon erreur console « can't detect preamble »), ainsi que `@routes` (Ziggy → `route()` global) et `@inertiaHead`.

## Layout unique — `AppLayout.jsx`

Pas de layout persistant façon Inertia : chaque page importe `AppLayout` et l'enveloppe elle-même. Pas de `GuestLayout` séparé — les pages `Auth/*` construisent leur propre écran plein-page (deux colonnes, image de marque + formulaire).

Contenu de `AppLayout` :
- Sidebar rétractable (`w-64` ↔ `w-16`), fond vert foncé `#1B3A2D`, logo DGPSN.
- Navigation construite dynamiquement à partir de `auth.user.permissions` via un helper local `can(permission)` :
  - `demandes.voir` → groupe « Demandes sociales » (`demandes.creer` ajoute « Nouvelle demande »)
  - `citoyens.voir` → « Citoyens »
  - `demandes.deliberer` → « Comité de délibération »
  - `referentiels.gerer` → groupe « Référentiels » (5 sous-liens)
  - `rapports.voir` → groupe « Rapports & Statistiques » (`rapports.exporter` ajoute « Exports »)
  - `utilisateurs.gerer` → groupe « Utilisateurs »
  - Toujours visibles : « Tableau de bord », « Paramètres »
- Badge de rôle (`administrateur` / `agent` / `comite`) lu depuis `auth.user.role`.
- Topbar : bascule sidebar, date du jour formatée en français, cloche de notifications (dropdown, marquage lu via `route('notifications.lire-une', id)` / `route('notifications.lire')`, clic → `route('demandes.show', id)`), menu utilisateur (lien `/parametres`, déconnexion via `useForm({}).post('/logout')`).
- Fermeture des dropdowns au clic extérieur via `useRef`/`useEffect`.
- La prop `title` passée par chaque page est actuellement **ignorée** (pas de `<Head>` Inertia) — le titre d'onglet reste celui défini globalement dans `app.jsx`.

## Pages par domaine fonctionnel

| Domaine | Fichiers | Rôle |
|---|---|---|
| Auth | `Login.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | Authentification, mot de passe oublié/réinitialisation |
| Dashboard | `Index.jsx` | KPI, graphique d'évolution (6 mois), répartition par type d'aide, activité récente |
| Demandes | `Index.jsx`, `Create.jsx`, `Edit.jsx`, `Show.jsx` | Liste filtrable, création, édition (brouillon), détail |
| Citoyens | `Index.jsx`, `Show.jsx` | Liste/recherche, profil + historique des demandes |
| Comite | `Index.jsx`, `Show.jsx` | File d'attente (à traiter / traitées), détail + actions d'approbation/rejet |
| Parametres | `Index.jsx` | Onglets « Mon profil » (+ onglet admin « Types d'aide ») |
| Rapports | `Index.jsx`, `Exports.jsx` | Statistiques filtrables, écran d'export CSV/Excel |
| Referentiels | `TypesAide/`, `Prestataires/`, `Evenements/`, `Periodes/`, `Annees/` (chacun `Index.jsx`) | CRUD des données de référence |
| Utilisateurs | `Index.jsx`, `Form.jsx` | Liste, formulaire partagé création/édition |

Convention commune : toutes les pages enveloppent leur contenu dans `<AppLayout title="...">`, utilisent `useForm` d'Inertia pour tous les formulaires (aucune librairie tierce), et lisent les permissions via `usePage().props.auth.user.permissions`. Les CRUD référentiels utilisent systématiquement `Components/UI/Modal.jsx` pour créer/éditer/supprimer sans changer de page.

## Composants réutilisables

**`Components/UI/`**
- `FlashMessage.jsx` — bannière animée pour `flash.success`/`flash.error` (props partagées Inertia via `HandleInertiaRequests`).
- `Modal.jsx` — modale via `createPortal`, tailles `sm` à `2xl`, slot de pied de page optionnel.
- `NavGroup.jsx` / `NavItem.jsx` — navigation de la sidebar (groupes repliables, lien actif, tooltip en mode réduit).
- `StatusBadge.jsx` — pastille colorée pour les statuts de demande.
- `icons/` — 8 icônes SVG (Dashboard, FileText, Users, Committee, Book, Chart, UserGroup, Settings) consommées via une table de correspondance nom → composant.

**`Components/Dashboard/`** (aucune librairie de graphiques — tout est du SVG fait main) :
- `KpiCard.jsx` — tuile statistique (libellé, valeur formatée, tendance %, icône colorée).
- `DonutChart.jsx` — anneau SVG (`strokeDasharray`/`strokeDashoffset`) + légende.
- `LineChart.jsx` — courbe/aire SVG avec graduations et dégradé.
- `ActivityItem.jsx` — ligne de flux d'activité (icône + titre + description + temps relatif).

## Style — TailwindCSS v4

`resources/css/app.css` utilise la configuration « CSS-first » de Tailwind v4 (pas de `tailwind.config.js`) :

```css
@import 'tailwindcss';
@source '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php';
@source '../../storage/framework/views/*.php';
@theme {
    --font-sans: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, ...;
}
```

Les couleurs de marque (`#1B3A2D` vert foncé, `#F5A623` or, `#16a34a` vert Tailwind pour la barre de progression Inertia) sont codées en dur en valeurs Tailwind arbitraires dans les composants plutôt que déclarées comme tokens `@theme` — à factoriser si la charte graphique doit évoluer.

## Build (`vite.config.js`)

```js
plugins: [
    laravel({ input: ['resources/css/app.css', 'resources/js/app.jsx'], refresh: true }),
    react(),
    tailwindcss(),
],
resolve: { alias: { '@': '/resources/js' } },
server: { host: '127.0.0.1', port: 5173, watch: { ignored: ['**/storage/framework/views/**'] } },
```

L'alias `@` pointe vers `resources/js` (ex. `import AppLayout from '@/Layouts/AppLayout.jsx'`). Le watcher ignore le cache de vues compilées Blade pour éviter les boucles de rechargement.

## Dépendances (`package.json`)

| Paquet | Rôle |
|---|---|
| `react` / `react-dom` `^19.2.7` | Framework UI — **React 19**, malgré le nom historique « migration vers React 18 » donné au commit |
| `@inertiajs/react` `^3.5.0` | Pont Inertia ↔ React |
| `laravel-vite-plugin`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `vite` | Build |
| `concurrently` | Utilisé côté script Composer `dev` (pas par un script npm) pour lancer Laravel/queue/Vite en parallèle |

Aucune librairie de state management (Redux/Zustand), de routing (React Router), de formulaires (Formik/RHF), de graphiques (Chart.js/Recharts) ou de tests JS (Vitest/Jest) n'est présente.

## Dette technique frontend

- **Pas de couche `Hooks/`/`utils/`** : `formatDate`, `formatMontant`, `formatBytes` et le helper `can(permission)` sont réimplémentés localement dans plusieurs pages (`Demandes/Index.jsx`, `Comite/Show.jsx`, `AppLayout.jsx`) au lieu d'être centralisés. Candidat naturel de refactor : `resources/js/utils/format.js` + `resources/js/Hooks/usePermissions.js`.
- **`title` non exploité** dans `AppLayout` — pas de balise `<Head>` Inertia par page.
- **Couleurs de marque en dur** plutôt qu'en tokens Tailwind `@theme`.
