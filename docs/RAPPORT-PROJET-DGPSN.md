# Rapport de projet
## Plateforme de gestion numérique des demandes de prise en charge sociale
### Délégation Générale à la Protection Sociale et à la Solidarité Nationale (DGPSN) — République du Sénégal

---

## Sommaire

1. Résumé exécutif
2. Contexte et enjeux
3. Objectifs du projet
4. Périmètre fonctionnel
5. Parcours de traitement d'une demande
6. Rôles et organisation des accès
7. Pilotage, rapports et statistiques
8. Sécurité, traçabilité et fiabilité
9. Couverture géographique et référentiels
10. État d'avancement et validation qualité
11. Bénéfices attendus
12. Limites actuelles et points de vigilance
13. Perspectives d'évolution
14. Conclusion
15. Annexe — Documentation technique disponible

---

## 1. Résumé exécutif

La DGPSN a fait développer une plateforme numérique destinée à remplacer le traitement manuel des demandes d'aide sociale par un circuit entièrement digitalisé, de la saisie de la demande par un agent jusqu'à la délivrance du bon de prise en charge et le suivi de son exécution par les prestataires agréés (hôpitaux, pharmacies, cliniques).

La plateforme couvre aujourd'hui l'ensemble du territoire national (14 régions, 45 départements, 336 communes) et structure quatre grandes familles d'aide : l'assistance médicale, la prise en charge hospitalière, l'urgence sociale et les aides liées aux grands événements religieux (Tabaski, Korité, Gamou). Elle intègre des règles de gestion automatiques pour limiter les abus (quota de demandes par citoyen), un circuit de délibération collégiale, un tableau de bord de pilotage, des exports de rapports, ainsi qu'une gestion fine des rôles et des accès.

Le projet est fonctionnellement complet et a fait l'objet d'une suite de tests automatisés couvrant l'ensemble des parcours métier. Il est prêt pour un déploiement en environnement de production, sous réserve des étapes de mise en service décrites en section 13.

---

## 2. Contexte et enjeux

La DGPSN a pour mission d'accompagner les citoyens sénégalais en situation de vulnérabilité à travers différents dispositifs d'aide sociale : assistance médicale, prise en charge de frais hospitaliers, soutien lors des grands événements religieux, ou encore réponse aux urgences sociales. Ce traitement, historiquement géré de façon manuelle ou dispersée, présente plusieurs limites :

- **Absence de vue consolidée** sur le volume, la nature et la répartition géographique des demandes traitées.
- **Difficulté à détecter les demandes multiples ou abusives** d'un même citoyen sur une même période.
- **Délais et pertes d'information** dans la circulation des dossiers entre l'agent instructeur et l'instance de délibération.
- **Absence de traçabilité formelle** des décisions (qui a décidé, quand, sur quel motif).
- **Reporting difficile** pour la hiérarchie et les partenaires institutionnels (statistiques, justification budgétaire).

La digitalisation du processus répond directement à ces constats en apportant un outil unique, structuré et auditable, utilisable par les agents de terrain, le comité de délibération et l'administration centrale.

---

## 3. Objectifs du projet

1. **Dématérialiser** l'ensemble du cycle de vie d'une demande d'aide sociale, de sa création à sa clôture.
2. **Fiabiliser les décisions** en appliquant automatiquement des règles de gestion (quota, périodes d'ouverture) et en donnant au comité de délibération une vue complète de l'historique du demandeur.
3. **Centraliser un référentiel national** des prestataires agréés (hôpitaux, pharmacies, cliniques) organisés par région, département et commune.
4. **Fournir un pilotage en temps réel** de l'activité (statistiques, tendances, exports) à destination de la hiérarchie.
5. **Sécuriser les accès** par un système de rôles (agent, comité, administrateur) et journaliser les décisions sensibles.
6. **Garder une trace documentaire** de chaque prise en charge via un bon PDF généré automatiquement à l'approbation.

---

## 4. Périmètre fonctionnel

| Module | Description |
|---|---|
| **Demandes sociales** | Création, instruction, soumission et suivi des demandes d'aide, avec pièces justificatives attachées. |
| **Citoyens** | Registre des bénéficiaires (identifiés par leur numéro de carte d'identité nationale — CIN), avec historique complet de leurs demandes passées. |
| **Comité de délibération** | File d'attente des demandes soumises, examen collégial, décision d'approbation ou de rejet motivé. |
| **Bon de prise en charge (PDF)** | Document officiel généré automatiquement à l'approbation d'une demande, incluant bénéficiaire, type d'aide, prestataires et montants. |
| **Référentiels** | Gestion des types d'aide, des événements associés (Tabaski, Korité, Gamou…), des périodes d'ouverture, des années de gestion et des prestataires agréés. |
| **Rapports & statistiques** | Tableau de bord, répartition par statut/type d'aide/région, évolution mensuelle, exports CSV et Excel. |
| **Notifications** | Alerte en temps réel (et par email) de l'agent instructeur dès qu'une décision est rendue sur l'une de ses demandes. |
| **Utilisateurs** | Gestion des comptes et des rôles des agents, membres du comité et administrateurs. |

Les quatre types d'aide actuellement configurés sont : **Événements religieux**, **Assistance médicale**, **Prise en charge hospitalière** et **Urgence sociale**.

---

## 5. Parcours de traitement d'une demande

Chaque demande suit un circuit structuré en six étapes, garantissant qu'aucune décision n'est prise sans instruction préalable ni traçabilité :

```
 Brouillon  →  Soumis  →  En examen  →  Approuvé / Rejeté  →  Clôturé
 (agent)       (agent)     (comité)       (comité)              (auto. ou manuel)
```

1. **Brouillon** — l'agent instructeur enregistre la demande : identification du citoyen (ou création de son dossier s'il est nouveau), type d'aide, prestataire(s) sollicité(s), montants estimés, pièces justificatives.
2. **Soumis** — l'agent transmet formellement la demande, une fois les pièces justificatives réunies.
3. **En examen** — un membre du comité de délibération prend la demande en charge pour instruction.
4. **Approuvé ou Rejeté** — le comité statue. Un rejet doit obligatoirement être motivé. L'agent instructeur est notifié instantanément de la décision.
5. **Clôturé** — une fois la prise en charge effectivement réalisée par le ou les prestataires (confirmation de leur part), la demande est automatiquement clôturée ; une clôture manuelle reste possible si nécessaire.

**Deux règles de gestion automatiques** protègent l'intégrité du dispositif :

- **Règle de quota** : un même citoyen ne peut bénéficier de plus de **deux demandes** pour un même type d'aide au cours d'une même année de gestion, afin de prévenir les abus.
- **Règle de période d'ouverture** : pour les aides liées à un événement (par exemple une campagne Tabaski), aucune demande ne peut être soumise en dehors de la fenêtre de dépôt officiellement ouverte pour cet événement.

Ces règles sont vérifiées automatiquement par le système, aussi bien au moment de la saisie qu'à la soumission, ce qui évite tout traitement manuel de vérification et sécurise l'équité du dispositif.

Par ailleurs, le comité dispose d'un **indicateur de récurrence** signalant si le demandeur a déjà bénéficié d'une aide approuvée les années précédentes, pour éclairer sa décision.

---

## 6. Rôles et organisation des accès

Trois profils d'utilisateurs structurent l'usage de la plateforme :

| Rôle | Responsabilités |
|---|---|
| **Agent** | Crée et instruit les demandes au nom des citoyens, joint les pièces justificatives, soumet les dossiers, consulte l'historique de ses propres demandes, reçoit les notifications de décision. |
| **Comité** | Examine les demandes soumises, consulte l'historique complet du demandeur, approuve ou rejette avec motivation, génère le bon de prise en charge PDF. |
| **Administrateur** | Accès complet à l'ensemble des demandes, gestion des utilisateurs et de leurs rôles, gestion des référentiels nationaux (types d'aide, prestataires, événements, périodes, années de gestion), accès à l'ensemble des rapports et exports. |

Chaque agent ne voit et ne gère que ses propres demandes, tandis que le comité et l'administration disposent d'une vue globale — un cloisonnement qui limite l'accès aux informations personnelles des citoyens au strict nécessaire.

---

## 7. Pilotage, rapports et statistiques

La plateforme met à disposition de la hiérarchie un **tableau de bord** présentant :

- Le volume total de demandes et leur répartition par statut (brouillon, soumis, en examen, approuvé, rejeté, clôturé).
- L'évolution mensuelle de l'activité sur plusieurs mois.
- La répartition des demandes par type d'aide et par région.
- Un flux d'activité récente et les dernières demandes traitées.

Un module de **rapports dédiés** permet de filtrer ces données par année de gestion et par type d'aide, et de les **exporter en CSV ou en fichier Excel** mis en forme, pour un usage hors plateforme (présentation, justification budgétaire, transmission à des partenaires).

---

## 8. Sécurité, traçabilité et fiabilité

- **Accès nominatif et sécurisé** : chaque utilisateur dispose d'un compte individuel avec mot de passe, et d'une procédure de réinitialisation sécurisée en cas d'oubli.
- **Séparation des rôles** : les droits d'action sont strictement définis selon le profil (agent, comité, administrateur), appliqués côté serveur — impossible de contourner une restriction depuis le navigateur.
- **Journal d'audit** : les décisions du comité (approbation, rejet) sont enregistrées dans un registre horodaté, avec l'identité du décideur et son adresse d'accès, garantissant la traçabilité des choix engageant l'institution.
- **Référence unique par demande** : chaque dossier reçoit automatiquement un identifiant unique et lisible (format `DPS-ANNÉE-NUMÉRO`, par exemple `DPS-2026-0001`), facilitant son suivi et sa citation.
- **Numéro de carte d'identité (CIN) unique par citoyen** : évite la création de doublons dans le registre des bénéficiaires.

---

## 9. Couverture géographique et référentiels

La plateforme est préchargée avec l'intégralité du découpage administratif du Sénégal, permettant un déploiement national immédiat :

| Référentiel | Volume |
|---|---|
| Régions | 14 |
| Départements | 45 |
| Communes | 336 |
| Types d'aide | 4 (Événements religieux, Assistance médicale, Prise en charge hospitalière, Urgence sociale) |
| Prestataires agréés de démonstration | Hôpitaux, pharmacies et cliniques répartis par région |

Les référentiels (types d'aide, événements, périodes d'ouverture, années de gestion, prestataires) sont administrables directement depuis la plateforme par un administrateur, sans intervention technique — ce qui permet d'ouvrir une nouvelle campagne (par exemple une nouvelle édition de Tabaski) ou d'ajouter un nouveau prestataire agréé en quelques clics.

---

## 10. État d'avancement et validation qualité

- **Périmètre fonctionnel complet** : l'ensemble des modules décrits en section 4 est implémenté et opérationnel.
- **Migration technique réalisée** : l'interface a été entièrement reconstruite sur une base technologique moderne (React), sans changement de comportement ni d'ergonomie pour les utilisateurs déjà formés sur la version précédente.
- **Suite de tests automatisés** : chaque règle métier (quota, périodes d'ouverture, transitions de statut, restrictions de rôle, exports, gestion des utilisateurs et des référentiels) est couverte par des tests automatisés rejoués à chaque évolution du logiciel, garantissant la non-régression.
- **Environnement de démonstration** prêt à l'emploi, avec comptes de test pour chacun des trois rôles et un jeu de données représentatif (citoyens et demandes couvrant tous les statuts du circuit).

Ce niveau de maturité place le projet en position d'être déployé en environnement de production, moyennant les étapes de mise en service détaillées en section 13.

---

## 11. Bénéfices attendus

- **Rapidité de traitement** : suppression des délais liés à la circulation physique des dossiers.
- **Équité et lutte contre les abus** : quota automatique, détection des demandeurs récurrents, périodes d'ouverture strictement encadrées.
- **Transparence et redevabilité** : traçabilité complète des décisions, motivation obligatoire des rejets.
- **Pilotage renforcé** : statistiques en temps réel pour orienter les décisions budgétaires et opérationnelles.
- **Standardisation documentaire** : bon de prise en charge généré automatiquement, dans un format unique et officiel.
- **Réactivité vis-à-vis des bénéficiaires** : notification immédiate de l'agent dès qu'une décision est rendue.
- **Déploiement national immédiat** : couverture déjà en place de l'ensemble du découpage administratif du pays.

---

## 12. Limites actuelles et points de vigilance

Par souci de transparence, les points suivants méritent l'attention de la hiérarchie avant et pendant le déploiement :

- **Canal de notification** : les alertes de décision sont aujourd'hui diffusées par notification interne à la plateforme et par email ; **aucun canal SMS** n'est pour l'instant disponible, ce qui peut être une limite dans les zones à faible accès Internet pour les agents.
- **Usage exclusivement web** : la plateforme est accessible depuis un navigateur (ordinateur ou mobile) mais ne dispose pas d'une application mobile dédiée ni de mode de fonctionnement hors connexion.
- **Granularité des rôles** : trois profils sont actuellement définis (agent, comité, administrateur). L'ajout d'un profil intermédiaire (par exemple un rôle de « superviseur régional ») nécessitera un travail d'ajustement technique avant d'être opérationnel.
- **Vérification d'identité** : le numéro de carte d'identité nationale (CIN) est aujourd'hui saisi et vérifié pour éviter les doublons internes, mais n'est pas encore confronté à une base d'état civil externe.
- **Mise en production** : le passage à un environnement de production (base de données PostgreSQL, hébergement, sauvegardes) ainsi que la formation des agents et des membres du comité restent des étapes à planifier.

---

## 13. Perspectives d'évolution

Les pistes suivantes pourraient enrichir la plateforme lors de phases ultérieures, à arbitrer selon les priorités de la DGPSN :

1. **Déploiement en production** sur l'infrastructure retenue, avec bascule vers PostgreSQL et mise en place de sauvegardes régulières.
2. **Formation des utilisateurs** (agents de terrain, membres du comité, administrateurs référentiels) et accompagnement au changement.
3. **Extension des canaux de notification** (SMS) pour toucher les agents dans les zones à connectivité limitée.
4. **Cartographie interactive** de la répartition des demandes et des prestataires sur le territoire national, en complément des statistiques actuelles.
5. **Interconnexion avec d'autres systèmes de l'État** (état civil, registre biométrique) pour fiabiliser davantage l'identification des bénéficiaires.
6. **Rôles complémentaires** (par exemple supervision régionale ou départementale) si l'organisation de la DGPSN évolue.
7. **Application mobile** dédiée aux agents de terrain pour la saisie en situation de mobilité.

---

## 14. Conclusion

La plateforme développée pour la DGPSN transforme un processus historiquement manuel en un circuit numérique complet, structuré, sécurisé et piloté par la donnée. Elle couvre dès aujourd'hui l'ensemble du territoire national et l'ensemble des dispositifs d'aide sociale portés par la Délégation, tout en intégrant les garde-fous nécessaires (quota, périodes d'ouverture, traçabilité des décisions) pour garantir l'équité et la redevabilité du dispositif.

Le projet est fonctionnellement abouti et techniquement validé par une suite de tests automatisés couvrant l'ensemble des règles métier. Sa mise en production, accompagnée d'un plan de formation des utilisateurs, constitue la prochaine étape naturelle pour transformer cet outil en levier opérationnel au service des bénéficiaires de la protection sociale au Sénégal.

---

## 15. Annexe — Documentation technique disponible

Pour les équipes techniques souhaitant approfondir un aspect particulier, une documentation détaillée est disponible dans le dossier `docs/` du projet :

| Document | Contenu |
|---|---|
| [architecture.md](architecture.md) | Architecture logicielle détaillée (backend, frontend, build) |
| [modele-de-donnees.md](modele-de-donnees.md) | Schéma de la base de données et modèles |
| [workflow-demandes.md](workflow-demandes.md) | Détail technique du circuit de traitement d'une demande |
| [roles-permissions.md](roles-permissions.md) | Détail des rôles et permissions |
| [routes-api.md](routes-api.md) | Référence des routes de l'application |
| [frontend.md](frontend.md) | Structure de l'interface utilisateur |
| [notifications-emails.md](notifications-emails.md) | Fonctionnement des notifications et emails |
| [tests.md](tests.md) | Organisation de la suite de tests |
