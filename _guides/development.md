---
layout: guide
title: Website development
description: Build the public Jekyll site, validate its output, and review a contribution locally.
order: 6
section: docs
reviewed: 2026-11-18
---
This repository contains the public Macrothought website and its skill pack. The site uses Jekyll to combine pages, a guide collection, shared layouts, and assets into a static build. A local contribution should leave a reviewer with a reproducible preview and evidence for the behavior it changes.

This guide covers the website workflow. The repository does not supply a public installer for the evolving 1.4 workspace application. Runtime setup and current application behavior need a separately verified source and handoff.

## Find the source for the change

Guides live in `_guides/`. Each guide has frontmatter for its layout, title, description, navigation order, section, and review date. The collection produces pages under `/docs/`. Shared layouts own the common page structure, while the guide's Markdown holds its content.

A new paragraph usually belongs in a guide. A repeated navigation problem usually belongs in a shared layout or asset. Start with the smallest source that owns the behavior and check where else that source is used. Generated files in `_site/` are useful for inspection after a build.

Use the existing internal-link pattern so links respect the configured site base URL.

{% raw %}
```liquid
[Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }})
```
{% endraw %}

Give a guide a useful description that explains what a reader can accomplish. Keep claims tied to their actual source and date. Label a synthetic example where the reader encounters it, and keep archived captures visibly dated.

## Build and verify

Use the Ruby and Bundler environment appropriate to the repository's Gemfile. The site targets Jekyll 3.10. Install the declared dependencies, build the site, and run the output verification.

```sh
bundle install
bundle exec jekyll build
python3 scripts/verify-site.py _site
```

A successful build creates `_site/`. For example, this guide is rendered to `_site/docs/development/index.html`. The verifier checks the generated site against the project's publishing rules. Preserve its actual output when reporting a change, including any failing path or condition.

Run the browser checks against that generated site.

```sh
SITE_ROOT=_site node tests/browser.cjs
```

The browser tooling uses Playwright and Chromium. Configure `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` for your installed tooling when required by the runner. The accessibility tooling also uses `AXE_PATH`. Use the paths documented by your environment and the repository test setup. A missing dependency is a blocked check that needs a specific setup correction.

## Complete one contribution

Suppose you are improving the guide index description for the fictional Field Atlas example. Create a separate working branch, inspect the current source, and write down the intended outcome: a reader can distinguish the workspace walkthrough from the development guide before opening either page.

Edit the two descriptions in their source frontmatter. Build the site and inspect the generated guide index. Run the verifier and browser checks. Then review the page at a wide viewport, a narrow viewport, and increased text zoom. Follow the guide links with the keyboard and confirm that focus is visible.

The expected deliverable is a small source diff and a recorded result. A hypothetical review note might read:

```text
Change: clarified the two guide descriptions.
Candidate: recorded source revision plus the reviewed diff.
Build: generated docs index and both guide pages.
Checks: attach verifier and browser output here.
Manual review: record viewport, zoom, and keyboard route.
Remaining work: list any check that could not be completed.
```

Fill those fields with observations from the actual candidate. A clean exit from one command supports the checks performed by that command. Visual reading order, content accuracy, and keyboard usability also deserve direct review.

## Prepare the handoff

Keep the source diff focused and identify every changed file. Record the commands, the candidate revision, and any environment requirement a reviewer will need. Give screenshots captions that identify the page and viewport. If a check fails, include the smallest reproducible input and its output with the repair task.

Deployment remains a distinct operation with its own authority and current build evidence. A useful local handoff can already include the complete candidate and its validation results, ready for that final decision.

## Continue reading

[Requirements and evidence]({{ '/docs/requirements-and-evidence/' | relative_url }}) provides the pattern for a reviewable change record. [Architecture]({{ '/docs/architecture/' | relative_url }}) explains the public site's place within the wider project. Review the [repository README](https://github.com/Tanzalastas/macrothought.org#readme) and the actual test runners alongside these instructions when the build tooling changes.
