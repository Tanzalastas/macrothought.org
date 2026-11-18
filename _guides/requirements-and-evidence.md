---
layout: guide
title: Requirements and evidence
description: Define a checkable outcome, preserve the result, and make completion claims reproducible.
order: 3
section: docs
reviewed: 2026-11-18
---
A requirement describes an outcome someone else can check. Evidence records what happened when that outcome was tested. Keeping both together makes a project easier to resume and makes a completion claim easier to assess.

The public orchestration skills use a durable requirement ledger with stable identifiers, statements, status, evidence, and notes. A plain table can be enough for a small project. The important properties are that the record survives the session and that another reader can follow the evidence behind its current status.

## Write an observable requirement

“Polish the navigation” leaves too much open. For the fictional Field Atlas documentation site, a more useful statement is:

> R-NAV-01 — A keyboard user can reach each documentation link, see which link has focus, and return to the documentation index using the browser's Back action.

This names the user's action and the expected behavior. It gives the implementer a bounded task and the reviewer a route to exercise. Record the relevant page, source revision, viewport, and browser before testing. Those details establish which state the result describes.

The public requirement-ledger skill uses `open`, `in-progress`, `done`, `failed`, and `blocked` as its example states. Use the vocabulary of your actual project consistently. Record enough detail to distinguish a failed behavior from a check that could not run.

## Carry evidence with the work

A ledger row for the example could begin like this:

| Field | Synthetic example |
| --- | --- |
| ID | R-NAV-01 |
| Statement | Documentation links support the defined keyboard route. |
| Status | in-progress |
| Evidence | Pending keyboard run against the candidate revision. |
| Notes | Test narrow and wide layouts, including the return route. |

When the check runs, preserve its command or manual steps and the observed result. A visual task often needs both a screenshot and an interaction trace. A successful screenshot cannot establish that browser Back retained the expected location. The test evidence should match the behavior the requirement describes.

## Check the check

The verification skills recommend controlled failures. Before trusting a navigation check, use a temporary fixture with a deliberately hidden focus indicator and confirm that the review detects it. Also run the clean fixture so the check demonstrates that it can distinguish the two conditions.

For a small mechanical example, this standalone Python exercise models a release decision with separate verification and review results:

```python
# Synthetic exercise. Run with Python 3.
def may_release(checks, review):
    return bool(checks) and all(checks) and review == "pass"

assert may_release([True, True], "pass")
assert not may_release([True, False], "pass")
assert not may_release([True, True], "fail")
assert not may_release([], "pass")
print("Four example assertions passed")
```

The expected output is `Four example assertions passed`. The failing check, failing review, and empty check set each prevent release. The exercise illustrates a decision rule. A real release also needs to establish that its checks exercised the intended code, that review covered the current change, and that all required checks were present.

## Review, repair, and close

The public verify-audit-repair workflow places mechanical checks before independent review. A reviewer should be able to reproduce the result and challenge its coverage. Record the review outcome explicitly. The presence of a review record alone does not establish approval.

If the keyboard route fails, keep the exact starting page and action sequence with the failed row. Assign the repair to a named owner or a named review pass. Once repaired, rerun the relevant checks against the new candidate. Update the evidence and leave a concise record of what changed.

Completion is useful when it is specific. A row might say that R-NAV-01 passed in the recorded browsers and viewports, while a separate screen-reader check remains pending. This keeps a verified improvement usable without silently expanding the claim to every accessibility concern.

## Continue reading

[Getting started]({{ '/docs/getting-started/' | relative_url }}) provides a smaller first verification exercise. [Development]({{ '/docs/development/' | relative_url }}) describes the website's build and validation commands. The full [orchestration skills](https://github.com/Tanzalastas/macrothought.org/tree/main/plugins/orchestration/skills) and [verification skills](https://github.com/Tanzalastas/macrothought.org/tree/main/plugins/verification/skills) explain the underlying practices.
