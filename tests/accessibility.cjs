'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.SITE_ROOT || path.join(__dirname, '..'));
const out = path.resolve(process.env.REVIEW_OUTPUT || path.join(root, '..', 'review'));
const axePath = process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined});
  const report = {audits: [], contrast: [], reflow: []};
  try {
    const page = await browser.newPage();
    for (const width of [360, 1440]) {
      await page.setViewportSize({width, height: 1000});
      for (const filename of ['index.html', 'skills.html', 'app.html', 'setup.html']) {
        await page.goto('file://' + path.join(root, filename));
        await page.addScriptTag({path: axePath});
        const audit = await page.evaluate(async () => {
          const r = await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']}});
          return {version: axe.version, violations: r.violations, passes: r.passes.length, incomplete: r.incomplete.map(v => ({id: v.id, nodes: v.nodes.map(n => n.html)}))};
        });
        report.audits.push({filename, width, ...audit});
        assert.equal(audit.violations.length, 0, JSON.stringify(audit.violations));
      }
    }
    for (const width of [320, 720]) {
      await page.setViewportSize({width, height: 1000});
      await page.goto('file://' + path.join(root, 'index.html'));
      if (width === 720) await page.addStyleTag({content: 'html{font-size:32px}'});
      const size = await page.evaluate(() => ({viewport: innerWidth, scroll: document.documentElement.scrollWidth}));
      assert(size.scroll <= width); report.reflow.push({width, doubleRootFont: width === 720, ...size});
    }
    // Independently calculate the opaque illustration labels' contrast.
    function lum(hex) { const rgb = hex.match(/\w\w/g).map(s => parseInt(s, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722; }
    for (const [label, fg, bg] of [['Orbit labels','d7d8e2','161925'],['Center label','f6dfb1','161925'],['Figure caption','b4b6c5','10121e']]) {
      const a = lum(fg), b = lum(bg), ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05); assert(ratio >= 4.5); report.contrast.push({label,fg,bg,ratio:Math.round(ratio*100)/100});
    }
    fs.mkdirSync(out, {recursive: true}); fs.writeFileSync(path.join(out,'accessibility-final.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({audits:report.audits.length,violations:report.audits.flatMap(a=>a.violations).length,incomplete:report.audits.map(a=>({page:a.filename,width:a.width,checks:a.incomplete})),contrast:report.contrast,reflow:report.reflow},null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
