# Data Journey Model

For each audited site, service or domain, the public reading follows this structure:

```text
DOMAIN
→ USER_ACTION
→ RESULT
→ DATA_USED
→ DATA_SOURCE
→ LOCAL_DATA
→ DATA_LEAVING_BROWSER
→ ACTORS
→ RECIPIENTS
→ PURPOSES
→ LEGAL_BASIS
→ RETENTION
→ RIGHTS
→ ACTIONS
```

The goal is not to accuse.
The goal is to make the data path understandable.

## Public invariant

```text
DOMAIN_RESULT
+
DATA_JOURNEY
+
DATA_RIGHTS
=
PUBLIC_UNDERSTANDING
```

## Minimum reading grid

Each result should distinguish:

- facts observed;
- declarations found in documents;
- user-provided data;
- public data;
- inferred or derived data;
- missing information;
- unclear information;
- possible next actions.

## Simple restitution format

```text
Ce qui est clair
Ce qui manque
Ce qui semble incohérent
Ce qui reste à vérifier
Ce que l'utilisateur peut faire
```

## Local-first principle

When a feature can be executed locally in the browser, it should remain local by default.

If data leaves the browser, the interface must explain:

- what leaves;
- where it goes;
- for which purpose;
- whether it is necessary;
- whether the user has a choice;
- how the user can delete, export or contest the resulting information when applicable.
