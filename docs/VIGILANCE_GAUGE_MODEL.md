# Vigilance Gauge Model

The vigilance gauge is a public visual component for RGPD Data Journey Audit.

It does not certify that a site is safe, unsafe, legitimate or fraudulent. It gives a readable level of documentary vigilance based on visible declarations, missing information, entity coherence and data journey transparency.

## Purpose

The gauge helps a non-specialist user understand quickly whether the observed site or interface appears:

- sufficiently coherent at first reading;
- incomplete and requiring caution;
- strongly unclear or contradictory.

The gauge must always be accompanied by explanations.

```text
SITE
+
LEGAL_ENTITY
+
DATA_JOURNEY
+
DATA_RIGHTS
+
RISK_SIGNALS
=
VIGILANCE_LEVEL
```

## Public wording

Preferred wording:

```text
Compteur de vigilance
```

Avoid:

- fraud score;
- scam score;
- certified fraudulent site;
- legally reliable site;
- safe at 100%.

Use instead:

- observed coherence;
- documentary vigilance;
- alert signals;
- elements to verify;
- possible next actions.

## Zones

### Green — observed coherence

The site or interface provides several coherent signals:

- legal notice present;
- privacy policy present;
- rights contact present;
- legal entity identified;
- registry match indicated;
- no strong contradiction declared by the user.

Public wording:

```text
Cohérence observée
```

### Yellow — vigilance

The site or interface is partially documented but important elements are missing or unclear:

- retention periods missing;
- legal bases missing;
- cookie information unclear;
- external recipients not identified;
- legal entity only partially identified;
- local storage or tracking not explained.

Public wording:

```text
Vigilance recommandée
```

### Red — high alert

The site or interface presents strong documentary inconsistencies or severe missing information:

- no identifiable legal entity;
- SIREN/SIRET or company information inconsistent;
- company not found in official registries;
- payment entity different from declared seller;
- missing seller identity;
- no legal notice;
- no privacy policy;
- no way to exercise data rights.

Public wording:

```text
Alerte documentaire élevée
```

## Calculation principle

The public interface may compute a simple orientation score from declared observations.

This score is not a legal determination. It is an aid to reading.

```text
missing mandatory information
+
unclear data journey
+
entity mismatch
+
unexplained storage or recipients
=
higher vigilance level
```

Positive coherence signals can lower vigilance, but they must not cancel a critical inconsistency.

Example:

```text
A privacy policy exists,
but the declared SIREN does not match the company name.
=> high vigilance remains justified.
```

## Required explanation under the gauge

Every gauge position must display:

1. a short level label;
2. the main reasons;
3. what is clear;
4. what is missing;
5. what remains unclear;
6. possible next actions.

## Public boundary

The gauge must not expose internal heuristics, private matrices, case files or unpublished research logic.

It must remain:

- simple;
- explainable;
- auditable;
- non-accusatory;
- reversible when new information is added.
