# Effective rights public page

This document records the public integration logic for the `public/effective-rights/` page.

## Purpose

The page translates the development-thread concept of effective GDPR rights into a public, user-facing explanation.

It is not a legal claim layer and does not expose private research methods.

## Public formula

```text
WRITTEN_RIGHT
+
OBTAINED_DATA
+
UNDERSTANDABLE_RESPONSE
+
PRESERVED_TRACE
=
EFFECTIVE_RIGHT
```

French public wording used on the page:

```text
DROIT ÉCRIT
+
DONNÉES OBTENUES
+
RÉPONSE COMPRÉHENSIBLE
+
PREUVE CONSERVÉE
=
DROIT EFFECTIF
```

## Public sequence

```text
SITE
-> DOCUMENTS
-> DATA
-> ACTORS
-> RIGHTS
-> ACTION
```

The page should help a user ask practical questions:

- what data are used;
- who processes them;
- why they are processed;
- how long they may be retained;
- to whom they may be transmitted;
- how to ask for a copy;
- how to verify a response;
- what to do if a response is incomplete, unclear or contradictory.

## Divergence wording

The page uses a bounded public formulation:

```text
DECLARED - VERIFIABLE = POINT_TO_CLARIFY
```

A divergence is not presented as automatic illegality. It is a point requiring clarification, source comparison or further action.

## Boundary

The page must not contain:

- personal data;
- real case files;
- administrative documents;
- private prompts;
- internal matrices;
- unpublished research protocols;
- legal conclusions presented as final determinations.

## Relation to platform-first transition

This page is part of the platform-first RGPD Data Journey public surface.

It may support public-interest use by individuals, but it does not define the active legal structure as an association by default.

## Integration status

- Public page added: `public/effective-rights/index.html`.
- No engine change.
- No data processing change.
- No external request added.
- No storage key added.

A later PR may add a visible link from the main audit page once the public navigation wording is reviewed.
