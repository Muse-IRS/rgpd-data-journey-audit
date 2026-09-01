# Automatic Site Entity Fetch

This document defines the public v0.2 pipeline for automatic company/entity prefill from an audited URL.

## Purpose

The interface may help the user by pre-filling company/entity fields when information is available from the audited site and from an open public API.

The feature must remain user-triggered, visible, explainable and reversible.

## Core invariant

```text
USER_ACTION
→ FETCH_SITE_IF_ALLOWED
→ EXTRACT_PUBLIC_TEXT
→ FIND_ENTITY_CANDIDATES
→ QUERY_PUBLIC_REGISTRY_API_IF_POSSIBLE
→ PREFILL_EDITABLE_FIELDS
→ SSF-IRS
→ DISPLAY_EXPLANATION
```

## Browser-first limitation

The public GitHub Pages interface runs in the user's browser.

A browser cannot freely read the HTML of any external website. The target website must allow cross-origin reading through its CORS configuration.

If the target website does not allow it, the interface must not hide the failure. It must display `UNKNOWN` and keep the manual fields available.

## Current v0.2 behavior

The v0.2 module:

1. reads the URL entered by the user;
2. accepts HTTPS URLs only;
3. attempts a user-triggered `fetch()` of the target page;
4. parses returned HTML when the browser is allowed to read it;
5. detects useful links such as legal notices, privacy policy, cookies information, terms and contact pages;
6. extracts possible SIREN, SIRET, legal form, entity name and address from visible text;
7. queries the open API Recherche d'Entreprises when a SIREN, SIRET or entity name is available;
8. pre-fills the existing manual fields;
9. regenerates the SSF-IRS reading and the vigilance gauge;
10. writes a visible local trace in the browser journal.

## API used

The public module uses:

```text
https://recherche-entreprises.api.gouv.fr/search
```

Search order:

```text
SIREN → SIRET → entity name
```

The API result is treated as a registry enrichment, not as an automatic legal verdict.

## SSF-IRS rule

The automatic module must never bypass SSF-IRS.

```text
EXTRACTED_VALUE
+
REGISTRY_RESULT
+
LOCATION_ON_SITE
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
- which query was sent to the public registry API;
- how many results were returned;
- which values were used to prefill the panel;
- that fields remain editable.

## Privacy rule

No hidden background scan.

No automatic fetch before user action.

No server-side storage in this version.

No credentials sent with the site fetch.

No API key.

## Manual fallback

If automatic reading fails:

```text
SITE_FETCH = UNKNOWN
REGISTRY_FETCH = UNKNOWN
MANUAL_FIELDS = ENABLED
USER_EXPLANATION = DISPLAYED
```

The user can still paste the relevant information manually from legal notices, privacy policy, CGV, contact page, footer or payment page.

## Future v0.3

A later version may add a lightweight public backend or serverless proxy to fetch audited pages server-side when browser CORS blocks direct reading.

That future layer must remain minimal and must not store audit content by default.
