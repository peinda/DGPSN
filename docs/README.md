# Documentation technique — Plateforme DGPSN

Index de la documentation technique du projet. Pour l'installation et le démarrage rapide, voir le [README](../README.md) à la racine.

| Document | Contenu |
|---|---|
| [RAPPORT-PROJET-DGPSN.md](RAPPORT-PROJET-DGPSN.md) | Rapport de présentation complet du projet à destination de la hiérarchie (contexte, objectifs, fonctionnalités, bénéfices, perspectives) |
| [architecture.md](architecture.md) | Vue d'ensemble Laravel + Inertia + React, flux de requêtes, build, environnements, dette technique |
| [modele-de-donnees.md](modele-de-donnees.md) | Schéma relationnel (ERD), tables, modèles Eloquent, enums, seeders |
| [workflow-demandes.md](workflow-demandes.md) | Machine à états d'une demande, règles métier (quota, période d'ouverture), étapes du cycle de vie |
| [roles-permissions.md](roles-permissions.md) | Rôles Spatie, matrice de permissions, comptes de démonstration |
| [routes-api.md](routes-api.md) | Référence complète des routes web, contrôleurs et permissions associées |
| [frontend.md](frontend.md) | Structure React/Inertia, layout, pages, composants, build frontend |
| [notifications-emails.md](notifications-emails.md) | Notifications in-app/email, déclencheurs, configuration mail |
| [tests.md](tests.md) | Organisation de la suite de tests PHPUnit, commandes d'exécution |
| [Presentation-Plateforme-DGPSN.pdf](Presentation-Plateforme-DGPSN.pdf) | Présentation fonctionnelle du projet (support externe) |

## Stack en un coup d'œil

Laravel 13 (PHP 8.3+) · Inertia.js · React 19 · TailwindCSS v4 · SQLite (dev) / PostgreSQL 15+ (prod) · Spatie Laravel Permission · DomPDF · PhpSpreadsheet · Ziggy

## Par où commencer ?

- **Nouveau sur le projet** → [architecture.md](architecture.md) puis [modele-de-donnees.md](modele-de-donnees.md).
- **Comprendre le métier** (traitement d'une demande d'aide sociale) → [workflow-demandes.md](workflow-demandes.md).
- **Ajouter/modifier une route ou un contrôleur** → [routes-api.md](routes-api.md) et [roles-permissions.md](roles-permissions.md).
- **Travailler sur l'UI** → [frontend.md](frontend.md).
- **Écrire ou lancer des tests** → [tests.md](tests.md).
