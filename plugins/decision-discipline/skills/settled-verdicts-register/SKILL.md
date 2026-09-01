---
name: settled-verdicts-register
description: Maintains a register of decisions already made and checks every new proposal against it before fresh analysis begins. Use this when a proposal may be relitigating a settled call, when recording the outcome of a real debate, or when someone wants to reopen a decision the owner already made.
---

# Settled Verdicts Register

A register of decisions already made, kept so they do not get made again. Rejected ideas return, usually under new vocabulary, and every relitigation costs the time of the original debate plus the risk of reaching a worse answer without the original evidence in the room. The register turns "we decided this already" into a checkable claim instead of a memory.

## Format

One table, one row per settled call:

| Proposal | Verdict | Date | Source |
|---|---|---|---|
| Auto-rewrite the memory index from a scheduled job | No. One writer, with judgment, in session. | 2026-03-02 | design-decisions, rule 2 |
| Add a second blocking pre-merge hook | No. The single blocking slot is already assigned. | 2026-03-02 | design-decisions, rule 3 |
| Per-hour change badges on the dashboard | Rejected. Hourly windows made every day look active; the badge was noise presented as signal. | 2026-04-19 | dashboard review |
| Archive commands because they look unused | Reverted. Redundant differs from unused; sweep by function. | 2026-05-11 | command-archive postmortem |

The verdict is one or two sentences with the reason compressed in. The source points at the fuller record, and the register stays a pointer layer: if a row and its source disagree, the source wins and the row gets fixed.

Rows are earned. Record anything rejected after real debate, anything reverted after being tried, and any standing rule someone has already argued against and lost. Trivial calls stay out. A register full of noise stops being consulted, and an unconsulted register protects nothing.

## Check the register first

When a new proposal arrives, match it against the register before spending any analysis on it. The order matters. Analysis is expensive and persuasive: once a fresh evaluation of a rejected idea exists, it competes with the recorded verdict on even terms, which is exactly the relitigation the register exists to prevent.

Match by function rather than by surface. "Nightly job that tidies the index" and "scheduled index maintenance agent" are the same proposal as the auto-rewrite row above. Ask what the proposal would do to the system, then look for a row about that effect. A rejected idea rarely returns under its old name.

A match produces a short answer: the verdict with its date and source. A miss means the proposal is genuinely new and proceeds to normal evaluation. Say explicitly which of the two happened, because a silent miss is indistinguishable from a skipped check.

## Reopening a settled call

Settled does not mean sealed forever. Constraints change, and a register that cannot be amended hardens into dogma. But reopening carries two hard requirements:

1. **New evidence.** Something the original decision could not have weighed: a measurement, an incident, a changed constraint, a removed limitation. "I still think we were wrong" is a preference, and preferences were already counted the first time.
2. **Saying so explicitly.** The proposer states outright that they are reopening a settled call, pointing at the row and at the new evidence. Stealth reopening, where the old idea is pitched as new in the hope nobody checks, poisons the register itself: once one stealth reopen succeeds, every row becomes negotiable.

The owner of the original verdict is the one who reopens it. The register maintainer may flag a candidate for reopening with the evidence attached, but never overturns rows on their own authority.

## Recording amendments

When a reopened call changes, amend the row rather than deleting it. Prefer a narrowed rule over a reversed one where the evidence supports only the narrow change: "derived, rebuildable indexes allowed as of 2026-06-10; stores of record remain rejected." When a verdict is overturned outright, keep the old verdict visible with its supersession date. A register that silently rewrites its own history cannot prove anything was ever settled, and proving that is its entire job.

An amendment is a new decision, so it earns the same treatment as any other row: a date and a source, recorded at the time the call was made.
