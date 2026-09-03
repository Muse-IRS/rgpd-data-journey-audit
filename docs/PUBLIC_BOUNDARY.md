# Public Boundary

This repository is public.

It may contain:

- public-facing documentation;
- user-facing explanations;
- minimal interface code;
- examples with synthetic or public data only;
- generic audit structures;
- domain-level data journey explanations;
- public explanations of data value, personalization, recommendation systems and user controls.

It must not contain:

- personal data;
- private case files;
- administrative documents;
- credentials;
- secrets;
- internal prompts;
- private heuristics;
- private matrices;
- unpublished research protocols;
- backtests;
- legal claims presented as final determinations.

Publication rule:

```text
PRIVATE_METHOD -> PUBLIC_RESULT
```

The public repository explains what the user needs to understand and act.
It does not expose the private construction method.

## Practical rule

Any public output must be limited to:

```text
what is used
where it comes from
where it may go
who may process it
why it is processed
how long it may be kept
which rights may apply
how the user can act
what personalization is declared
what economic value is identifiable
what remains UNKNOWN
```

Additional epistemic locks:

```text
DATA_MONETIZATION != DIRECT_DATA_SALE
DECLARED_DATA_SHARING != DIRECT_DATA_SALE
AD_AFTER_CONVERSATION != PROOF_OF_MICROPHONE_USE
UTILITY != AUTOMATIC_LEGITIMACY
```

No private case material belongs in this repository.
