---
name: department-memory-design
description: Organizes durable agent memory into department folders with one topic per note, a single loaded index, and hub notes over atomic children. Use this when setting up long-term memory for an agent or a knowledge vault, or when an existing store has rotted into large append-only files nobody can retrieve from.
---

# Department Memory Design

## The shape

Durable memory lives in one folder tree of plain markdown. Each department is one
domain being managed: a game project, a home server, a household budget, a research
effort. A note belongs to the department that owns its topic, and a general
catch-all department takes anything that fits nowhere yet. Capabilities that cut
across domains (search tooling, writing conventions) are skills and sit outside
the departments.

Three rules govern every note:

1. One topic per note. If a note answers two unrelated questions, it is two notes.
2. Update, do not append. When a fact changes, edit the sentence that held the old
   fact. Appending a correction below the original leaves both versions live and
   forces every future reader to adjudicate between them.
3. Link on write. Reference neighboring notes by name at the moment of writing,
   while the connection is still obvious. Retrofitting links later never happens.

## The single loaded index

One index file loads into every session. It carries one line per durable note: the
note name plus a pointer sentence saying what the note holds. The index is the
retrieval surface. Recall means scanning the index, then opening only the best
note and pulling the answering section. If a pointer line cannot tell you whether
to open its note, the pointer has failed and should be rewritten.

The index has exactly one writer: the agent, in session, with judgment. Automated
jobs may report on it (flag over-budget lines, flag pointers to deleted notes) but
never edit it. File age is not importance, so no script gets to reorder or prune
the index either.

## Hubs and atomic children

When a topic outgrows a few screens, split it into a hub with atomic children. The
hub keeps a one-paragraph overview plus links; each child holds one subtopic. The
hub answers "where is X" and the child answers X, so retrieval stays cheap at both
levels. A note past roughly 15 KB is a split candidate. Split the biggest one
first, preserving its links, and do one split per maintenance pass.

## When to split a department

Split when a department passes roughly 20 notes, or when a cluster inside it has
developed its own vocabulary and its own maintenance cadence. Move the cluster to
a new folder with its own hub note, and update the index pointers in the same
edit so the index never points at a stale location.

## Why append-only files rot

An append-only memory file grows into a 50 KB log where the current fact is buried
under six superseded versions of itself. Retrieval degrades first: a search
returns every era of the fact and the reader cannot tell which one is current.
Contradictions accumulate because nothing forces the old claim to die when the new
one arrives. Eventually the file is too large to load and too tangled to split, so
it gets abandoned and a fresh file starts the same cycle. Update-in-place keeps
each note the size of its topic and keeps exactly one version of every fact alive.
