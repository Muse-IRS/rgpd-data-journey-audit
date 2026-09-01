# SSF-IRS Validation Model

This document describes the public validation layer used before showing interpreted audit data in the interface.

The model is intentionally simple and explainable. It does not expose private heuristics, internal matrices, or non-public research methods.

## Public purpose

Before audit information is displayed as a user-facing result, it should be passed through a visible validation state:

```text
OBSERVED_DATA
→ SSF-IRS_PUBLIC_VALIDATION
→ SAT / UNSAT / UNKNOWN
→ USER-FACING_DISPLAY
```

## Status values

### SAT

The information is sufficiently coherent for the public interface.

Examples:

- a SIREN is present and has a valid public format;
- the user indicates that the entity was checked against an official registry;
- no contradiction is declared between the site and the registry information.

### UNSAT

The information is contradicted, structurally invalid, or declared as incoherent.

Examples:

- a SIREN does not contain 9 digits;
- a SIRET does not contain 14 digits;
- the site shows one entity while payment or registry data points to another;
- an address, name, SIREN, or SIRET is declared as inconsistent.

### UNKNOWN

The information is absent, not checked, or insufficient to conclude.

Examples:

- no SIREN is found;
- no SIRET is found;
- the entity is named on the site but not checked against a registry;
- a privacy policy exists but does not clearly identify the controller.

## Public warning

SSF-IRS status is not a legal ruling.

It is a structured reading state that helps the user separate:

- what is declared by the site;
- what is observed by the user;
- what is checked against an external source;
- what remains uncertain;
- what appears contradictory.

## Minimum public pipeline

```text
SITE
→ DECLARED_INFORMATION
→ LOCATION_ON_SITE
→ OFFICIAL_SOURCE_IF_ANY
→ SSF-IRS_STATUS
→ EXPLANATION
→ ACTIONABLE_USER_READING
```
