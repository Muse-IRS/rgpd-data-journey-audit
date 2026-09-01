# DPE / Logement — Data Journey Example

## Domain result

The user searches for a DPE number and receives a readable summary of public ADEME data when an exact record is found.

## Data journey

```text
Utilisateur
→ saisie d'un numéro DPE
→ navigateur
→ requête vers une source publique ADEME
→ données publiques renvoyées
→ affichage minimisé
→ action possible de vérification ou comparaison documentaire
```

## Data used

- DPE number voluntarily entered by the user.
- Public ADEME record returned when available.
- Public technical information returned by the source, such as energy class, climate class, date, surface, building type or reduced location when available.

## Local data

The interface may display the result locally in the browser.

## Data leaving the browser

The DPE number may leave the browser when a direct request is made to the public ADEME dataset.

## Actors

- User.
- Browser.
- Public ADEME data service when queried.
- Hosting provider for technical connection logs.

## Rights and actions

The interface should help the user distinguish:

- public regulatory data;
- personal housing situation;
- documents held by a landlord, diagnostician or other actor;
- possible GDPR or documentary access request depending on the context.

The interface must not transform the public DPE result into a legal verdict.
