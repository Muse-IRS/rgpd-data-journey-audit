# Information Waste — adapter public RGPD

## Objet

Cet adapter public ajoute une lecture simple de la friction informationnelle au parcours des données. Il ne cherche pas à décider qu'une information est « bonne » ou « mauvaise » et ne produit aucun verdict juridique automatique.

Une information est ici considérée comme **à traiter** lorsqu'elle ne peut pas encore être utilisée proprement sans opération supplémentaire de contexte, provenance, datation, relation, comparaison ou qualification.

```text
INFORMATION
-> CONTEXT
-> PROVENANCE
-> TIME
-> RELATION
-> QUALIFICATION
-> PUBLIC_UNDERSTANDING
```

## Ce que « déchet informationnel » ne signifie pas

```text
DECHET_INFORMATIONNEL != INFORMATION_FAUSSE
DECHET_INFORMATIONNEL != INFORMATION_A_SUPPRIMER
DIVERGENCE != CONTRADICTION
ABSENCE != INEXISTENCE
UNKNOWN != ERREUR
```

Le terme décrit un **coût de traitement** pour un usage donné.

## Catégories publiques de lecture

L'interface peut aider à repérer notamment :

- `DUPLICATE` — information répétée ou copie dont la relation à l'original doit être comprise ;
- `OBSOLETE_FOR_USE` — version ancienne pour l'usage courant, sans effacer sa valeur historique ;
- `MISSING_PROVENANCE` — origine insuffisamment identifiée ;
- `MISSING_CONTEXT` — information isolée de son contexte ;
- `FRAGMENTED` — éléments utiles répartis entre plusieurs pages, documents ou services ;
- `DIVERGENT` — éléments qui ne convergent pas encore et nécessitent comparaison ;
- `OVERCERTAINTY_RISK` — formulation plus certaine que ce que les éléments observés permettent ;
- `UNKNOWN` — état insuffisamment déterminé.

Ces catégories sont descriptives. Elles n'établissent pas à elles seules une fraude, une non-conformité RGPD, une responsabilité ou une intention.

## Sorties publiques

```text
REUSE
NEEDS_CONTEXT
NEEDS_PROVENANCE
DIVERGENT
UNKNOWN
OBSOLETE_FOR_USE
DUPLICATE_WITH_LINEAGE
DISCARD_WITH_JUSTIFICATION
```

`DISCARD_WITH_JUSTIFICATION` signifie qu'un élément peut être écarté d'une restitution ou d'un usage déterminé après explication. Il ne commande pas la suppression d'une preuve, d'une source, d'un historique ou d'une donnée soumise à une obligation de conservation.

## Mapping avec la restitution existante

Le modèle s'intègre à la lecture déjà proposée par l'interface :

```text
Ce qui est clair
Ce qui manque
Ce qui semble incohérent
Ce qui reste à vérifier
Ce que l'utilisateur peut faire
Ce qui reste localement dans le navigateur
Ce qui a été récupéré volontairement
```

La couche « déchets informationnels » ajoute la question :

```text
Quel traitement manque encore pour rendre cette information intelligible et réutilisable ?
```

## Égalité de capacité de traitement

Le projet distingue accès à l'information et capacité à la traiter :

```text
INFORMATIONAL_EQUALITY
=
ACCESS
+
PROCESSING_CAPACITY
+
UNDERSTANDING
+
TRACEABILITY
```

L'objectif public est de réduire le coût individuel de mise en intelligibilité : rendre visibles les relations, les manques, les divergences, les limites et les actions possibles dans un langage accessible à un non-spécialiste.

## Frontière RGPD

Cette couche respecte les verrous existants :

- pas de verdict juridique automatique ;
- pas de certitude supérieure aux éléments observés ;
- `UNKNOWN` reste un résultat valide ;
- la couleur ou le compteur ne suffit jamais à qualifier une situation ;
- provenance, contexte et limites restent visibles ;
- aucune donnée personnelle réelle n'est requise pour documenter le modèle.

## Relation avec la méthode interne

Le présent fichier expose seulement le résultat public nécessaire à la compréhension. Les méthodes internes, heuristiques, protocoles expérimentaux et raisonnements de développement ne sont pas publiés ici.

```text
PRIVATE_METHOD -> PUBLIC_RESULT
```
