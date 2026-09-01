---
name: requirement-ledger
description: Track multi-agent work against a persistent ledger of requirements where every claim of done points at a specific row and its evidence. Use this when coordinating agents or sessions on one deliverable, when finished work keeps arriving without proof, or when a project must survive across sessions.
---

# Requirement Ledger

A finished agent run proves nothing about the work. An agent can exit cleanly
having done the wrong thing, or half of it. The ledger separates three claims
that get conflated: the agent completed, the requirement is met, the release is
shippable. Each is checked on its own terms, and the ledger records which of
them actually hold.

## The ledger

Keep one durable table of requirements in a plain file or a small database that
survives every session. Each row carries:

- **id**: a stable tag (`R-014`) that commits, evidence, and repair jobs
  reference.
- **statement**: what must be true when this is done, phrased so a stranger
  could check it.
- **status**: one of `open`, `in-progress`, `done`, `failed`, `blocked`.
- **evidence**: a link to the proof behind the current status. For `done` that
  means a test run, a command transcript, or a diff plus its verification
  output. A row marked `done` with an empty evidence field is lying.
- **notes**: what a reviewer needs to know, especially what is NOT fixed yet.

The ledger holds orchestration state only. Knowledge, decisions, and
documentation live in their own notes; do not let the ledger grow into a second
memory system.

## "Done" is a claim against a row

When an agent reports completion, the report names a row id and attaches
evidence. Nobody flips a row to `done` on the strength of a summary sentence.
Treat a commit message as a claim; evidence is a run someone else can
reproduce. Where possible, vary the input and require the output to change,
because a check that passes on both good and broken code is measuring nothing.

This discipline pays off at handoff. A note like "parser still ignores the
flags field, NOT FIXED" is written for a future reviewer, and in practice a
later agent picks exactly that up and closes it. The ledger is how work
transfers between parties that never talk to each other.

## The repair queue

A `failed` row does not sit in the main list waiting to be noticed. It moves to
a repair queue with the failing evidence attached: the exact command and its
output, plus the input that triggered the failure. The next worker starts from
a reproducible failure instead of re-diagnosing from a vague report.

Rule: no queue without a drain. Before creating the repair queue, name what
consumes it, whether a scheduled repair pass or a standing review. A queue
nothing drains is where failures go to be forgotten while the status board
stays green.

## The ledger outlives the session

Sessions end mid-task and context windows fill. The ledger is what the next
session reads first to learn where the work stands. Two habits make that
reliable:

1. Update a row the moment its status changes, never in a batch at the end. A
   crashed session with a stale ledger poisons the next one.
2. Re-read the ledger at session start even when you think you remember it.
   Another agent may have moved rows while you were gone.

## Rules

- Every unit of work maps to a ledger row before an agent starts it.
- `done` requires linked evidence a stranger could re-run.
- Failures move to the repair queue with the failing evidence attached.
- The repair queue has a named drain.
- The ledger stores orchestration state, never knowledge.
