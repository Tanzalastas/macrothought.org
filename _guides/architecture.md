---
layout: guide
title: Architecture
description: Follow the public design from source knowledge through work evidence to a view.
order: 5
section: docs
reviewed: 2026-11-18
---
Macrothought's public architecture description combines a Python core, browser interfaces, Markdown knowledge, and records for relationships and operational work. The organizing idea is that each kind of record has a clear purpose and that views can refer to the same source material.

This guide walks through that design with a made-up example. It covers where the workspace is heading and the practices behind it. Setup and configuration for the current 1.4 application aren't documented here yet.

## Knowledge, relationships, work, and views

The public site describes three connected layers. Knowledge and relationship records explain the material being managed. Work and evidence records describe tasks, artifacts, checks, and reviews. Views let a person inspect those records through maps, projects, history, and research surfaces.

A source can participate in several relationships. A survey might support a route description, belong to a project, and appear in an activity record. Those relationships have different meanings. A directory location answers where a file lives. A source citation answers what supports a claim. An activity entry answers what was recorded as happening at a particular point.

| Record | Question it helps answer |
| --- | --- |
| Markdown note | What is currently known about this topic? |
| Source reference | Where did this claim or artifact come from? |
| Relationship | How is this item connected to another item? |
| Requirement | What outcome must the work satisfy? |
| Verification result | What happened when the outcome was checked? |
| Review result | What did an independent reviewer conclude? |
| View selection | Which item is the reader examining now? |

This separation makes it possible to change a presentation without rewriting the underlying claim. It also gives a reviewer somewhere specific to look when a display appears incorrect.

## Trace an invented change

Consider a fictional Field Atlas guide whose source link has moved. The task is to repair that link while preserving the explanation it supports.

```text
Source note
  → requirement R-LINK-02
  → candidate link correction
  → target-existence check
  → review of the linked material
  → updated evidence record
  → refreshed documentation view
```

Start from the source note and record why the old link needs attention. Define R-LINK-02 with an observable outcome: the replacement link reaches the intended material and the guide's claim still matches that material. Make the candidate change in an isolated working copy.

Next, run the target check. A successful response or existing file is evidence about reachability. The reviewer must still inspect the destination and determine whether it supports the guide. Preserve these results separately so a later session can tell which part was verified mechanically and which part needed judgment.

The expected final record is a corrected link, the source revision, the command or steps used to check it, and a review outcome. If the destination is available but its relevance is unresolved, the task retains that limitation. A map or dashboard can then present the actual state.

## Understand the role of agents

The public orchestration skills give agents bounded tasks, relevant context, and a defined return format. Their output becomes a candidate for verification and review. A completed agent run is one event in that process. A verified requirement and a release decision each need their own evidence.

The site describes optional local and cloud model tools whose use depends on explicit configuration. A diagram or avatar supplies no evidence of an active transport. In particular, the public synthetic workspace representation establishes an interface idea. A working conversation adapter would need verified authentication, delivery behavior, and observable receipts before it could support operational claims.

## Build from public boundaries

For website contributors, the concrete boundary is the generated static site. Jekyll combines public content and shared layouts into pages. The public skill files remain readable in the repository. The build and its validation establish which files enter the site output.

For a workspace builder, the useful starting questions are broader: which record owns a fact, how is its source identified, what invalidates a cached view, and what evidence demonstrates a state transition? Answer those questions for one feature before adding another projection of the same data.

## Continue reading

[Context and memory]({{ '/docs/context-and-memory/' | relative_url }}) develops the note and briefing model. [Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) explains completion and review records. [Development]({{ '/docs/development/' | relative_url }}) gives the concrete workflow for contributing to this public website.
