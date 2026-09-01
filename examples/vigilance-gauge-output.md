# Vigilance Gauge — Example Output

This example shows the public wording expected from the vigilance gauge.

It does not classify a site as fraudulent. It gives a readable vigilance level and explains why.

## Audited site

`https://example.org`

## Gauge result

```text
Level: Vigilance recommended
Zone: yellow
Orientation score: 52 / 100
```

## Short explanation

The site contains a privacy policy and some legal information, but important elements remain unclear: retention periods, legal bases, recipients and entity verification.

## What is clear

- A privacy policy is present.
- A legal notice is present.
- A contact method is displayed.

## What is missing

- Retention periods are not clearly identified.
- Legal bases are not clearly identified.
- The controller's full identity should be verified against an official registry.

## What remains unclear

- Third-party services are mentioned without a clear list of recipients.
- Cookie or local storage information remains incomplete.

## Possible next actions

- Compare legal notice, privacy policy and cookie information.
- Check the declared SIREN/SIRET or legal entity against an official source.
- Keep screenshots or page captures before contacting the site.
- Ask the controller for recipient categories, retention periods and legal bases.

## High alert example

```text
Level: High documentary alert
Zone: red
Orientation score: 84 / 100
```

Possible reasons:

- no legal entity identified;
- no privacy policy;
- no rights contact;
- company not found in official registries;
- payment recipient different from the declared seller.

Public wording should remain cautious:

```text
This reading does not prove fraud. It identifies strong documentary alert signals requiring verification before any transmission of data or payment.
```
