---
name: verdict-first-citation
description: Answers review questions verdict-first, with every objection citing a dated source or carrying an explicit label as the reviewer's own read. Use this when reviewing a proposal against recorded doctrine, answering "was this already decided" questions, or in any review where line one must be a yes, a no, or an honest "no recorded position".
---

# Verdict-First Citation

A discipline for answering review questions: the verdict goes in line one, and every claim after it either cites a dated source or admits to being the reviewer's own judgment. It fits any review conducted against a recorded doctrine, where the real question is "has the owner already decided this" and the worst failure is dressing the reviewer's taste up as the owner's rule.

## Line one is the verdict

The first line of the answer is one of three things:

- **Yes**, with the source that settles it.
- **No**, with the source that settles it.
- **No recorded position.** The record does not settle this, and what follows is the reviewer's read.

Everything else comes after. An asker who reads only line one must leave with the correct answer.

## Absence of a position is the third verdict

When the record does not cover the proposal, say exactly that. "No recorded position" is a real answer, and frequently the most useful one, because it tells the asker they are about to make a new decision rather than execute an old one. It should route them to the owner or into a design interview, never straight into building.

Never convert an absence into an approval. The record failing to prohibit something means only that nobody has decided. Treating silence as a yes is how a doctrine gets stretched over things its owner never saw.

## Every objection cites, or confesses

Each objection in the body takes one of two forms:

- **Cited:** "Rejected 2026-03-02: scheduled jobs never rewrite the index. Source: design-decisions, rule 2." A cited objection carries the owner's authority, and anyone can check it.
- **Confessed:** "Reviewer's read, no recorded rule: this retry loop looks unbounded." An uncited objection carries only the reviewer's authority, and it must say so in the same breath, because the asker weighs the two differently and has the right to.

The forbidden middle is the objection that sounds recorded while being the reviewer's taste. That counterfeit spends the owner's authority without consent, and once the asker catches one, every citation in the review becomes suspect.

## A miss is a miss

If you search the record and find nothing, report the miss. Do not fill it with a plausible-sounding verdict. The entire value of the practice rests on verdicts being exactly as strong as their sources, so the reviewer must be willing to say "the record is silent here" and stop.

Misses are also signal. A question the record cannot answer marks a gap in the doctrine, and reporting it is how the doctrine learns where to grow. A reviewer who papers over misses starves the doctrine of exactly that feedback.

## Working format

```
VERDICT: No. Recorded 2026-05-02: release copy names only shipped features.

Objections:
1. [cited, 2026-05-02, release-integrity note] The "coming soon" panel names an unbuilt feature.
2. [reviewer's read, no recorded rule] The changelog date format differs from prior releases.

Not settled by the record: whether beta features count as shipped. Owner's call.
```

The labels are the load-bearing part. Any format works if every line is either a verdict, a cited objection, a confessed opinion, or a declared gap.
