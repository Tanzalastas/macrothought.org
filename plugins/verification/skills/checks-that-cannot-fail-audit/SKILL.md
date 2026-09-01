---
name: checks-that-cannot-fail-audit
description: Audits any check, gate, or metric for the defect class where it is structurally incapable of reporting failure. Use this when adding a check to a gate, when a long-green check guards something important, or when a passing result feels too convenient.
---

# Checks That Cannot Fail: The Audit

A check that cannot fail is decoration, and it will read as evidence. The defect class: a check
that runs, reports green, and is structurally incapable of reporting the failure it exists to
prevent. It survives code review because no diff looks wrong, and it survives daily use because
green looks like proof. One team found nineteen instances in five days once they started
looking. All nineteen were one shape wearing different clothes.

## The audit question

For every check, gate, or metric, ask: **what would the world have to look like for this to
tell us it is wrong?** Then describe that world concretely. If you cannot name an input or
state that makes the check fire, the check is unproven no matter how long it has been green. A
check whose failing branch has never executed has never been tested at its actual job.

## The failure shapes catalog

Every shape collapses two different facts into one signal, so the signal can no longer
distinguish them. Audit for each:

- **Wrong predicate.** A gate counts a requirement as "audited" because an audit result exists.
  A recorded FAILURE satisfies it. The signal says audited when it means cleared.
- **Inverted or narrow polarity.** A secret scan whose exit code means "the scanner ran" rather
  than "nothing matched". A comparison against `== "fail"` that lets `"FAIL"` walk through.
- **The target moved.** A duplicate-detection check greps a file the code migrated out of,
  matches nothing, and reports clean forever. No diff ever touched the check, so review cannot
  catch it. Only re-asking "can this still fail" catches it.
- **State merged with verdict.** Work that has not started gets demoted to "failed" because an
  audit swept it. An audit result and a lifecycle state are different facts; a column holding
  both will eventually assert something false.
- **Deferral to a reviewer who never arrives.** A check hardcodes pass and defers the real
  question to an auditor that is rate-limited or switched off. Deferral is honest only if
  something guarantees the reviewer shows up.
- **Reading a window instead of the thing.** A suite check regexes the last few lines of output
  for the summary. One test printing to stdout pushes the summary out of the window and the
  count reads zero. It was reading a window, never the suite.
- **The subject certifying itself.** A function returns `"no_production_writes": true` as a
  literal and a test asserts the field. The claim must be checked from outside the subject.
- **A declared vocabulary the code cannot emit.** A spec enumerates six status flags; two are
  produced by no code path at all. Prose enumerates; code emits. Assert that the declared set
  and the reachable set are equal, and require every member producible from a fixture.
- **A selector matching nothing.** A test filter that selects zero tests passes. A metric that
  reads a file its writer never writes reports a healthy default forever.
- **Implemented but never wired.** A function that is complete, guarded, and tested, with no
  caller on the live path. The test proves the function works and proves nothing about whether
  anything reaches it. Test the live path.

## Audit the instrument too

Whatever tool you use to audit checks needs the same audit. A falsifiability probe goes stale
when a refactor moves its target, and then it calls a falsifiable check unfalsifiable. A
harness that reports successes without reporting coverage hides its blind spots, which is the
exact defect it exists to find: "20 probed, 0 unfalsifiable" once meant only 5 of 13 checks had
any probe at all. Require the instrument to name the checks it did NOT examine. And read its
output as well as its exit code: one crashing probe group silently shrank the total with no
error at the top level.

## Audit for the opposite sign as well

Over-strict is the same mistake inverted. A check that accuses known-good input trains people
to ignore it, precisely when it matters. Before believing any accusation from a check, run the
check against input you know is clean. An accusation you cannot reproduce on known-good input
is a bug in the check rather than a finding.

## The rule underneath

**Unknown must be distinguishable from zero.** Every instance of this class lost that
distinction somewhere: unrun from clean, missing from measured, not-attempted from failed.
When auditing, trace every place the check converts absence into a healthy value, and make the
absence loud instead.
