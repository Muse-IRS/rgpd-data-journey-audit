# Vigilance Gauge Needle

The vigilance gauge uses the visual language of a car speedometer.

The objective is immediate readability:

```text
Green  = observed coherence
Yellow = recommended vigilance
Red    = high documentary alert
```

## Public interpretation

The needle shows the position of the audit reading on a 0 to 100 scale.

- 0 to 34: green zone, low documentary vigilance;
- 35 to 69: yellow zone, vigilance recommended;
- 70 to 100: red zone, high documentary alert.

The percentage must remain visible next to the needle because the user needs both:

- a visual orientation;
- a numerical indication.

## Important limitation

The needle does not prove fraud.

It shows a public vigilance level based on declared, observed, and validated information.

## Required explanation

Every gauge output must include:

- the percentage;
- the textual level;
- the main reasons for the position;
- the distinction between SAT, UNSAT, and UNKNOWN information;
- suggested next actions.

## Technical principle

The browser interface should avoid hidden scoring.

The gauge must be explainable by visible criteria:

- legal notice present or missing;
- privacy policy present or missing;
- rights contact present or missing;
- entity identified or not;
- SIREN/SIRET visible and structurally valid or not;
- official source indicated or not;
- contradiction declared or not;
- payment recipient coherent or unclear.
