# Macrothought

The public website at https://macrothought.org and the MIT-licensed Macrothought skill pack. The website describes working local capabilities, isolated previews, experimental functionality, and the galaxy workspace direction.

## Website

Four static HTML pages share assets/site.css and assets/site.js. The synthetic galaxy and interaction example use invented data. There are no account, payment, or provider calls from the website. Contact: macrothought@macrothought.org. Existing-account and prior-purchase questions are directed to the same mailbox without promising a service or response time.

GitHub Pages publishes main from the repository root. CNAME remains macrothought.org. public-files.json is the exact deployment allowlist. _config.yml excludes source tooling, plugin documents, and legacy media from the website build while preserving them in this repository. A local Jekyll 3.10.0 build must match the allowlist before deployment. No private review materials belong here.

## Public skills

Four departments, seventeen skills. Each department installs independently:

```
/plugin marketplace add Tanzalastas/macrothought.org
/plugin install verification@macrothought
```

The departments cover verification, second-brain memory, decision discipline, and orchestration. Read skills.html and plugins/ for descriptions and source. Instructions support your workflow; results depend on your tools, permissions, and checks.

## Validation

The test runners in tests/ use Playwright and axe-core. Set PLAYWRIGHT_MODULE, CHROMIUM_PATH, and AXE_PATH for your installed tooling. Browser tests check layouts, navigation, mailto targets without sending email, synthetic view selection, and skill search. Accessibility tests complement manual checks; they are not a certification.

## Credit and license

The department-plugin structure credits [headcount](https://github.com/cbrock84/headcount) by Chris Brock. The Macrothought skills and original site artwork are MIT licensed; see LICENSE. Legacy media are retained in Git but excluded from this release's website output.
