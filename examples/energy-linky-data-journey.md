# Énergie / Linky — Data Journey Example

## Domain result

The user receives a simple reading of energy values such as annual consumption, subscribed power or estimated cost when prices are voluntarily provided.

## Data journey

```text
Utilisateur
→ saisie volontaire de valeurs issues d'une facture ou d'un contrat
→ calcul local dans le navigateur
→ résultat affiché
→ aucune demande de PRM/PDL par défaut
→ distinction entre données locales, fournisseur, Enedis, TIC et services tiers
```

## Data used

- Subscribed power.
- Annual consumption.
- Optional tariff option.
- Optional kWh price.
- Optional annual subscription amount.
- Optional peak/off-peak distribution.

## Data not requested by default

- PRM / PDL.
- Linky identifier.
- Enedis account.
- Supplier account.
- TIC stream.

## Local data

The calculation can remain local in the browser.

## Data leaving the browser

In a local-only version, the entered values should not leave the browser.

## Actors to distinguish

- User.
- Browser.
- Electricity supplier.
- Enedis.
- Optional third-party services.
- Optional TIC / local reading devices.

## Caution

Never assume that Linky data, Enedis data, supplier data, TIC data and user-entered invoice data have the same frequency, purpose, destination or legal regime.

## Rights and actions

The interface should help the user identify which actor to contact depending on the origin of the data:

- supplier for contract, billing and tariff data;
- Enedis for metering and network-related data;
- third-party service for data transmitted to that service;
- local interface or browser for local data controlled by the user.
