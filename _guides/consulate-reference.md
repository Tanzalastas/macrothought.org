---
layout: guide
title: Consulate documentation
description: Read command definitions, interpret work records, and follow a change back to its evidence.
order: 7
section: docs
reviewed: 2026-11-18
---
Consulate documentation should help you understand a control, find the source that defines it, and check the result of using it.

This guide combines public skill definitions with a curated reading of the glossary design in an August 2026 source snapshot. That historical interface presented commands, skills, and change history with expandable details. The current application may work differently. The methods linked below work on their own.

## Read a command or skill entry

Follow an entry from its name through its purpose, usage, and defining source. The name helps you locate it again. The purpose explains the outcome it supports. Usage identifies the input and context needed. The definition or source gives you something concrete to inspect when the summary leaves a question open.

Before using an entry, establish which files or records it reads, what it changes, and what result you should expect.

The historical glossary included activity counts and last-used information. Those fields provide context about recorded use. A count alone cannot establish that an operation succeeded, that its result was reviewed, or that it behaves the same way in a newer revision. Look for the particular result relevant to your task.

## Use the terms precisely

| Term | Meaning in these guides | Continue reading |
| --- | --- | --- |
| Requirement | An observable outcome with an identifier and recorded status. | [Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) |
| Context pack | A versioned briefing containing the task, applicable constraints, interfaces, and decisions. | [Context and memory]({{ '/docs/context-and-memory/' | relative_url }}) |
| Verification | A recorded check of the intended behavior against a particular input and candidate. | [Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) |
| Review | A separate examination of the work and its evidence, with an explicit outcome. | [Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) |
| Source | The artifact, definition, or observation supporting a statement. | [Context and memory]({{ '/docs/context-and-memory/' | relative_url }}) |
| View | A presentation used to inspect records and their relationships. | [Reading the workspace]({{ '/docs/workspace/' | relative_url }}) |

A useful completion record identifies the requirement, candidate, verification result, and review outcome.

## Follow change history back to evidence

The August glossary design offered searchable change records and a department-oriented tree. A visual point could lead back to a specific record. This is a useful reading pattern for any history interface: select the change, inspect its description and revision, then find the evidence for the behavior it claims.

A change description establishes what someone intended or reported. The associated diff and check results let you examine what changed and what was exercised. If the source is unavailable, record that gap. Preserve the revision and date so another session can continue the investigation.

## Work through an example

Imagine a fictional documentation entry called “Check guide links.” You want to know whether it can detect a missing local destination. Read its definition and prepare temporary clean and broken fixtures.

```text
Entry: Check guide links.
Purpose: Identify missing local targets in an example guide index.
Input: Four links in a temporary website fixture.
Definition: The checker source at the recorded example revision.
Expected clean result: Four targets found, exit 0.
Expected broken result: One missing target reported, exit 1.
```

Run both fixtures and retain the actual output. The useful result is a record showing which input was examined, which target was missing, and whether the checker distinguished the conditions. An activity count can help you find those runs, while the run evidence supports the outcome.

The example covers target existence. Content accuracy and keyboard navigation need their own checks. Keep those limits beside the result when handing the task to another reviewer.

## Continue reading

[Getting started]({{ '/docs/getting-started/' | relative_url }}) provides the public installation steps and a first exercise. [Website development]({{ '/docs/development/' | relative_url }}) lists this site's build and validation commands. Full definitions are available in the public [orchestration](https://github.com/Tanzalastas/macrothought.org/tree/main/plugins/orchestration/skills) and [verification](https://github.com/Tanzalastas/macrothought.org/tree/main/plugins/verification/skills) skill collections.
