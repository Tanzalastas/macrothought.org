---
layout: guide
title: Getting started
description: Try one public skill on a small task and keep a result you can verify.
order: 1
section: docs
reviewed: 2026-11-18
---
Macrothought's public starting point is a collection of skills for checking work, maintaining knowledge, making decisions, and coordinating agents. A skill is a readable set of instructions that your agent applies using the tools available in your environment. You can inspect the source before installing it and use one department without adopting the whole collection.

The site also covers Consulate, the workspace that is still taking shape. Screenshots show when they were taken, and examples use made-up data. Begin with one task you already understand. That gives you a clear way to judge whether the skill improves the result.

## Choose a department

The public pack has seventeen skills across four departments. Choose by the question you need answered.

| Department | A useful first task |
| --- | --- |
| Verification | Prove that a check detects a known failure. |
| Second brain | Give a small set of notes useful titles, links, and dated claims. |
| Decision discipline | Record a decision and the evidence needed to revisit it. |
| Orchestration | Turn a deliverable into requirements with testable outcomes. |

For a first run, verification is especially concrete. You can compare the check's output on clean and deliberately broken examples. Keep the experiment small enough to inspect every input yourself.

## Install and inspect

In a client that supports this plugin marketplace command format, add the public repository and install the verification department.

```text
/plugin marketplace add Tanzalastas/macrothought.org
/plugin install verification@macrothought
```

The commands come from the public repository README. After installation, inspect the plugin entry in your client and open the selected skill's instructions. Confirm that the installed name matches the department you chose. Command support, available tools, and approval controls depend on the client. If the client does not support these commands, you can still read the published skill files and apply the process manually.

Installation supplies instructions. The work still needs a concrete input, a way to run checks, and a record of the result. A request that involves a file should name the file and the allowed edit scope.

## Work through a small example

Imagine a fictional Field Atlas website with three documentation links. You want to check that all three targets exist before publishing a preview. Prepare a temporary copy with two known conditions: one version where every target exists, and another where one target is deliberately missing.

Give your agent a bounded request.

```text
Use the verification skill to review my documentation-link check.
Work only on the temporary Field Atlas example.

Check the clean example and the example with a missing target.
Record the input, command, exit code, and explanation for each run.
Show whether the check detects the missing target and keeps the clean
example clear. Return the evidence and any limitation of the check.
```

The expected result is a short record like this hypothetical output.

```text
Clean fixture: 3 targets examined, 3 found, exit 0.
Broken fixture: 3 targets examined, 2 found, exit 1.
Missing target: docs/map.html.
Coverage: local target existence only.
```

This record lets a reviewer see what happened and repeat the exercise. It also defines the limit. A file can exist while its contents are incorrect, its page is inaccessible, or its navigation is confusing. Those concerns need their own checks.

## Keep a useful first result

Save the smallest artifact that lets you resume the task: the requirement, the check command, the relevant input, and the observed output. Record the source revision when the task belongs to a repository. If the check cannot run, preserve the reason and leave the result unverified.

Use the next task to extend coverage deliberately. For the Field Atlas example, that might be keyboard navigation through the three links. A concrete follow-up is easier to judge than a broad request to improve everything at once.

## Continue reading

[Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) explains how to turn that first result into a durable work record. [Context and memory]({{ '/docs/context-and-memory/' | relative_url }}) covers the notes and briefings that help another session continue. The install commands and complete skill files are available in the [public repository](https://github.com/Tanzalastas/macrothought.org).
