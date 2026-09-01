# Automatic Site Entity Fetch

This document defines the public pipeline for company/entity prefill from an audited URL, public search term, public registry link or pasted public result.

## Purpose

The interface may help the user by pre-filling company/entity fields when information is available from public open sources.

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
- location where the information was found on the audited site or public result.

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
→ BUILD_PUBLIC_LINKS
→ OPEN_PUBLIC_SOURCE_IF_NEEDED
→ COPY_VISIBLE_PUBLIC_RESULT
→ PASTE_IMPORT
→ QUERY_NO_TOKEN_PUBLIC_SOURCE_IF_POSSIBLE
→ DISPLAY_REQUEST_DIAGNOSTIC
→ PREFILL_EDITABLE_FIELDS
→ SSF-IRS
→ DISPLAY_EXPLANATION
```

## Simplified public lookup workflow

The preferred browser-first workflow is:

```text
URL_OR_ENTITY_INPUT
→ PUBLIC_QUERY_SEED
→ PUBLIC_LINKS
→ USER_VISIBLE_RESULT
→ PASTED_TEXT_IMPORT
→ MINIMAL_IDENTITY_EXTRACTION
→ API_RECHERCHE_ENTREPRISES_OPTIONAL_CHECK
→ SSF-IRS
```

Accepted public query inputs include:

```text
CAPEVOL
491567798
49156779800013
https://annuaire-entreprises.data.gouv.fr/etablissement/49156779800013
https://www.pappers.fr/recherche?q=capevol
pappers/capevol
```

## Public links generated

The interface may generate direct public links for manual verification:

```text
API Recherche d’Entreprises
Annuaire Entreprises
Annuaire établissement direct when a SIRET is available
Pappers public web search
Google → Pappers locator
```

These links are built from:

```text
SIRET → SIREN → entity name → domain hint
```

Pappers is treated as a public web lookup/enrichment source when consulted without account. The Pappers API is not used in the public front-end because it requires a token.

Google is treated only as a locator that helps find a public Pappers page. It is not treated as the registry source of truth.

## Browser-first limitation

The public GitHub Pages interface runs in the user's browser.

GitHub Pages is only the static host of the interface. It is not the audit server, not an intermediary and not a proxy.

A browser cannot freely read the HTML of any external website. The target website must allow cross-origin reading through its CORS configuration.

Therefore the robust iPad-compatible path is not to depend on cross-domain crawling. The robust path is:

```text
BUILD_PUBLIC_LINKS
→ USER_OPENS_PUBLIC_RESULT
→ USER_COPIES_VISIBLE_TEXT
→ USER_PASTES_TEXT_IN_INTERFACE
→ LOCAL_EXTRACTION
```

## Request recovery rule

The user must be able to recover the request even when no data is extracted.

The diagnostic output must show:

- normalized query;
- query type: SIRET, SIREN, entity name, public URL or domain hint;
- exact public links built;
- public API request URL;
- whether account/token/secret is required;
- minimal data scope;
- excluded financial/documentary data;
- API result count when an API call succeeds;
- selected registry values when available;
- editable fields populated by the interface.

## API used

The public module may use:

```text
https://recherche-entreprises.api.gouv.fr/search
```

The request is visible in the diagnostic output and requires no account, no API key and no token.

## Pasted public result import

The user may paste text copied from:

- Pappers public page;
- Annuaire Entreprises page;
- Google search result snippet pointing to Pappers or Annuaire;
- audited site's legal notices;
- audited site's footer or contact page.

The interface may extract:

```text
denomination
legal form
SIREN
SIRET
address
NAF/APE or activity wording
```

Example:

```text
La société CAPEVOL est une SARL enregistrée sous le numéro SIREN 491 567 798, spécialisée dans le conseil pour les affaires et la gestion.
```

Expected extraction:

```text
entityName = CAPEVOL
legalForm = SARL
siren = 491567798
activity = conseil pour les affaires et la gestion
```

## SSF-IRS rule

The automatic module must never bypass SSF-IRS.

```text
EXTRACTED_VALUE
+
PUBLIC_SOURCE_VALUE
+
LOCATION_OR_PUBLIC_RESULT
+
REQUEST_DIAGNOSTIC
+
USER_VISIBLE_TRACE
=
SAT / UNSAT / UNKNOWN
```

## Output rule

The module must display:

- which request was built;
- which public lookup links were built;
- whether direct API verification succeeded;
- what was extracted from pasted public text;
- which minimal identity values were used to prefill the panel;
- that fields remain editable;
- why CORS may still block direct site reading when attempted.

## Privacy rule

No hidden background scan.

No automatic fetch before user action.

No server-side storage in this version.

No credentials sent with the site fetch.

No API key.

No API token.

No account-dependent data.

## Manual fallback

If automatic API verification fails:

```text
PUBLIC_LOOKUP_LINKS = DISPLAYED
REQUEST_DIAGNOSTIC = DISPLAYED
PASTE_IMPORT = ENABLED
MANUAL_FIELDS = ENABLED
USER_EXPLANATION = DISPLAYED
```

The user can still open the generated public links and paste the relevant information manually from legal notices, privacy policy, CGV, contact page, footer, Annuaire Entreprises or Pappers public pages.

## Future v0.3+ option

A later version may add an extraction link, bookmarklet or browser extension so that the user can capture data directly from the audited page context and then re-inject it into the interface.

That mode must remain explicit, local, visible and limited to the same minimal public identity data scope.
