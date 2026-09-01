# Local Action Journal

The public interface may keep a local journal of user actions to make the browser-side process visible.

## Purpose

The journal explains to the user what happened during an audit session:

- button clicked;
- section opened;
- form reset;
- local reading generated;
- local log displayed;
- JSON export requested;
- local log cleared.

## Storage

The journal is stored in the browser using `localStorage` under this key:

```text
rgpd-data-journey-audit:local-action-log
```

## Default rule

The journal remains local by default.

It must not be sent automatically to a server.

## User controls

The user must be able to:

- display the journal;
- export it;
- erase it.

## Minimization

The journal should remain limited to what is useful for understanding the interface behavior.

It should avoid collecting hidden behavioral analytics or unnecessary profiling information.

## Public explanation

The interface must explain simply:

```text
This happened in your browser.
This was stored locally.
This was not sent by this version.
You can export it.
You can erase it.
```
