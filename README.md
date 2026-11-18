# Macrothought

The public website and MIT-licensed skill pack for Macrothought. This editorial release adds a Consulate tour, seven practical guides, a dated project journal, and a status/roadmap page.

## Build and preview

Use Ruby 3.3, Bundler 2.5, and the dependencies pinned in `Gemfile.lock` (Jekyll 3.10.0). The build uses standard Jekyll layouts and Markdown; it requires no application server or private Consulate connection.

```sh
bundle install
python3 scripts/build-preview.py /tmp/macrothought-review
python3 -m http.server 8000 --bind 127.0.0.1 --directory /tmp/macrothought-review
```

Open `http://127.0.0.1:8000/`. Each preview destination must be new; the builder preserves existing outputs. The build verifies exact membership against `public-files.json`, local links and fragments, document structure, media hashes, sitemap routes, and journal RSS. Review reports can be written outside the document root with `--report /tmp/macrothought-review.json`.

## Content

- `_guides/`: Markdown documentation, ordered by frontmatter `order`. Guides publish under `/docs/<filename>/`.
- `_posts/`: journal entries with publication dates, descriptions, categories, and evidence status. Historical event dates stay separate from publication dates.
- `_layouts/` and `_includes/`: shared navigation, article layouts, accessible media, and explanatory diagrams.
- `_data/media.yml`: the exact historical assets selected for review, including source revisions, dates, hashes, descriptions, and publication status.
- `_data/release.yml`: release-review state. `_data/flows.yml` holds the steps in the two illustrative motion sequences.

Existing `app.html`, `setup.html`, and `skills.html` URLs remain available. The footer links directly to the Consulate documentation reference. New articles automatically enter the journal index and RSS feed; the homepage shows the latest three.

## Public evidence boundary

The editorial release uses reviewed historical project captures from July 2026. They do not establish current 1.4.x behavior. A verified current capture export and the requested five-minute showcase recording are not present in this cloud checkout. Track these as pending inputs rather than reconstructing product screens.

A short, frame-verified excerpt of the historical map recording ends before the later focus sequence exposes individual record titles. The untrimmed recording and unrelated legacy assets remain excluded from the generated website.

New public content must come from explicitly approved project summaries, assets, status/devlog, and provenance. Do not import raw mailbox, Google Admin, personal documents, private URLs, credentials, or operational records. The historical application glossary informs a sanitized reading reference; the website does not mirror its private inventory or controls.

The user authorized deployment of reviewed candidate `e654d70de276176992fc7515cb66145886d0d2c1` on November 18, 2026, including the selected historical media. The release metadata records that approval. To check publication readiness without deploying:

```sh
python3 scripts/verify-site.py /tmp/macrothought-review --publication
```

This fails if the release or any included media is unapproved. Run this publication check for every release. A passing preview check alone is not permission to publish. Keep the existing GitHub Pages main/root destination and CNAME unchanged. Later publication requires the applicable authorization.

## Validation

Browser runners use Playwright, Chromium, and axe-core. Set `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, and `AXE_PATH` for your installed tooling. Both runners serve the built output on a temporary loopback HTTP port and close it after the run.

```sh
SITE_ROOT=/tmp/macrothought-review REVIEW_OUTPUT=/tmp/macrothought-browser node tests/browser.cjs
SITE_ROOT=/tmp/macrothought-review REVIEW_OUTPUT=/tmp/macrothought-a11y node tests/accessibility.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

Checks cover all allowlisted pages, narrow/tablet/desktop layouts, enlarged and spaced text, navigation, article contents, skill filtering, the synthetic view study, media disclosures, controlled motion, no-JavaScript reading, reduced motion, and accessibility. Automated checks complement visual and content review; counts are not performance measurements.

## Public skills

Four departments, seventeen skills. In an environment supporting Claude Code plugins:

```text
/plugin marketplace add Tanzalastas/macrothought.org
/plugin install verification@macrothought
```

See `skills.html`, the getting-started guide, and `plugins/` for source. These are workflow instructions; results depend on your tools, permissions, and checks. Contact: macrothought@macrothought.org.

## License

The Macrothought skills and original site artwork are MIT licensed; see LICENSE. Capture provenance and publication decisions are recorded separately.
