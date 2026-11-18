---
layout: post
title: "Building a field guide you can enter sideways"
description: "A clipped tablet label, a dated map recording, and a reader arriving on page three shaped the new site."
date: 2026-11-18 02:40:29 -0500
category: Journal
section: devlog
evidence_status: "Editorial candidate · earlier layout repair verified locally"
---

Someone following a link to a July recording might want to see what the map looked like. Someone who lands on a skill page might want an installation command. The old landing page put a long introduction between those people and their questions. In this edition, the [field guide]({{ '/docs/' | relative_url }}) carries the how-to material. The [journal]({{ '/devlog/' | relative_url }}) gives dated changes a permanent address, and the [status page]({{ '/status/' | relative_url }}) records where the project stands. You can enter through any one of them.

## A tablet case that shaped the review

The earlier website put a large galaxy illustration beside its opening text. On a tablet, the artwork extended beyond its column. That suited the stars, which could disappear into the edge of the page. It was a problem for the label **Projects** at the right of the figure. A reader could see the beginning of the word, but the last letters fell outside the visible area.

The page passed a common responsive layout check. Its overall width matched the viewport and no horizontal scrollbar appeared. The same clipping that hid the letters also kept the page from overflowing. A test that measured the document could therefore pass while a reader lost text.

At a viewport width of 834 pixels, the text ended at about pixel 838. At 1050 pixels wide it ended near 1068. A second case involved a reader increasing the spacing between letters and words. At 761 pixels wide the caption extended beyond the figure as well.

The change moved the label inward and gave the caption a width that allows it to wrap. The regression check measured the rectangle occupied by the text itself against the visible edges of the hero. On the repaired page, the tablet label ended near pixel 806 and the spaced caption fit inside the figure. The original mobile placement was preserved on the 390-pixel view.

## Keep the date attached to the picture

The galaxy in that test was a website illustration. The [July map archive]({{ '/devlog/exploring-the-map/' | relative_url }}) contains images taken from the application. A reader should be able to tell which kind of image they are looking at even if they arrive through a link halfway down an article. We give the figure a descriptive caption, name the view and keep the capture date with the image.

The July recording has two dates that matter. The recording dates from July, and the journal entry interpreting it dates from November. The entry header gives the publication date and the period it covers. The recording itself has a poster so the reader can see what it contains before pressing play. A written description beneath the player follows the points through the sequence for anyone reading without motion.

## Build one record, give it several homes

A map caption used on the home page also appears in the journal. Keeping a separate copy of its date, title and link in each page would make a small correction surprisingly easy to miss. The site now holds those fields together in a media record. Its source commit identifies the archived revision and its checksum identifies the exact asset. Whenever a page asks for that figure, the same template places the caption and provenance link underneath.

Journal entries work in much the same way. The author writes one Markdown file, supplies its date and category, and lets the layout create the article header, breadcrumbs and reading links. Editing an older entry can preserve the original event date. For the next build, the tablet case gives us a concrete reading check alongside the links and media checks: open a deep link, identify the capture date and read its entire caption at increased text spacing.
