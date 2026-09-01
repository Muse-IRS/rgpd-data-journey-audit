# Automatic Site Entity Fetch

This document defines the public pipeline for automatic company/entity prefill from an audited URL.

## Purpose

The interface may help the user by pre-filling company/entity fields when information is available from the audited site and from public open sources.

The feature must remain user-triggered, visible, explainable, reversible and limited to identity data.

## Public-source policy

```text
NO_ACCOUNT
+
NO_TOKEN
+
NO_SECRET
+
PUBLIC_IDENTITY_DATA_ONLY
```

The public interface must not depend on:

- a private account;
- an API token;
- an API key;
- a paid endpoint;
- hidden scraping credentials;
- financial enrichment.

## Minimal data scope

The automatic layer may recover or display only what is useful to attach a website to a real entity:

- denomination or displayed entity name;
- legal form;
- SIREN;
- SIRET;
- declared address;
- activity or NAF/APE code when available;
- simple administrative status when available;
- source consulted;
- request URL;
- location where the information was found on the audited site.

It must not recover or display financial analysis data:

- turnover;
- profits;
- annual accounts;
- balance sheets;
- debts;
- ratios;
- detailed executive profiling;
- beneficial ownership;
- legal document bundles.

## Core invariant

```text
USER_ACTION
→ BUILD_VISIBLE_REQUESTS
→ FETCH_SITE_IF_ALLOWED
→ EXTRACT_PUBLIC_TEXT
→ FIND_ENTITY_CANDIDATES
→ QUERY_NO_TOKEN_PUBLIC_SOURCE_IF_POSSIBLE
→ DISPLAY_REQUEST_DIAGNOSTIC
→ PREFILL_EDITABLE_FIELDS
→ SSF-IRS
→ DISPLAY_EXPLANATION
```

## Browser-first limitation

The public GitHub Pages interface runs in the user's browser.

GitHub Pages is only the static host of the interface. It is not the audit server, not an intermediary and not a proxy.

A browser cannot freely read the HTML of any external website. The target website must allow cross-origin reading through its CORS configuration.

If the target website does not allow it, the interface must not hide the failure. It must display `UNKNOWN`, expose the attempted request and keep the manual fields available.

## Request recovery rule

The user must be able to recover the request even when no data is extracted.

The diagnostic output must show:

- target URL normalized by the interface;
- exact site request attempted;
- request method;
- CORS mode;
- credentials mode;
- HTTP status when available;
- CORS or fetch error when available;
- public API request URL;
- public web lookup links;
- whether account/token/secret is required.

## Public lookup links

The interface may generate direct public links for manual verification:

```text
API Recherche d’Entreprises
Annuaire Entreprises
Pappers public web search
```

These links are built from:

```text
SIRET → SIREN → entity name → domain hint
```

Pappers is treated as a public web lookup/enrichment source when consulted without account. The Pappers API is not used in the public front-end because it requires a token.

## Current behavior

The module:

1. reads the URL entered by the user;
2. accepts HTTPS URLs only;
3. builds public source links immediately;
4. attempts a user-triggered `fetch()` of the target page;
5. parses returned HTML when the browser is allowed to read it;
6. detects useful links such as legal notices, privacy policy, cookies information, terms and contact pages;
7. attempts to read same-origin useful pages when available and allowed;
8. extracts possible SIREN, SIRET, legal form, entity name and address from visible text;
9. queries the open API Recherche d'Entreprises when a SIREN, SIRET, entity name or domain hint is available;
10. displays the exact request diagnostic;
11. pre-fills the existing manual fields;
12. regenerates the SSF-IRS reading and the vigilance gauge;
13. writes a visible local trace in the browser journal.

## API used

The public module may use:

```text
https://recherche-entreprises.api.gouv.fr/search
```

The request is visible in the diagnostic output and requires no account, no API key and no token.

## SSF-IRS rule

The automatic module must never bypass SSF-IRS.

```text
EXTRACTED_VALUE
+
PUBLIC_SOURCE_VALUE
+
LOCATION_ON_SITE
+
REQUEST_DIAGNOSTIC
+
USER_VISIBLE_TRACE
=
SAT / UNSAT / UNKNOWN
```

## Output rule

The module must display:

- whether the site fetch succeeded or failed;
- why it failed when blocked;
- what was extracted;
- which request was attempted;
- which public lookup links were built;
- which query was sent to the public registry API;
- how many results were returned;
- which minimal identity values were used to prefill the panel;
- that fields remain editable.

## Privacy rule

No hidden background scan.

No automatic fetch before user action.

No server-side storage in this version.

No credentials sent with the site fetch.

No API key.

No API token.

No account-dependent data.

## Manual fallback

If automatic reading fails:

```text
SITE_FETCH = UNKNOWN
REQUEST_DIAGNOSTIC = DISPLAYED
PUBLIC_LOOKUP_LINKS = DISPLAYED
MANUAL_FIELDS = ENABLED
USER_EXPLANATION = DISPLAYED
```

The user can still open the generated public links and paste the relevant information manually from legal notices, privacy policy, CGV, contact page, footer, Annuaire Entreprises or Pappers public pages.

## Future v0.3+ option

A later version may add an extraction link, bookmarklet or browser extension so that the user can capture data directly from the audited page context and then re-inject it into the interface.

That mode must remain explicit, local, visible and limited to the same minimal public identity data scope.