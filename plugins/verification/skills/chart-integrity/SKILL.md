---
name: chart-integrity
description: Detects charts that are structurally unable to disagree with their own thesis, such as many series that are one curve times fixed weights or baselines fabricated as history. Use this before plotting anything derived from a spreadsheet, a workbook export, or a pipeline you did not write.
---

# Chart Integrity

A series that cannot diverge from its siblings is a multiplication, and it will read as
measurement. This is the visualization form of a check that cannot fail: two facts collapsed
into one signal, except here the signal is a line on a chart. One real workbook audit found
164 "daily series" that were all one curve times fixed weights; every shape below comes from
that audit.

## The three shapes

**1. Constant-share reconstruction.** A dashboard shows 16 sector series over a month. Each is
a fixed fraction of one parent total, constant to 1e-16 across every day. The sheet encodes 16
scalars presented as 16 time series. Stacked, they draw an area chart in which no sector can
ever outperform another. The chart cannot disagree with the allocation, so it says nothing.

**2. Scope splice.** The final day of a series is overwritten with a snapshot from a wider
scope, for example an account first observed that day. Every derived series then ends with an
identical fabricated spike. One holding's plotted line ended more than 40 points away from its
real two-week move. A reconstruction that projects today's scope backwards over dates when
that scope was not observed is a fabrication, and no label fixes it.

**3. Synthetic baseline.** A "two weeks ago" value computed as today's quantity times an old
close, for holdings not held on that date. The headline growth number then measures a backtest
of the current allocation rather than a return on money that was at risk. The nearby variant:
cost bases set days before the measurement, so "gain vs cost" measures days of drift.

## The cheap ratio test

For each series, compute `series[d] / parent[d]` for every date d. If max minus min across all
dates sits at floating-point noise, the series carries no information below its parent: it is
one scalar. Deviation that scales with share magnitude is the signature of a single multiply.
The same test's endpoint behavior exposes a scope splice: an identical final-day jump in every
series is one overwrite, never many measurements. Run this before choosing a chart type. It
costs one loop.

## Separate measured from reconstructed before choosing a chart

Split every series into points actually observed and points derived, before any rendering
decision. If only three balances were ever measured, that is a three-point chart, and a
three-point chart is honest. The chart type follows the measured data. Reconstruction may
appear as clearly marked context, never as the line itself.

## When a series fails the test

- **Refuse to plot it, and print the proof.** State the identity you found, for example
  `total(d) = parent(d) x 0.2686`, so the omission is checkable instead of taken on trust. An
  omission the reader can verify beats a caveat the reader must believe.
- **Put the qualifier in the KPI itself.** A coverage meter or a "79.6% back-priced" pill next
  to the headline number, because the number is what gets quoted. Footnotes do not travel.
- **Preserve null as null through the whole pipeline.** A series with no verified value
  renders a visible no-data marker, never a flat zero bar. Unknown must stay distinguishable
  from zero.

## Render it and look

Static verification confirms the page is well-formed; only looking confirms the chart works.
Render it and ask: is there a plausible alternative world in which this chart would look
different? If every input draws the same picture, the chart illustrates an assumption. Back
the eye with hard assertions in the data pipeline that fail the build loudly; in the audit
above, 47 of them caught discrepancies the eye had missed. Then re-derive the shipped numbers
from the raw source through a separate code path. Agreeing with yourself proves nothing.
