---
name: release-gate-design
description: Designs release gates whose every leg can independently block, with audit legs owned by a non-author and harness errors reading as failures. Use this when building or reviewing a release gate, a CI quality bar, or any go/no-go check that decides whether something ships.
---

# Release Gate Design

A gate exists to block. Design every part of it around one question: under what concrete
conditions does this leg say NO, and has that branch ever executed? A gate that cannot fail
will pass a broken release, and its green will be quoted as evidence.

## Every leg independently falsifiable

A gate is a conjunction of legs: test suites, static checks, invariants, audit clearances.
Each leg needs its own proof that it can fail.

- Write the test that makes the leg fail before wiring it in. One shipped gate computed
  "fully audited" as "an audit result exists", so a recorded FAILURE satisfied it; six
  requirements sat at fail while the gate said PASS. The failing branch had never executed,
  so nobody knew the predicate was wrong.
- Keep verdict fields separate from lifecycle fields. "Audited" and "cleared" are different
  facts. "Failed" and "not built yet" are different facts. A sweep that demotes unstarted
  work to failed is the same defect from the other side. One column holding two facts will
  eventually assert something false.
- Ban self-certification. A leg must observe its subject from outside. A function returning
  its own "no side effects: true" literal, asserted by a test, certifies nothing.

## Audit legs belong to a non-author

Deterministic legs are reproducible and cannot be talked into agreeing. Judgement legs can.
An audit performed by the author of the work, or by the same agent that implemented it, is
self-review under an audit label. Route judgement legs to a party that did not write the
code: a different person or team, or at minimum an independently run reviewer with read-only
access to the tree. In one release, an independent reviewer found contradictions in the
release docs, then false positives inside the checker itself, then a functional defect in the
gate, none of which self-review had surfaced. When the independent reviewer is unavailable,
record the leg as UNVERIFIED instead of passing it provisionally. A deferral to a reviewer
who never arrives is a pass.

## A harness error must read as a failure

The gate runner is code and fails in ordinary ways: a missing argument, a renamed module, a
truncated output window, a test selector matching zero tests. Each of these has produced a
green that meant "the harness broke", and green-by-crash is the worst outcome a gate can
have.

- Fail closed. Any exception or unparseable output in a leg is a FAIL for that leg, reported
  as HARNESS ERROR by name so it stays distinguishable from a real defect in the work.
- Treat "ran zero of the expected things" as failure. Require minimum counts: at least N
  tests collected, every declared check present with a result row.
- Read the output, never only the exit code. One crashing check group silently shrank a
  count from 20 to 16 with a clean exit at the top level.

## Verdicts are about a specific state

- **Judge the tree you claim to judge.** A gate that evaluates the live working tree while
  claiming to judge a tagged commit asserts something it did not measure. If you cannot run
  against the exact audited revision, label the verdict with what was actually measured.
- **A recorded pass goes stale.** A pass from last week says nothing about today's tree.
  Re-run the gate on the current state before shipping; never ship on a remembered verdict.
- **Allow demotion.** A requirement that passed and later regressed must be able to return
  to failing. A gate that can only accumulate green ratchets toward a lie.

## The gate reports its own coverage

The gate must name what it did NOT evaluate. "43 of 43 pass" with 8 requirements silently
excluded, or "0 unfalsifiable" when most legs had no probe, reads as full coverage while
proving nothing about the uncovered part. A green gate proves the guardrails held. Only
complete, named coverage proves the work was verified, and the difference between those two
sentences is the difference between a release and a demo.
