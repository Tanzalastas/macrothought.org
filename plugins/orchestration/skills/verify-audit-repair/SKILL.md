---
name: verify-audit-repair
description: Run worker output through mechanical verification, an audit by a party other than the author, and an evidence-carrying repair queue so a failure can never be laundered into a pass. Use this when accepting work from agents or automated workers, when building a release gate, or after any check has reported green on broken work.
---

# Verify, Audit, Repair

"All agents finished" tells you the processes exited. Whether the work is
correct is a separate question, and this loop answers it in three stages with
distinct owners. The gate at the end refuses anything that skipped a stage.

## Verify mechanically

Verification is deterministic. Tests run and exit codes are recorded; output is
diffed against the acceptance criterion. No model judges whether the work
"looks right". A harness runs commands and stores the raw results in durable
state alongside the requirement they verify, because the raw output is what the
auditor and the repair worker will need.

Verify by execution, never by reading. A plausible diff and a correct diff are
indistinguishable on inspection. Where you can, vary the input and require the
output to change; a check whose result is identical for good and broken code is
measuring nothing.

## Audit independently

The author of a change cannot audit it. Whoever wrote the code shares its blind
spots, and that holds for humans and agents alike. Route the audit to a party
with no hand in the diff: a second agent that did none of the implementation,
or a reviewer session with a clean context.

Independence is scarcer than it looks. Two agents that shared a prompt or a
context pack are less independent than they appear. A party that verifies by
execution work it never touched is the most valuable resource in the loop;
spend it on the audits that matter.

Treat every completion report as a claim awaiting evidence. A commit message
asserting "fixed" carries no more weight than the same sentence spoken aloud.

## Repair with the evidence attached

A verification or audit failure moves the item to a repair queue. The queue
entry carries the failing evidence itself: the command that failed, its full
output, and the input that triggered it. The repair worker starts from a
reproducible failure instead of a vague report. Repair jobs are targeted, one
job per failed item, and every fix re-enters the same verify and audit stages
as any other change. The queue also needs a named drain; without one, failures
accumulate behind a green dashboard.

## The gate that could not fail

The canonical broken gate: a release check named `fully_audited` that asked
only "does an audit record exist?" A recorded audit FAILURE satisfied it. The
gate passed on the strength of the very evidence that should have stopped the
release. It was a check unable to express what it existed to prevent.

Before trusting any gate, ask what input makes it fail, and whether it has ever
been seen failing on that input. A related defect: a status parser that drops
states it does not recognize, so "pending" reports as "absent". Keep unknown
states as raw text and surface them. Unknown must be distinguishable from zero.

## The loop, end to end

1. A worker produces output and claims completion against a ledger row.
2. The harness verifies mechanically and records evidence.
3. An independent party audits, recording pass and fail as distinct states.
4. Failures enter the repair queue with the evidence attached.
5. Repaired items re-enter at step 2. The gate checks audit outcomes, never
   audit existence.
