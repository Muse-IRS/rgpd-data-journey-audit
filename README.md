# RGPD Data Journey Audit

Outil public minimal d'audit RGPD orienté parcours des données, droits applicables, cohérence documentaire, entité réelle, traces locales, préremplissage automatique et vigilance visuelle.

Ce dépôt porte une couche publique issue du projet **Association droits aux données personnelles RGPD**. Son objectif est de rendre compréhensible, pour un non-spécialiste, la manière dont un site, une interface ou un service numérique présente ses traitements de données, ses mentions légales, sa politique de confidentialité, ses traceurs éventuels, ses stockages locaux, son rattachement à une entité réelle et les droits applicables.

## Principe directeur

Comprendre un résultat ne suffit pas. Il faut aussi comprendre quelles données permettent de produire ce résultat, où elles circulent, qui peut les traiter, pourquoi, pendant combien de temps, ce qui reste dans le navigateur, ce qui est récupéré volontairement, et comment agir.

```text
DOMAIN_RESULT
+
DATA_JOURNEY
+
DATA_RIGHTS
=
PUBLIC_UNDERSTANDING
```

Extension site / société / trace locale / récupération :

```text
SITE_RESULT
+
LEGAL_ENTITY
+
USER_TRIGGERED_FETCH
+
SSF-IRS
+
LOCAL_TRACE
+
DATA_RIGHTS
+
RISK_SIGNALS
=
PUBLIC_UNDERSTANDING
```

## Objet du dépôt

Ce dépôt vise à construire une interface publique permettant à l'utilisateur d'auditer un site, une interface ou un service numérique selon une lecture simple :

1. quelles informations sont affichées ;
2. quelles données sont demandées ;
3. quelles données semblent traitées ;
4. quelles données restent locales dans le navigateur ;
5. quelles données quittent effectivement le navigateur ;
6. quels acteurs ou destinataires sont mentionnés ;
7. quelle société, association ou entité réelle est déclarée ;
8. où les informations société sont situées sur le site ;
9. si cette entité semble rattachable à un registre officiel ;
10. quelles finalités sont déclarées ;
11. quelles bases juridiques sont indiquées ;
12. quelles durées de conservation sont annoncées ;
13. quels droits RGPD sont présentés ;
14. comment exercer concrètement ces droits ;
15. quelles traces locales cette interface écrit dans le navigateur ;
16. quelles requêtes externes sont lancées volontairement par l'utilisateur ;
17. quelles incohérences, absences ou ambiguïtés apparaissent entre mentions légales, politique de confidentialité, cookies, traceurs, stockage local, entité déclarée et fonctionnement observable.

## Périmètre public

Le dépôt contient uniquement la couche publique nécessaire à :

- l'utilisation de l'interface ;
- la compréhension du résultat ;
- la compréhension du parcours des données ;
- l'identification des limites ;
- la restitution pédagogique des droits ;
- la restitution d'un niveau de vigilance documentaire ;
- l'explication des traces locales écrites dans le navigateur ;
- le préremplissage volontaire des données société lorsque les sources sont lisibles ;
- la documentation minimale de fonctionnement.

Le dépôt ne contient pas :

- de données personnelles réelles ;
- de dossiers individuels ;
- de pièces administratives ;
- de secrets ;
- de credentials ;
- de méthodes internes avancées ;
- de matrices privées ;
- de backtests ;
- de raisonnements de conception non publiables.

## Principe de publication

```text
PRIVATE_METHOD -> PUBLIC_RESULT
```

Les méthodes de conception, recherches internes, heuristiques, architectures expérimentales, matrices, protocoles et raisonnements de développement restent privés.

La couche publique expose uniquement ce qui est nécessaire pour que l'utilisateur comprenne le résultat, les données utilisées, leur parcours et ses moyens d'action.

## Fonctionnalités cibles

### Audit d'un site

L'utilisateur peut renseigner l'adresse d'un site, lancer une récupération volontaire ou analyser manuellement une interface afin d'obtenir une lecture structurée :

- mentions légales présentes ou absentes ;
- politique de confidentialité présente ou absente ;
- page cookies / traceurs présente ou absente ;
- cohérence entre les documents ;
- entité réelle déclarée ou non déclarée ;
- dénomination, forme juridique, SIREN, SIRET, adresse et source externe ;
- emplacement des informations dans le site : footer, mentions légales, confidentialité, CGV, contact, paiement ou autre ;
- cohérence apparente entre site, société, registre officiel et paiement ;
- acteurs identifiés ;
- finalités déclarées ;
- droits RGPD annoncés ;
- moyens de contact ;
- zones floues ou contradictoires.

### Récupération automatique volontaire

La version publique v0.2 ajoute un module de préremplissage :

```text
URL SAISIE
→ ACTION UTILISATEUR
→ FETCH HTML SI CORS AUTORISE
→ EXTRACTION SIREN / SIRET / ADRESSE / LIENS UTILES
→ API RECHERCHE D'ENTREPRISES SI POSSIBLE
→ PRÉREMPLISSAGE DES CHAMPS
→ SSF-IRS
→ COMPTEUR RECALCULÉ
```

Le préremplissage ne remplace pas le contrôle utilisateur. Les champs restent modifiables.

Si le site empêche la lecture depuis le navigateur, l'interface affiche l'échec et conserve le mode manuel.

### Validation SSF-IRS publique

Avant affichage interprété, les informations renseignées ou préremplies passent par une validation publique simple :

```text
OBSERVED_DATA
→ SSF-IRS_PUBLIC_VALIDATION
→ SAT / UNSAT / UNKNOWN
→ USER-FACING_DISPLAY
```

Les statuts signifient :

- `SAT` : information suffisamment cohérente selon les éléments renseignés et la vérification déclarée ;
- `UNSAT` : information invalide, contradictoire ou déclarée incohérente ;
- `UNKNOWN` : information absente, non localisée ou insuffisamment vérifiée.

Cette validation ne remplace pas un contrôle juridique ou administratif officiel.

### Compteur de vigilance

L'interface affiche un compteur visuel inspiré d'un compteur de vitesse :

```text
vert  -> cohérence observée
jaune -> vigilance recommandée
rouge -> alerte documentaire élevée
```

Le compteur conserve le pourcentage et ajoute une aiguille lisible. Les repères vert, jaune et rouge restent visibles directement sur la jauge.

Ce compteur ne certifie pas qu'un site est fiable, dangereux ou frauduleux. Il indique un niveau de vigilance documentaire à partir des éléments déclarés, observés et pré-validés.

Le compteur doit toujours être accompagné d'une explication :

```text
Pourquoi cette position ?
Ce qui est clair.
Ce qui manque.
Ce qui reste flou.
Ce que l'utilisateur peut faire.
```

### Marque visuelle Muze-X

L'interface reprend la palette publique utilisée par les interfaces DPE / Logement et Énergie / Linky de la plateforme Muze-X Lab : fond sombre, panneaux semi-transparents, accent vert clair et accent bleu clair.

Les couleurs d'état sont normalisées :

```text
SAT     -> vert
UNKNOWN -> jaune
UNSAT   -> rouge
```

La couleur ne doit jamais être le seul indicateur : le statut textuel et l'explication restent obligatoires.

### Journal local compréhensible

L'interface produit un carnet local du navigateur, visible et contrôlable par l'utilisateur.

Elle peut utiliser deux clés locales :

```text
rgpd-data-journey-audit:local-action-log
rgpd-data-journey-audit:last-local-audit
```

La première clé conserve le journal des actions utiles : clics, affichage du journal, génération d'audit, export, restauration, préremplissage automatique ou effacement.

La seconde clé conserve le dernier audit local afin de permettre à l'utilisateur de le revoir ou de le restaurer.

Ce carnet local doit être expliqué simplement :

```text
Ce qui est écrit dans le navigateur.
Pourquoi cela est écrit.
Où cela reste.
Comment l'afficher.
Comment l'exporter.
Comment le restaurer.
Comment l'effacer.
```

Par défaut, ce carnet reste dans le navigateur. Aucune transmission à un serveur ne doit être effectuée sans action explicite.

### Restitution simple

Le résultat doit être exprimé en langage clair :

```text
Ce qui est clair
Ce qui manque
Ce qui semble incohérent
Ce qui reste à vérifier
Ce que l'utilisateur peut faire
Ce qui reste localement dans le navigateur
Ce qui a été récupéré volontairement
```

## Domaines d'application initiaux

Les premiers domaines de rapprochement sont :

- DPE / logement ;
- énergie / Linky ;
- audit générique de site web ;
- confidentialité et mentions légales ;
- cookies, traceurs et stockages locaux ;
- rattachement site / entité réelle ;
- signaux de vigilance documentaire.

## Référence de conception

Le projet s'inspire des logiques publiques de lisibilité de la confidentialité, notamment l'idée de présenter clairement les catégories de données, les usages et les contrôles disponibles pour l'utilisateur.

Cette inspiration ne constitue ni une affiliation, ni une reprise d'interface propriétaire, ni une validation par une entreprise tierce.

## Verrou RGPD

L'outil ne doit pas produire de verdict juridique automatique.

Il doit produire une lecture structurée, prudente et vérifiable :

```text
fait observable
+
document déclaré
+
donnée manipulée
+
emplacement sur le site
+
récupération volontaire
+
pré-validation SSF-IRS
+
trace locale visible
+
parcours possible
+
entité déclarée
+
droit applicable
+
action possible
```

## Verrou associatif

Ce dépôt est lié au projet associatif d'aide à la compréhension des droits aux données personnelles.

La branche associative d'accompagnement des particuliers est non lucrative et ne génère aucun revenu personnel.

Toute valorisation d'algorithmes, d'outils ou de technologies auprès d'entreprises doit être séparée juridiquement, fonctionnellement et comptablement de la branche associative.

## Documentation principale

- `docs/DATA_JOURNEY_MODEL.md` — modèle public de parcours des données ;
- `docs/LOCAL_ACTION_JOURNAL.md` — journal local navigateur ;
- `docs/USER_LOCAL_STORAGE_EXPLANATION.md` — explication utilisateur du carnet local ;
- `docs/AUTOMATIC_SITE_ENTITY_FETCH.md` — récupération volontaire URL / site / API ;
- `docs/PRIVACY_READABILITY_REFERENCE.md` — référence de lisibilité ;
- `docs/PUBLIC_BOUNDARY.md` — frontière de publication ;
- `docs/SITE_AUDIT_SCOPE.md` — périmètre de l'audit ;
- `docs/VIGILANCE_GAUGE_MODEL.md` — compteur de vigilance ;
- `docs/VIGILANCE_GAUGE_NEEDLE.md` — aiguille et pourcentage ;
- `docs/SSF_IRS_VALIDATION_MODEL.md` — validation SAT / UNSAT / UNKNOWN ;
- `docs/ENTITY_MATCH_PANEL.md` — panneau société / SIREN / SIRET / emplacement ;
- `docs/BRAND_COLOR_SYSTEM.md` — palette publique Muze-X Lab.

## Licence

Apache License 2.0.

Voir `LICENSE` et `NOTICE`.
