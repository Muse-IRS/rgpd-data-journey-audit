# User Local Storage Explanation

This document defines the public explanation model for browser local storage in the RGPD Data Journey Audit interface.

## Purpose

The interface must not hide local browser storage behind technical language.

The user-facing explanation is:

```text
This interface keeps a small local notebook in your browser.
It shows what the interface wrote locally, why it was written, where it remains, how to display it, how to export it, how to restore it, and how to erase it.
```

## User vocabulary

Prefer:

```text
carnet local du navigateur
journal local
dernier audit local
traces locales visibles
```

Avoid relying only on:

```text
localStorage
Web Storage
client-side persistence
```

The technical term may appear, but it must be explained immediately.

## Local storage keys

The interface may use two public keys:

```text
rgpd-data-journey-audit:local-action-log
rgpd-data-journey-audit:last-local-audit
```

## Key 1 — local action log

The local action log records useful interface actions:

- click on an interface control;
- local reading generated;
- gauge displayed;
- local log displayed;
- JSON export requested;
- form reset;
- local storage explanation displayed;
- local storage inventory displayed;
- local data erased.

This log is a pedagogical trace. It is not hidden analytics and must not become behavioral profiling.

## Key 2 — last local audit

The last local audit may store the latest generated reading so that the user can inspect or restore it.

It may include:

- audited site address entered by the user;
- visible document checks;
- company/entity fields entered by the user;
- SIREN and SIRET if entered by the user;
- where the information was found on the site;
- declared external source consulted or to consult;
- SSF-IRS statuses;
- vigilance gauge result.

This snapshot remains local in the current public version.

## User controls

The interface must provide controls to:

- explain local storage in simple language;
- display what is stored by this interface;
- display the action log;
- export the action log as JSON;
- restore the last local audit;
- erase the action log;
- erase all local data written by this interface.

## Public rule

```text
ACTION UTILISATEUR
→ TRACE LOCALE VISIBLE
→ EXPLICATION SIMPLE
→ CONTRÔLE UTILISATEUR
→ EXPORT / RESTAURATION / EFFACEMENT
```

## Limits

The local journal and the last audit are not certified evidence.

They are useful local traces that help the user understand the behavior of this interface.

The interface can display its own local storage. It cannot freely read another website's local storage from this GitHub Pages page.

Auditing another website's browser storage requires another mode, such as manual input, user-provided capture, browser extension, bookmarklet, or local tool.
