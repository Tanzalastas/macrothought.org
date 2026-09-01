---
name: concurrent-agent-hygiene
description: Working rules for multiple agents sharing one repository, covering stale working trees, blanket adds, indistinguishable authors, and long-running processes that keep executing old code. Use this when more than one agent or worker commits to the same repo, or when a committed fix looks like it is not working.
---

# Concurrent Agent Hygiene

Two agents in one repository will each assume the tree is theirs alone, and
both will be wrong within a session. These rules come from real collisions: a
gate check that appeared mid-session which the current agent never wrote, and a
daemon emitting fresh failures from code fixed days earlier.

## Re-read HEAD before trusting your tree

Your mental model of the repo is a snapshot from the last time you looked, and
another agent may have committed between your turns. Before building on any
assumption about current state, re-read HEAD: check the log since your last
known commit and re-read any file you are about to reason about. In one real
case a registry of checks grew from 13 to 14 members mid-session, committed by
a second worker, and every inference from "there are 13 checks" was quietly
wrong from then on.

After any gap in your session, run the full test suite and any gates before
starting new work. The combined tree can be red from someone else's change, and
if you discover that only after your own edits, you will debug under the false
assumption that you broke it.

## Commit only your own files

Never blanket-add. `git add -A` and `git add .` stage whatever else is in the
tree, including a second agent's half-finished work, which then ships under
your commit message. Add files by explicit path and review `git status` before
committing. If you see modified files you did not touch, leave them alone and
note them; they belong to somebody else's in-flight change.

## Author identity does not distinguish agents

Every agent committing through the same checkout inherits the same configured
author, so the log shows one name for all of them. Never attribute a commit to
yourself or to another agent from the author field. Weak signals that do
distinguish work: commit message style and timing clusters. The authoritative
record of what you did is your own session transcript. And a commit message
claiming a fix is a claim; verify by execution before you rely on it.

## Long-running processes run the code they loaded

A daemon holds the code it imported at startup. A fix you commit afterward sits
on disk, inert, until the process restarts. The trap is what the stale output
looks like: the daemon keeps emitting bad data after your correct fix, the new
data reads as "your fix failed", and it invites you to re-edit code that is
already right. The real question is which code is executing, and the check
takes seconds. Compare the process start time against the module's mtime:

```bash
ps -eo pid,lstart,cmd -p <pid>
stat -c '%y' <module>
```

If the process predates the fix, the running code is stale. Then:

1. Verify the fix against a fresh process. A throwaway instance on a spare port
   touches nothing and proves the fix on current code.
2. Do not silently restart a long-running process an operator started; it may
   hold in-flight work. Surface the staleness and let them pick the restart
   window.
3. After fixing anything, ask which long-lived processes import it. Keep a list
   of the daemons in your project and what each one loads.

## Rules

- Re-read HEAD after every gap. Run the suite before new work.
- Add by explicit path. Never `git add -A` in a shared tree.
- The author field proves nothing; your transcript is the record.
- A committed fix is inert until every process that imports it restarts.
