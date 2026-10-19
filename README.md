# Macrothought website — isolated review

A static redesign of macrothought.org, based on the existing website repository at `2c088f94a49fb2014309d844b99f1375d8653903`. This is an unpublished review candidate. All pages carry `noindex,nofollow`.

Open `index.html` directly, or run `python3 -m http.server 8859 --bind 127.0.0.1` from this directory and visit `http://127.0.0.1:8859`. No build, package install, provider account, or API is required. JavaScript enhances the example and skill search; core content works without it.

## Content

- `index.html`: project story, synthetic galaxy illustration and three-view interaction, workflows, dated status, architecture, public next steps.
- `skills.html`: existing seventeen skill descriptions and source links, refreshed styling and accessible search.
- `app.html`, `setup.html`: informational review pages replacing unverified account/checkout flows in this candidate only.
- `assets/site.css`, `assets/site.js`: shared responsive presentation and small standalone interactions.
- `assets/galaxy.svg`, `assets/favicon.svg`: original synthetic artwork. Rebuild the deterministic galaxy with `python3 scripts/create-galaxy.py`.
- `plugins/` and `.claude-plugin/`: original skill pack, unchanged.

No analytics, external fonts, remote script dependencies, payment actions, account API calls, live transcripts, or private project data are included in the new pages. Existing source media are retained in Git but are not referenced by the redesign or copied into the portable preview.

## Claims and boundaries

Status is dated 19 October 2026. Working local tools, independently reviewed isolated fixes, newer isolated UX work, experimental governance, and roadmap direction have different labels. The galaxy is a website illustration, not the application renderer. Its example data and activity are invented. A connected Sol chat bridge is not established.

The public site repository and the MIT-licensed skill pack remain public references. The complete Consulate source is not presented as a public download. Earlier commercial offers, mailbox delivery, hosted account access, releases, and deployment settings require owner verification before a publishing decision. No paid services or live systems were changed.

## Review and publishing

Private evidence, screenshots, tests, source-preservation records, a claim matrix, and a publishing checklist are supplied separately in the review bundle. The source checkout remains unchanged. No remote is configured for this isolated branch. Do not publish the private review directory.

Before any deployment, obtain explicit authorization, reconcile current canonical source and deployment settings, resolve the old commercial/account routes, verify all public destinations, remove the preview indexing directive deliberately, and run the browser checks against the exact staged files. `CNAME` remains unchanged; its presence is not deployment authorization.

## Credit and license

The existing Macrothought wordmark, color lineage, plugin content, and MIT license are retained. The department-plugin structure credits [headcount](https://github.com/cbrock84/headcount) by Chris Brock. See `LICENSE`.
