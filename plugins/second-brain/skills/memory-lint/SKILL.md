---
name: memory-lint
description: Runs deterministic health checks over a knowledge base (orphan notes, oversized notes, dead index pointers, silent store shrinkage) and proves each check can still fail. Use this when building or auditing maintenance automation for an agent memory store, or when a lint report has read "all clean" for weeks.
---

# Memory Lint

## Deterministic, model-free, on a hook

Lint the store with plain filesystem tools such as find and grep. No model in the
loop means the pass costs nothing, runs at every session end, and gives the same
output for the same input. Write results to one report file at the store root.
The report's consumer is the next session: the agent reads it at session start
and acts on the flags. A report nobody reads is a queue without a drain, so wire
the reading into the session ritual before wiring the writing into the hook.

## The checks

- Oversized notes. Flag any note past a size threshold (15 KB works well) as a
  split candidate. Exempt files that are legitimately large by declared type (an
  embedded dashboard is one file by design), and require an explicit marker for
  the exemption rather than a heuristic guess.
- Orphan notes. A note no other note links to is invisible to link-following
  recall. Flag it with its options attached: link it or delete it.
- Dead index pointers. Every line of the loaded index must point at a note that
  exists. A pointer to a deleted note poisons recall silently, because recall
  trusts the index without opening files.
- Untriaged capture. Count raw inbox lines awaiting triage. A rising count means
  the capture-to-note pipeline has stalled.
- Aging claims. Count uncertain tags and TODO markers, then route them to the
  re-verification queue instead of re-listing each one. The lint counts; the
  queue drains.
- Silent store shrinkage. For any database or binary store of record, persist
  its size between runs. Warn when the store vanishes or drops below half its
  previous size. A store that quietly empties must fail lint, because every
  downstream recall would otherwise keep succeeding over nothing.

## Positive-control your lint

A check that cannot fail is decoration, and it will read as evidence. The
recurring defect shape: two different facts collapse into one signal. "No
duplicates found" turns out to mean "the scanner looked in a directory that had
moved". "Clean" turns out to mean "the check was skipped". Unknown must be
distinguishable from zero.

So control your controls:

- Seed a failure and watch it flag. Create a throwaway orphan note and an index
  pointer to nowhere, run lint, and confirm both appear in the report. A seeded
  defect that stays green just became your highest-priority bug.
- Distinguish "none found" from "nothing scanned". Make each check report the
  population it examined: "checked 412 notes, 0 orphans". A zero next to a zero
  population is an alarm, never a pass.
- Re-ask after every refactor. Moving a directory or renaming a report can
  silently empty a check's input, and the check prints "none" either way.
- Render and look. Read the report as its consumer will. A section that has said
  "none" for weeks of runs has earned a seeded-failure test today.

## Failure is the product

The lint exists to produce true alarms. Judge it by the defects it catches and
the seeded controls it passes, never by how green the report looks.
