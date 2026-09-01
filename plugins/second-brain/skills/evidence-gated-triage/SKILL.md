---
name: evidence-gated-triage
description: Consumes machine-generated maintenance suggestions in bounded batches, applying only what independent evidence supports and keeping the backlog count honest. Use this when a background job drafts maintenance suggestions for a knowledge base (duplicate pairs, missing links, lint fixes, distilled facts) that an agent must review before applying.
---

# Evidence-Gated Triage

## Generators draft, a reviewer applies

Cheap background jobs propose; a reviewing agent disposes. A nightly worker can
draft duplicate pairs, missing links, distilled facts to promote, and mechanical
lint fixes. Every proposal lands in a queue file, and nothing touches the store
until a review pass runs. Two standing rules, both learned the hard way:

- No queue without a drain. Any mechanism that stages items for later attention
  must name who consumes it and on what bounded schedule. Staged-for-human
  backlogs rot; a 56-item queue nobody owned proved it.
- The generator never applies its own suggestions, even "safe" mechanical ones.
  The single most confident auto-fix in one real queue would have corrupted
  template files it did not understand. Propose-only is the guardrail.

## The evidence rule

Apply a suggestion only when you can point at concrete evidence that is checkable
without trusting the generator. Never act on its say-so alone.

- Link suggestion: the target note exists and is topical in the exact sentence
  where the link would land.
- Dedup candidate: read both notes. The loser must contain nothing the canonical
  note lacks; if it does, merge before deleting.
- Drafted fact: it matches something that verifiably happened, per the record,
  and is durable rather than merely plausible.
- Lint fix: the defect is visible in the file right now.

If one or two file reads cannot produce the evidence, skip the item. Skipping
costs a queue line; a wrong merge costs a note.

## Bounded batches

Cap each pass at about ten items, oldest first. A bounded pass that completes
beats an exhaustive pass that stalls halfway, and the cap also bounds the damage
any single bad session can do.

## Record refusals, clear actions

After acting on a queue file, delete the entries you applied so the backlog count
drops. A count that still includes finished work stops meaning anything, and the
next reviewer re-litigates items that were already done. Leave every deliberate
skip in place with a one-line reason: "target note gone", "separate incidents".
The refusal line stops the next pass from re-deriving the same rejection and
builds a false-positive record worth mining.

## False-positive classes worth naming

Three patterns produce most bad dedup and link suggestions. Cite them by name in
refusals so recurring classes become tuning input for the generator:

- Template similarity. Two notes share frontmatter and boilerplate, so similarity
  scoring reads the scaffolding while the bodies disagree. Reject.
- Sequential records. Dated entries in a series (weekly reports, incident logs)
  are near-identical by construction. The series is the point; a merge destroys
  the timeline. Reject.
- Hub-child pairs. A hub note summarizes its children, so overlap is by design.
  Merging a child back into its hub undoes a deliberate split. Reject.
