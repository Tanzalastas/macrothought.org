---
name: context-packs
description: Assemble the minimum context an agent needs for one task into a versioned pack instead of pointing it at everything. Use this when briefing agents on scoped work, when agents drift because they read too widely, or when stale briefings produce work built against interfaces that no longer exist.
---

# Context Packs

An agent pointed at everything reads whatever it stumbles into and builds a
private, partial picture of the system. Two agents given the same open-ended
tour come back with different pictures. A context pack replaces the tour with a
compiled briefing: the minimum an agent needs to do one task correctly, and no
more.

## What goes in a pack

- **The task**: the requirement statement, by ledger row id where one exists,
  with the acceptance criterion the verifier will run.
- **Constraints**: the hard rules that bind this task. File size limits and
  forbidden dependencies, for example. Include only the ones that apply.
- **Interfaces**: the exact signatures and schemas the work must fit. Copied
  text, never "see the auth module".
- **Prior decisions**: rulings already made that this task must respect, each
  with a one-line reason so the agent does not relitigate them.

What stays out: the rest of the codebase and anything else the agent could
wander into. If the agent needs a file, the pack names that file. Excess
context does worse than waste tokens; it invites the agent to satisfy
constraints nobody set and to copy patterns from code it was never meant to
touch.

## Packs are versioned

Every pack carries a version and a list of its sources with their revisions.
Stamp the pack version into the work it produces, in the commit message or the
ledger evidence. When output looks wrong later, the first question is which
pack the agent was holding, and the stamp answers it.

## Rebuild when sources change

A pack is a snapshot, and snapshots go stale. When any source changes, an
interface file or a decision record included, every pack built from it is
suspect. Rebuild affected packs before dispatching more work with them, and
treat in-flight work under a stale pack as needing re-verification against the
current interfaces. The cheap mechanical form: record source hashes at build
time and compare before each dispatch. A hash mismatch means rebuild first.

## Compile mechanically where possible

The best pack builder is a script that extracts named sections from named
sources. A model summarizing the codebase into a briefing introduces a second
uncontrolled author into every task. Reserve model judgment for choosing which
sources matter; let the extraction itself be verbatim, so an error in a pack is
traceable to an error in a source.

## Rules

- One pack per task. A pack that serves three tasks serves none of them well.
- Interfaces appear as copied text, never as pointers to go read something.
- Packs carry a version and source identity, and the version is stamped into
  the resulting work.
- Any source change invalidates the pack. Rebuild before reuse.
