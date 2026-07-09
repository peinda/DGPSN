# Notifications & emails

## Vue d'ensemble

| Notification | Déclencheur | Canaux | Destinataire |
|---|---|---|---|
| `DemandeDelibereeNotification` | `ComiteController::approuver()` / `::rejeter()` | `database` toujours, `mail` conditionnel | Agent instructeur de la demande (`$demande->agent`) |
| `ResetPasswordNotification` | `ForgotPasswordController::sendResetLinkEmail()` (via `Password::sendResetLink`) | `mail` | Utilisateur ayant demandé la réinitialisation |

## `DemandeDelibereeNotification` (`app/Notifications/`)

Envoyée dès qu'un membre du comité statue sur une demande (`$demande->agent?->notify(new DemandeDelibereeNotification($demande))`).

- **Canaux** (`via()`) : `database` systématiquement (alimente la cloche in-app) ; `mail` ajouté seulement si `config('mail.default')` n'est ni `log` ni `array` **et** que le destinataire a une adresse email — évite l'envoi de mails inutiles en environnement de développement (mailer par défaut = `log`).
- **`toDatabase()` / `toArray()`** — stocké en JSON dans `notifications.data` : `demande_id`, `reference`, `statut`, un message français (« La demande {reference} a été {label du statut}. »), `commentaire`.
- **`toMail()`** — retourne une instance de `DemandeDelibereeMail`.
- N'implémente **pas** `ShouldQueue` (seul le trait `Queueable` est utilisé, sans effet sans l'interface) : l'envoi est toujours synchrone, immédiat, indépendant du worker de file d'attente.

## `DemandeDelibereeMail` (`app/Mail/`)

- Sujet : `"DGPSN — Demande {reference} : {libellé du statut}"`.
- Vue : `resources/views/emails/demande-deliberee.blade.php`.
- Utilisée uniquement comme sortie de `DemandeDelibereeNotification::toMail()` — pas envoyée directement ailleurs.

## `ResetPasswordNotification` (`app/Notifications/`)

- Étend la notification `ResetPassword` native de Laravel.
- `toMail()` surchargé pour un email entièrement en français (« Réinitialisation de votre mot de passe — DGPSN »), incluant le lien de réinitialisation, le délai d'expiration (`config('auth.passwords.users.expire')`), et la signature DGPSN.
- Branchée via `User::sendPasswordResetNotification()` (override dans le modèle `User`).

## Consommation côté frontend

`app/Http/Middleware/HandleInertiaRequests.php` partage à **chaque** requête Inertia :
- `notifications_count` — nombre de notifications non lues de l'utilisateur connecté.
- Les 10 dernières notifications non lues (contenu de `toArray()`).

`resources/js/Layouts/AppLayout.jsx` affiche ces données dans la cloche de la topbar :
- Clic sur une notification → marque comme lue (`POST /notifications/{id}/lire`) puis navigue vers `route('demandes.show', demande_id)`.
- Bouton « Tout marquer comme lu » → `POST /notifications/lire`.

Ces deux routes sont implémentées en closures inline dans `routes/web.php` (pas de contrôleur dédié), protégées par `auth` seulement (pas de permission spécifique — chaque utilisateur ne gère que ses propres notifications).

## Configuration email

Par défaut (`.env` de développement), `MAIL_MAILER=log` : les emails sont écrits dans `storage/logs/laravel.log` plutôt qu'envoyés. Pour un envoi réel :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=user@example.com
MAIL_PASSWORD=secret
MAIL_FROM_ADDRESS=noreply@dgpsn.sn
MAIL_FROM_NAME="DGPSN"
```

## File d'attente

Driver `database` (table `jobs`, migration standard Laravel). En développement, `composer run dev` lance en parallèle `php artisan queue:listen` — sans ce worker actif, les notifications `ShouldQueue` restent en attente dans la table `jobs` et ne partent jamais.
