---
layout: guide
title: Context and memory
description: Keep durable notes small, date their claims, and assemble a briefing for the task at hand.
order: 4
section: docs
reviewed: 2026-11-18
---
Useful project memory answers two questions: where should I look, and what can I trust there? A clear index helps with the first. A dated claim with a source helps with the second. A task briefing then selects the material needed for one piece of work.

The public second-brain skills describe a folder tree of Markdown notes, an index, and topic hubs. The context-packs skill describes a versioned briefing containing the task, constraints, exact interfaces, and relevant decisions. These are practices you can apply to a small repository or notebook with ordinary files.

## Give each record a clear job

A durable note holds knowledge about one topic. A hub introduces a topic and points to its smaller notes. An index helps a new session choose which note to open. A requirement row tracks the state of a piece of work. A context pack brings the relevant parts together for a specific assignment.

For an invented Field Atlas project, the structure might look like this:

```text
field-atlas/
  INDEX.md
  project.md
  notes/
    route-sources.md
    navigation-decision.md
  tasks/
    R-NAV-01.md
  briefings/
    navigation-review-v1.md
```

The index can stay short. A pointer such as “navigation-decision — why the guide index keeps plain text links” tells a reader what they will find before they open it. The task record can link to that decision without copying its whole history.

## Date claims when you write them

The confidence-tagging skill uses three literal forms:

```text
[verified YYYY-MM-DD]
[inferred YYYY-MM-DD]
[uncertain YYYY-MM-DD]
```

Use `verified` for a direct observation with evidence. Use `inferred` for a conclusion drawn from evidence, and explain the reasoning. Use `uncertain` for a useful question that remains open. The date lets a later reader judge whether the claim needs another check.

Here is a synthetic note showing the format:

```text
# Navigation decision

[verified 2026-11-18] In this practice fixture, every guide has a
visible text link from the guide index. Evidence: fixture-links.txt.

[uncertain 2026-11-18] Keyboard focus remains visible at 200% zoom.
Next check: repeat the keyboard route at that zoom level.
```

The first entry is verified only within the invented exercise. In real use, replace the example evidence with the actual result. A confidence tag is a description of evidence, so an agent's confidence by itself cannot establish an observation.

## Assemble a task briefing

Suppose another reviewer will check R-NAV-01. A compact context pack could contain:

```text
Pack: navigation-review-v1
Task: Review R-NAV-01 against the candidate website revision.
Input: The built guide index and its linked guide pages.
Acceptance: Complete the keyboard route and browser Back route.
Decision: Keep visible text labels for every guide link.
Scope: Record findings and evidence for this navigation task.
Sources: R-NAV-01.md and navigation-decision.md at recorded revisions.
Return: Starting state, steps, observed result, and unresolved checks.
```

The expected result is a reviewer who can begin the named task without reconstructing the whole project. If a source changes, rebuild the affected briefing and recheck any work that depended on the old version. Record the briefing version alongside the result so later readers can trace the information used.

## Maintain the smallest useful system

When a fact changes, update its note and preserve a reason or source link where useful. When a note grows around unrelated questions, split those topics and update the index in the same change. A hub should make its children easier to find.

Maintenance can begin with a few deterministic checks. Confirm that every index target exists, count the notes examined, and try a temporary broken pointer to prove the check reports it. The memory-lint skill includes further checks for orphan notes, aging claims, and unprocessed captures.

Every maintenance queue needs a reader and a cadence. For a small project, a short review at the start of the next working session may be enough. Record deliberate skips so later sessions understand why a suggestion was left unresolved.

## Continue reading

[Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) explains how task records carry their proof. [Architecture]({{ '/docs/architecture/' | relative_url }}) places notes and work records within the workspace direction. Source instructions are published with the [second-brain skills](https://github.com/Tanzalastas/macrothought.org/tree/main/plugins/second-brain/skills) and the [context-packs skill](https://github.com/Tanzalastas/macrothought.org/tree/main/plugins/orchestration/skills/context-packs).
