---
name: confidence-tagging
description: Tags every stored claim as verified, inferred, or uncertain with a date at write time, and makes recall report gaps and staleness instead of implying completeness. Use this when an agent writes durable memory, answers questions from stored knowledge, or needs a re-verification cadence for aging claims.
---

# Confidence Tagging

## Three tags, one microformat

Every durable claim carries a tag at write time: `[verified YYYY-MM-DD]`,
`[inferred YYYY-MM-DD]`, or `[uncertain YYYY-MM-DD]`.

- verified: you observed it directly. You ran the command and saw the output.
- inferred: you concluded it from evidence without observing it. Say so. Never
  state an inference as fact.
- uncertain: worth recording, unconfirmed. This tag is a promise to check later.

Date every tag on write. An undated tag cannot age and therefore never surfaces
for re-verification, which quietly exempts the claim from the whole system.

Keep exactly one microformat. Search and lint tooling gets built against this
literal shape, and a second format ("confidence: high", emoji markers) escapes
all of it silently. When tempted by a richer scheme, resist: three levels plus a
date cover the real decisions, which are "can I act on this" and "when was it
last true".

## Gap-aware recall

When answering from stored memory, report the state of the evidence with the
answer:

- Cite the tag and its date: "recorded as verified five months ago".
- Say what is stale. A verified claim about a fast-moving system decays; an old
  date is a warning even on a verified tag.
- Say what is missing. If the index holds nothing on part of the question, state
  the hole plainly rather than smoothing over it.
- Never imply completeness. "Here is everything known about X" is itself a claim
  about the store; make it only when an index scan supports it.

An answer that hides its gaps reads as more trustworthy than it is, and decisions
get made on that false confidence. A one-line staleness footer buys back the
reader's calibration.

## Re-verification queues

Claims decay, so give aging ones a drain:

1. A deterministic picker sweeps the store on a schedule and selects a small
   batch: oldest uncertain tags first, then verified tags past an age threshold
   on topics that actually change.
2. The batch lands in a queue file, one line per claim with its source note.
3. A weekly pass re-checks the batch. Re-run the command that produced the claim,
   or go back to the source. Three to five claims per pass is enough; a cadence
   that actually runs beats an ambitious one that does not.
4. Each outcome edits the note in place: refresh the date when a claim holds;
   upgrade inferred to verified when a check confirms it; downgrade or delete
   what turned out wrong.
5. Clear actioned lines from the queue so its count stays honest.

Fix one-off problems once. A few dozen undated tags call for a convention line
plus a handful of weekly sweeps, and no standing machinery. Build a subsystem
only for the case that recurs.
