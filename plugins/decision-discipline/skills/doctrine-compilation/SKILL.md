---
name: doctrine-compilation
description: Compiles an owner's recorded decisions into a citable doctrine document with dated sources, a known-verdicts table, and an explicit gaps section. Use this when plans should be reviewed against an owner's own recorded rules rather than generic best practice, or when scattered decision records need to become one consultable document.
---

# Doctrine Compilation

Compile an owner's recorded decisions into one citable document, so plans and changes can be reviewed against the owner's own rules instead of against generic best practice. The output is a doctrine document: a set of rules, each traceable to the moment it was decided.

## Source material

Compile from records the owner actually produced: decision logs, review outcomes, reverted changes, rejected proposals, standing conventions, postmortems. What the owner built and what the owner reverted are both evidence, and a reverted convenience change is often the strongest rule in the document, because it marks a line the owner defended at a cost.

Do not compile from what the owner would probably say. If a rule cannot be traced to a recorded decision with a date, it does not go in as a rule.

## Every rule carries a date and a source

Each rule cites where it came from and when. The working format is a confidence tag on every claim: `[verified YYYY-MM-DD]` for rules taken directly from a recorded decision, `[inferred YYYY-MM-DD]` for interpretations constructed from patterns in the record. Never present an inference as a recorded fact. Inferred rules are the compiler's reading, the document must label them as such, and they are the rows a reader should argue with first.

A rule without a citation is an opinion that snuck into the archive. Cut it or go find its source.

## The known-verdicts table

Include a table of settled calls the owner has already made:

| Proposal | Recorded verdict | Source |
|---|---|---|
| Auto-rewrite the memory index from a scheduled job | No. One writer, with judgment, in session. | design-decisions, 2026-03-02 |
| Claim an unshipped feature in release copy | No. Verified, or it does not ship. | release-integrity note, 2026-05-02 |
| Add a second blocking pre-merge hook | No. The single blocking slot is already assigned. | design-decisions, 2026-03-02 |

This table is the grounding test set. Anyone consulting the doctrine, human or machine, must reach these verdicts unaided and cite the source. If consultation produces generic commentary instead of these specific verdicts, the doctrine is not grounded and the compilation has failed its purpose.

## Boundaries

State explicitly what the document does not model. If the owner deliberately excluded material from their records, the doctrine must never become the vehicle that pulls it back in. Model how the owner decides and builds, nothing more, and write each exclusion down so future compilers honor it too.

## Coverage and gaps

End with an honest coverage section:

- **Read:** the sources actually consulted.
- **Not read:** known sources that were skipped, and why.
- **Weakest areas:** rules inferred from few data points, and preferences the owner has stated but never had to defend. A preference defended at a cost is doctrine. A preference stated once is a guess.

Never imply completeness. A doctrine that hides its gaps gets trusted exactly where it is thinnest.

## Decay and amendment

The doctrine is only as current as its citations. Before treating any rule as live, re-verify it against its source, because owners change their minds and the source may have moved on. When a call changes, record a dated amendment instead of silently rewriting the rule. Prefer narrowing over reversal where the evidence supports only the narrow change: "the ban on external stores is narrowed as of 2026-06-10, derived rebuildable indexes are allowed, stores of record remain banned." When a rule is overturned outright, keep the old rule visible with its supersession date. The record must resist its own editor.
