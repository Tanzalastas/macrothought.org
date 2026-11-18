---
layout: guide
title: Reading the workspace
description: Use maps, files, and activity as views onto a question, with clear boundaries around archived captures.
order: 2
section: docs
reviewed: 2026-11-18
---
A map becomes useful when it helps you answer a question about your work. Start with the question, inspect the relevant source, and keep the finding with its evidence. The shape of a cluster can suggest where to look. The underlying note, file, or recorded event establishes what you can say about it.

Macrothought explores several ways to see related material: spatial maps, directory views, and activity records. The public Field Atlas example uses invented projects to illustrate switching between Galaxy, Files, and Activity. You can try it without connecting your own workspace.

## Understand the date of a capture

The public recordings and images used in this tour span July 19–22, 2026. The force-map image below was captured on July 22. They show Consulate as it was then, and the current controls may differ. Use them to understand the ideas behind each view.

The archived maps show FORCE, CIRCLE, TREE, and RINGS layout choices. They also show DEPARTMENTS and FOLDERS groupings. Recorded navigation instructions include scrolling to zoom, dragging to pan, and clicking a node to fly into a closer view. Each choice changes the way the material is presented in that archived interface.

![Archived July 22, 2026 map showing spatial nodes and the historical layout controls.]({{ '/assets/galaxy-force.jpg' | relative_url }})

Treat this image as a dated reference. It establishes what was visible in that capture. It does not establish that a current installation has the same controls, that every depicted relationship has been independently reviewed, or that a control works through every input method.

## Pick a view for the question

A spatial view can help you notice neighboring topics. A file view helps you locate the artifact you need to open. An activity view helps you follow the order of recorded changes. These views are most useful when a selected item retains a recognizable identity across them.

In the Field Atlas example, Field notes appears as a node, a file entry, and an activity item. The shared identity lets you recognize the same item in each view. Its description mentions source references and a review checklist. Those relationships describe how the draft could be examined; the displayed status tells you that its review remains pending.

## Follow one item through the example

Open the [Field Atlas design study]({{ '/consulate/#views' | relative_url }}) and answer this question: “Which activity entry belongs to Field notes, and what is its review status?” This exercise follows the controls and labels in that public example.

1. In Galaxy, select **Field notes**. The inspector identifies it as `example:field-notes` and shows **Draft · review pending**.
2. Switch to Files. Find **field-notes.md** beneath Research / Field Atlas. The selected document in the inspector retains the same identity.
3. Switch to Activity and select **Draft revised**, whose attribution reads **Researcher · Field notes**.
4. Check that the inspector still shows Field notes, `example:field-notes`, and **Draft · review pending**.
5. Return to Galaxy and confirm that Field notes remains selected. You can inspect Source library or Review checklist separately to see their distinct identities and statuses.

The expected finding for this synthetic example is:

```text
Question: Which activity entry belongs to Field notes?
Activity: Draft revised — Researcher · Field notes.
Identity: example:field-notes across Galaxy, Files, and Activity.
Displayed status: Draft · review pending.
Still needed for a real review: the source contents and review evidence.
```

The exercise is complete when you can explain how you reached the finding and what you still need to inspect. Switching views alone establishes very little about the accuracy of the source material.

## Make the interface answerable

When reviewing a workspace layout, test a specific route through it. Can you tell what is selected? Can you get back to the previous view? Is a filter visibly active? Does the interface explain an unavailable artifact? Can you complete the same task with the keyboard and at a narrow viewport?

Record the viewport, input method, starting item, and observed result. A screenshot helps establish visual placement. A short sequence of actions helps establish navigation behavior. Together they give a later reviewer something more precise than “the map felt confusing.”

## Continue reading

[Architecture]({{ '/docs/architecture/' | relative_url }}) explains the roles of knowledge, relationships, work records, and views. [Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) shows how to turn a navigation problem into a checkable task. [Context and memory]({{ '/docs/context-and-memory/' | relative_url }}) covers the source notes that make a visual workspace useful over time.
