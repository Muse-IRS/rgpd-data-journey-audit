# Local Action Journal

The public interface keeps a local, user-visible journal of interface actions to make browser-side processing understandable.

## Purpose

The journal explains to the user what happened during an audit session:

- button clicked;
- local storage explanation displayed;
- local storage inventory displayed;
- form reset;
- local reading generated;
- vigilance gauge generated;
- SSF-IRS status summary generated;
- company/entity panel generated;
- local log displayed;
- JSON export requested;
- local log cleared;
- last local audit restored;
- all local data erased.

## Storage keys

The interface may use two `localStorage` keys:

```text
rgpd-data-journey-audit:local-action-log
rgpd-data-journey-audit:last-local-audit
```

## Local action log

The first key stores the action journal.

It records useful events in a readable way:

```text
when
what happened
which page
which interface control was used
which result was generated
```

The journal is capped to the latest entries to avoid uncontrolled accumulation.

## Last local audit

The second key stores the latest local audit snapshot.

It allows the user to restore the previous audit into the form and result display.

The snapshot may contain:

- audited site address entered by the user;
- document checkboxes;
- company/entity fields;
- SIREN and SIRET if entered;
- where each information was found on the audited site;
- declared external source;
- SSF-IRS statuses;
- vigilance score and gauge label.

## Default rule

The journal and the last local audit remain local by default.

They must not be sent automatically to a server.

## User controls

The user must be able to:

- display a simple explanation;
- display the local storage inventory;
- display the action journal;
- export the action journal;
- restore the last local audit;
- erase the action journal;
- erase all local data written by this interface.

## Minimization

The journal should remain limited to what is useful for understanding the interface behavior.

It should avoid hidden behavioral analytics or unnecessary profiling information.

When full user-entered data are stored for restoration, the interface must make this visible and erasable.

## Public explanation

The interface must explain simply:

```text
This happened in your browser.
This was stored locally.
This was not sent by this version.
You can display it.
You can export it.
You can restore it.
You can erase it.
```

## Limit

The local journal and the last audit snapshot are not certified evidence.

They are useful local traces controlled by the user.
