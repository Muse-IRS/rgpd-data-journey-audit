# Brand Color System

The RGPD Data Journey Audit interface follows the public Muze-X Lab visual identity used by the DPE and Energy/Linky interfaces.

## Core palette

The public platform palette is dark, precise, and privacy-oriented.

```css
--bg: #081019;
--panel: rgba(17, 29, 43, 0.78);
--panel-strong: #111d2b;
--text: #f4f7fb;
--muted: #aab7c7;
--line: rgba(255, 255, 255, 0.11);
--accent: #b9f3df;
--accent-2: #a9c8ff;
```

## Status colors

The vigilance gauge adds three semantic colors:

```css
--status-sat: #49e1b0;
--status-unknown: #f5c451;
--status-unsat: #ff6b6b;
```

## Meaning

| Color | Status | Meaning |
|---|---|---|
| Green | SAT / coherence | The information is coherent enough for the public reading |
| Yellow | UNKNOWN / vigilance | The information is absent, partial, or not checked |
| Red | UNSAT / alert | The information is invalid, contradicted, or declared incoherent |

## Constraint

Color is never the only indicator.

Every color-coded output must also include text:

- SAT, UNSAT, or UNKNOWN;
- the reason for the status;
- the location where the information was found;
- a suggested next action when needed.
