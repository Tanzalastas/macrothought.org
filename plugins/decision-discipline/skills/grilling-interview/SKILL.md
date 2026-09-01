---
name: grilling-interview
description: Runs a relentless one-question-at-a-time design interview that walks the whole design tree before anything gets built. Use this when the owner asks you to grill a plan, wants a design stress-tested before building, or when a plan contains decisions nobody has actually made yet.
---

# Grilling Interview

A design interview that runs until the plan has no unexamined branch. The interviewer asks, the owner decides, and nothing gets built until both sides confirm they hold the same plan.

## When to run it

Run the interview before building anything where a wrong assumption is expensive: a new subsystem, a schema, a release gate, an automation that will run unattended. Skip it for one-line fixes. The trigger is the owner asking to be grilled, or you noticing that the plan contains decisions nobody has actually made yet.

## Walk the design tree

Treat the plan as a tree. The root is the goal. Each branch is a design decision, and decisions depend on each other: you cannot pick a storage format before you know what will read it. Walk the tree branch by branch, resolving dependencies in order. Do not skip a branch because it looks obvious. The obvious branches are where the unshared assumptions live.

Keep a visible record of which branches are resolved and which remain. When a later answer invalidates an earlier one, go back and re-resolve the earlier branch, and say that you are doing so.

## One question at a time

Ask exactly one question, then wait for the answer before asking the next. A block of five questions is bewildering: the owner answers two, skims the rest, and the skipped ones become the assumptions that break the build. Single questions also let each answer reshape what you ask next, which is the point of an interview.

## Every question carries a recommended answer

Never ask a bare open question. State the question, then state what you would choose and why, in a sentence or two. The recommendation gives the owner something concrete to accept or push against, and it makes "yes, do that" a sufficient reply. A recommendation the owner overrules is still a success. The failure is a question with no stake in it.

## Facts are yours, decisions are the owner's

Sort every question before asking it. If the answer already exists in the codebase or its documentation, it is a fact: look it up yourself and never spend a question on it. Asking the owner "what port does the service listen on" wastes their attention and teaches them to skim your questions.

If the answer is a tradeoff or a priority call, it is a decision: put it to the owner and wait. Do not resolve a decision by silently picking the default, even when the default looks safe. A decision resolved silently was never decided at all; it was assumed.

## Running the interview

1. Restate the goal in one sentence and get agreement on it. Every branch hangs off it.
2. Sketch the branches: list the decision areas you can see and the order their dependencies force.
3. Look up every discoverable fact before asking question one.
4. Ask the highest-leverage unresolved question, with your recommendation attached.
5. Record the answer. If it invalidates an earlier branch, revisit that branch and say so.
6. Repeat until no branch is unresolved.
7. Summarize the plan: each decision with who made it, plus anything deliberately deferred.
8. Build only after the owner confirms the summary.

## The gate

Do not enact the plan until the owner explicitly confirms shared understanding. "No further questions" is your state, "we agree on the plan" is theirs, and you need both. The closing summary is the thing the owner confirms, so keep it short enough that they will actually read it.

If the owner shows impatience, offer to batch the remaining low-stakes branches into stated defaults they can veto in one pass. That preserves the gate without grinding through trivia.
