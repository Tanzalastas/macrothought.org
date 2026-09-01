---
name: sabotage-and-positive-controls
description: Proves a check works by forcing it to fail on purpose with planted defects, and confirms clean input stays quiet. Use this before trusting any new check, scanner, or gate leg, and again after refactors to the check or to the system it watches.
---

# Sabotage and Positive Controls

A check whose failing branch has never executed is unproven, no matter how green it looks. The
only proof that a check works is watching it catch something. Borrow the discipline every wet
lab already has: run controls.

## Positive control: plant a defect, watch it fire

Before trusting a new check, deliberately create the exact condition it exists to catch and
confirm the verdict flips.

- New secret scanner: commit a fake key on a scratch branch and confirm the scan blocks it.
- New release-gate condition: record a failing audit against a test requirement and confirm
  the gate refuses to pass.
- New generated-file guard: hand-edit one generated file and confirm the guard flags it.
- New metric or chart: feed it data that should look bad and confirm it looks bad.

If the verdict does not flip, you found the defect before it cost anything. This scales: a
mechanical sweep that breaks each check's precondition and requires the flip found in minutes
an instance that days of incident-driven debugging had missed.

## Negative control: clean input stays quiet

The mirror test. Run the check against input you know is good and require silence. A check
that accuses clean input is broken in the opposite direction, and it trains people to ignore
it. One guard compared generated output against its raw template and failed even a freshly
generated file, because the generator post-processes the template after injecting data.
Without a negative control that guard would have cried wolf on untouched output, permanently.
An accusation you cannot reproduce on known-good input is a bug in the check rather than a
finding.

## Sabotage before trust: the ritual

1. Write the failing case first. Before a check becomes load-bearing, produce the input that
   must make it fail and watch it fail.
2. Write the passing case and watch it pass.
3. Keep both as regression tests beside the check. The planted defect becomes a permanent
   fixture, so the check's ability to fail is itself under test from then on.
4. Before making any signal load-bearing, ask what generates it. One gate nearly failed every
   build on a "refusal spike" generated entirely by its own test suite exercising a guard that
   was working correctly.

## When to re-run controls

Controls decay. Re-run them:

- **After refactoring the check** or anything it imports. A probe goes stale the same way a
  check does; a stale probe once reported a healthy check as unfalsifiable because the rewrite
  no longer called the function the probe was breaking.
- **After the checked system changes shape.** The nastiest failures need no change to the
  check at all: code moved to a new file and a grep-based check began scanning nothing,
  reporting clean because it had stopped looking. No diff touched the check, so review could
  never catch it. Only a re-run positive control catches it.
- **On a schedule** for anything guarding a release or production. Periodically re-ask whether
  each check can still fail.

## Check the harness before believing the result

A harness error reads exactly like a pass, and exactly like a refutation. A missing keyword
argument, a renamed module, a screenshot cropped short, a truncated capture window: each has
produced a convincing "fixed" or "broken" verdict that was neither. When a control run returns
a surprising result, especially a convenient one, verify the harness first.

## Report control coverage by name

Track which checks have controls and name the ones that do not. "20 probed, 0 failures" reads
as full coverage even when most checks had no probe at all. An instrument that hides its blind
spots is the thing it exists to catch.
