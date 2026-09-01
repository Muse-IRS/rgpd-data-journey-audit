# RGPD Data Journey Audit

Outil public minimal d'audit RGPD orienté parcours des données, droits applicables et cohérence documentaire.

Ce dépôt porte une couche publique issue du projet **Association droits aux données personnelles RGPD**. Son objectif est de rendre compréhensible, pour un non-spécialiste, la manière dont un site, une interface ou un service numérique présente ses traitements de données, ses mentions légales, sa politique de confidentialité, ses traceurs éventuels, ses stockages locaux et les droits applicables.

## Principe directeur

Comprendre un résultat ne suffit pas. Il faut aussi comprendre quelles données permettent de produire ce résultat, où elles circulent, qui peut les traiter, pourquoi, pendant combien de temps, et comment agir.

```text
DOMAIN_RESULT
+
DATA_JOURNEY
+
DATA_RIGHTS
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
7. quelles finalités sont déclarées ;
8. quelles bases juridiques sont indiquées ;
9. quelles durées de conservation sont annoncées ;
10. quels droits RGPD sont présentés ;
11. comment exercer concrètement ces droits ;
12. quelles incohérences, absences ou ambiguïtés apparaissent entre mentions légales, politique de confidentialité, cookies, traceurs, stockage local et fonctionnement observable.

## Périmètre public

Le dépôt contient uniquement la couche publique nécessaire à :

- l'utilisation de l'interface ;
- la compréhension du résultat ;
- la compréhension du parcours des données ;
- l'identification des limites ;
- la restitution pédagogique des droits ;
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

L'utilisateur peut renseigner l'adresse d'un site ou analyser manuellement une interface afin d'obtenir une lecture structurée :

- mentions légales présentes ou absentes ;
- politique de confidentialité présente ou absente ;
- page cookies / traceurs présente ou absente ;
- cohérence entre les documents ;
- acteurs identifiés ;
- finalités déclarées ;
- droits RGPD annoncés ;
- moyens de contact ;
- zones floues ou contradictoires.

### Journal local compréhensible

L'interface peut produire un journal local des actions réalisées par l'utilisateur :

- clics sur les sections ;
- ouverture des panneaux d'explication ;
- audit lancé ;
- données saisies ou volontairement indiquées ;
- résultat produit ;
- export demandé.

Ce journal doit être visible, compréhensible et contrôlable par l'utilisateur.

Par défaut, ce journal reste dans le navigateur. Aucune transmission à un serveur ne doit être effectuée sans action explicite.

### Restitution simple

Le résultat doit être exprimé en langage clair :

```text
Ce qui est clair
Ce qui manque
Ce qui semble incohérent
Ce qui reste à vérifier
Ce que l'utilisateur peut faire
```

## Domaines d'application initiaux

Les premiers domaines de rapprochement sont :

- DPE / logement ;
- énergie / Linky ;
- audit générique de site web ;
- confidentialité et mentions légales ;
- cookies, traceurs et stockages locaux.

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
parcours possible
+
droit applicable
+
action possible
```

## Verrou associatif

Ce dépôt est lié au projet associatif d'aide à la compréhension des droits aux données personnelles.

La branche associative d'accompagnement des particuliers est non lucrative et ne génère aucun revenu personnel.

Toute valorisation d'algorithmes, d'outils ou de technologies auprès d'entreprises doit être séparée juridiquement, fonctionnellement et comptablement de la branche associative.

## Licence

Apache License 2.0.

Voir `LICENSE` et `NOTICE`.
