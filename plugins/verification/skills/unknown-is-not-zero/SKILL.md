---
name: unknown-is-not-zero
description: Enforces the rule that missing data, failed measurements, and empty states stay visibly distinct from a measured zero. Use this when designing any dashboard, report, gate, or log output, and whenever a zero, a blank panel, or a clean report might actually mean nothing was measured.
---

# Unknown Is Not Zero

The rule underneath most verification failures: a value that was never measured must remain
distinguishable from a measured zero, everywhere the value travels. Systems lose this
distinction one small default at a time, and every loss eventually asserts something false. A
gate that counted a recorded failure as "audited" and a metric flatlining at 0 for a dead
subsystem are the same rule broken at different layers.

## Where the distinction dies

- **Defaults at read time.** A metric reads a file its writer never writes and returns 0. The
  dashboard draws a calm flat line for a component that has been down for weeks.
- **Aggregation.** A sum treats absent rows as contributing nothing, which renders identically
  to zero. "0 errors" and "the error log was unreachable" become the same pixel.
- **Skips.** A skip flag leaves critical checks with no result row, and the report reads clean
  because clean and skipped share a rendering.
- **Filters matching nothing.** A test selector that matches zero tests passes. Zero selected
  and zero failed are different facts.
- **Demotion.** Work that was never started gets recorded as failed because a sweep visited
  it. Not-attempted and attempted-and-failed are different facts with different fixes.

## The rendering rule

Withheld rendering beats fabricated defaults. When a value is unknown:

- **Dashboards:** render a distinct marker with its own visual treatment, such as a dash or a
  "no data" chip. Never draw the zero position on the axis. A blank panel must say which blank
  it is: never-populated, failed-to-load, filtered-to-empty, or measured-empty.
- **Reports and gates:** name the unknowns. "3 of 7 verified by regeneration, 4 UNKNOWN" with
  the four listed is a real status. "3 passed" with the rest silently absent is a lie told by
  aggregation.
- **Logs and alerts:** a notification saying "no data arrived" beats a silent 0. Make silence
  itself an event once staleness crosses a threshold, because the failure that stops the data
  is usually the same failure that would have stopped the alert.

## The vocabulary

Give every measurement at least three states: MEASURED, MISSING, PARTIAL. Carry the state
through the pipeline as data, alongside the value, so a renderer three layers away can still
tell them apart. The moment the state collapses into the value ("just use 0"), the layers
above can never recover the distinction.

## The audit

Walk each metric from writer to renderer and list every point where absence becomes a value.
The usual conversion sites: dict lookups with a default of 0, SQL COALESCE, missing-file
fallbacks, sums over possibly-empty lists, chart libraries plotting null at the baseline. Each
site is a place the system will one day report health during an outage. Replace the default
with an explicit unknown state, or make the conversion loud.

## Why this is a product feature

Trust survives disclosed failure and dies on discovered failure. A system that renders "I do
not know" honestly gives its users the material to calibrate trust; a system that only ever
shows confident numbers reads as a demo. Users who cannot audit your pipeline can absolutely
see a dash in a table and a coverage meter on a headline number. Build the miss path on
purpose: what renders when the answer is empty, stale, or unmeasured is a designed surface,
and its absence in a demo tells you the surface was never built.
