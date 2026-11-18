---
layout: post
title: "When is the next phase ready?"
description: "A planner defect surfaced when the same requirement appeared in two different views of a roadmap."
date: 2026-11-18 02:40:29 -0500
category: Engineering
section: devlog
evidence_status: "Locally tested candidate"
---

Imagine two tasks on a roadmap. The first verifies a prerequisite. The second uses its result. On Monday both tasks are open, and anyone reading the plan should start with the first. On Tuesday the prerequisite has passed. The dependency still points in the same direction, but the work available today has changed.

A review of the Consulate phase planner found that the size of the selection could change that answer. Requesting the second phase by itself picked up the recorded pass and marked the phase ready. Requesting both phases together put the completed prerequisite back on the ready list and told the reader to wait for it. A different view of the roadmap had produced a different recommendation from the same records.

## Two checks on one decision

The local correction keeps the phase order visible and reads the status of each direct prerequisite to decide what can start. A completed phase remains visible as completed. A phase that someone is already working on remains active. That gives the next person enough information to find available work without claiming the same task twice.

The useful regression case is small enough to write down:

| Recorded prerequisite | Requested plan | Expected result |
| --- | --- | --- |
| Passed | Dependent phase alone | The dependent phase is ready. |
| Passed | Both phases | The prerequisite stays complete. The dependent phase is ready. |
| Partial | Both phases | The dependent phase identifies the unfinished prerequisite. |

The last row matters because an implementation that simply marks everything ready could satisfy the first two examples. The development candidate was checked locally against the planner tests. That evidence pertains to the planning decision. Each roadmap phase still needs its own implementation, acceptance checks and recorded result.

The [public requirement-ledger skill](https://github.com/Tanzalastas/macrothought.org/blob/a441af62877b91ceb38aa5744bcef284bd52c110/plugins/orchestration/skills/requirement-ledger/SKILL.md) describes the underlying practice of keeping requirement identity, status and evidence together. You can use the same comparison on a release checklist by opening an item on its own and then reading it again in the full plan.
