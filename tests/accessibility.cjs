'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { siteConfiguration, startSite, browserOptions, assertLayout } = require('./browser.cjs');

function luminance(color) {
  const components = color.match(/[\d.]+/g)?.map(Number);
  assert(components && components.length >= 3 && (components.length === 3 || components[3] === 1), `Expected an opaque computed RGB color: ${color}`);
  const linear = components.slice(0, 3).map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

(async () => {
  const config = siteConfiguration();
  const axePath = process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
  fs.mkdirSync(config.output, { recursive: true });
  const site = await startSite(config.root);
  let browser;
  const report = { startedAt: new Date().toISOString(), source: config.root, audits: [], reflow: [], svgContrast: [] };
  try {
    browser = await chromium.launch(browserOptions());
    report.browser = await browser.version();
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const width of [360,1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of config.routes) {
        const response = await page.goto(site.base + route);
        assert.equal(response.status(), 200, route);
        await page.addScriptTag({ path: axePath });
        const audit = await page.evaluate(async () => {
          const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','best-practice'] } });
          return { version: axe.version, violations: result.violations, passes: result.passes.length,
            incomplete: result.incomplete.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.html) })) };
        });
        report.audits.push({ route, width, ...audit });
        // Axe cannot infer the painted circle behind SVG text. These particular
        // labels have opaque fills, so calculate their contrast independently.
        const labels = await page.locator('.flow-diagram [data-stage]').evaluateAll(stages => stages.map(stage => {
          const text = stage.querySelector('text'), circle = stage.querySelector('.flow-node');
          return { text: text.textContent, foreground: getComputedStyle(text).fill, background: getComputedStyle(circle).fill,
            textOpacity: getComputedStyle(text).fillOpacity, backgroundOpacity: getComputedStyle(circle).fillOpacity,
            groupOpacity: getComputedStyle(stage).opacity };
        }));
        for (const label of labels) {
          assert.equal(label.textOpacity, '1'); assert.equal(label.backgroundOpacity, '1'); assert.equal(label.groupOpacity, '1');
          const foreground = luminance(label.foreground), background = luminance(label.background);
          const ratio = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
          report.svgContrast.push({ route, width, ...label, ratio });
          assert(ratio >= 4.5, `Diagram text contrast on ${route}: ${JSON.stringify(label)}, ratio ${ratio}`);
        }
      }
    }
    for (const route of config.routes) {
      for (const [width, doubleText] of [[320,false],[720,true]]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(site.base + route);
        if (doubleText) await page.addStyleTag({ content: 'html{font-size:200%!important}' });
        const geometry = await assertLayout(page, route, width);
        report.reflow.push({ route, width, doubleText, ...geometry });
      }
    }
    const violations = report.audits.flatMap(audit => audit.violations.map(item => ({ route: audit.route, width: audit.width, id: item.id, impact: item.impact })));
    assert.deepEqual(violations, [], JSON.stringify(violations));
    report.success = true;
  } catch (error) {
    report.success = false; report.failure = error.stack;
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(config.output, 'accessibility-results.json'), JSON.stringify(report, null, 2) + '\n');
    if (browser) await browser.close();
    await site.close();
  }
  console.log(JSON.stringify({ success: report.success, audits: report.audits.length,
    svgContrast: report.svgContrast.length,
    violations: report.audits.flatMap(audit => audit.violations).length,
    incomplete: report.audits.filter(audit => audit.incomplete.length).map(audit => ({ route: audit.route, width: audit.width,
      checks: audit.incomplete.map(item => ({ id: item.id, nodes: item.nodes.length })) })),
    output: config.output }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
