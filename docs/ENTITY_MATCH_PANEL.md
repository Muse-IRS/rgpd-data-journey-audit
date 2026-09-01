# Entity Match Panel

The entity match panel explains which real-world legal entity appears to be connected to an audited site.

It is designed for public, non-specialist understanding.

## Purpose

The panel helps the user answer:

```text
Who is behind this site?
Where is this information written on the site?
Can it be compared with a public registry?
Is the information coherent, missing, or contradictory?
```

## Minimum displayed fields

The public interface should display, when available:

| Field | Meaning |
|---|---|
| Legal name | Name of the company, association, public body, or operator displayed by the site |
| Legal form | SARL, SAS, EI, association, public body, or other declared form |
| SIREN | 9-digit French legal entity identifier |
| SIRET | 14-digit establishment identifier |
| Address | Address displayed on the site or found in the legal notice |
| Location on site | Footer, legal notice, privacy policy, contact page, terms, checkout, or other location |
| External source | Official registry, Annuaire Entreprises, RNE, Sirene, Pappers, or another declared source |
| SSF-IRS status | SAT, UNSAT, or UNKNOWN |

## Location is mandatory context

A value without its location is incomplete.

Example:

```text
SIREN: 123 456 789
Location on site: legal notice
External source: Annuaire Entreprises
SSF-IRS: SAT
```

## Public caution

This panel does not certify that a site is reliable or fraudulent.

It shows whether the identity information is visible, traceable, and coherent enough for the user to decide whether further verification is needed.
