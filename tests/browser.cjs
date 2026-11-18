'use strict';
// Exercise the built site over a temporary loopback server.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

function siteConfiguration() {
  const project = path.resolve(__dirname, '..');
  const root = path.resolve(process.env.SITE_ROOT || path.join(project, '_site'));
  const output = path.resolve(process.env.REVIEW_OUTPUT || path.join(project, '..', 'editorial-site-review'));
  const manifest = JSON.parse(fs.readFileSync(path.join(project, 'public-files.json'), 'utf8'));
  const routes = manifest.files.filter(file => file.endsWith('.html')).map(file =>
    '/' + file.replace(/(?:^|\/)index\.html$/, match => match.startsWith('/') ? '/' : ''));
  assert(routes.length > 0, 'The output manifest must contain HTML pages');
  for (const file of manifest.files) assert(fs.existsSync(path.join(root, file)), `Missing built file ${file}`);
  return { project, root, output, routes };
}

async function startSite(root) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    let filename;
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      filename = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    } catch {
      response.writeHead(400); response.end(); return;
    }
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    fs.readFile(filename, (error, data) => {
      response.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' });
      response.end(error ? 'Not found' : data);
    });
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}

function browserOptions() {
  return { headless: true, executablePath: process.env.CHROMIUM_PATH || undefined };
}

async function prepareScreenshot(page) {
  // Full-page capture does not scroll lazy images into view. Load the existing
  // sources before capturing so the evidence includes their actual pixels.
  await page.locator('img').evaluateAll(async images => {
    await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); }));
  });
}

async function assertLayout(page, route, width) {
  const geometry = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('main,header,footer,nav,a,button,input,select,h1,h2,h3,p,figcaption')]
      .filter(element => {
        if (element.closest('pre') || element.classList.contains('skip')) return false;
        if (!element.checkVisibility()) return false;
        // Wide code, tables and inspected images may scroll inside a bounded
        // region. Its offscreen descendants do not imply page-level overflow.
        for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
          const box = ancestor.getBoundingClientRect();
          if (['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowX) &&
              ancestor.scrollWidth > ancestor.clientWidth && box.left >= -1 && box.right <= innerWidth + 1) return false;
        }
        const box = element.getBoundingClientRect();
        return element.getClientRects().length && box.width > 0 && (box.right > innerWidth + 1 || box.left < -1);
      }).map(element => ({ tag: element.tagName, text: element.textContent.trim().slice(0,80) }))
  }));
  assert(geometry.scrollWidth <= width + 1, `${route} page overflow at ${width}px: ${JSON.stringify(geometry)}`);
  assert.deepEqual(geometry.overflow, [], `${route} element overflow at ${width}px: ${JSON.stringify(geometry.overflow)}`);
  return geometry;
}

async function scrollRegionChecks(page, route) {
  const regions = page.locator('.table-scroll,table,pre,.media-zoom');
  const checked = [];
  for (let index = 0; index < await regions.count(); index++) {
    const region = regions.nth(index);
    const scrollable = await region.evaluate(element => element.checkVisibility() &&
      ['auto', 'scroll'].includes(getComputedStyle(element).overflowX) && element.scrollWidth > element.clientWidth + 1);
    if (!scrollable) continue;
    assert(await region.evaluate(element => element.tabIndex >= 0), `Scrollable content needs keyboard focus on ${route}`);
    await region.evaluate(element => { element.scrollLeft = 0; });
    await region.focus();
    assert(await region.evaluate(element => document.activeElement === element), `Cannot focus scrollable content on ${route}`);
    await region.press('ArrowRight');
    // Poll from Node: browser requestAnimationFrame polling is unavailable in
    // the no-JavaScript context even though native keyboard scrolling works.
    let scrolled = false;
    for (let attempt = 0; attempt < 40 && !scrolled; attempt++) {
      scrolled = await region.evaluate(element => element.scrollLeft > 0);
      if (!scrolled) await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert(scrolled, `ArrowRight did not scroll focused content on ${route}`);
    checked.push({ route, element: await region.evaluate(element => element.tagName), keyboardScroll: true });
    await region.evaluate(element => { element.scrollLeft = 0; });
  }
  return checked;
}

async function inspectorChecks(page, base) {
  await page.goto(base + '/consulate/');
  await page.locator('#panel-map [data-node="source-library"]').click();
  await page.getByRole('tab', { name: 'Files', exact: true }).click();
  assert.equal(await page.locator('#object-id').textContent(), 'example:source-library');
  assert.equal(await page.locator('#panel-files [data-node="source-library"]').getAttribute('aria-pressed'), 'true');
  await page.locator('#panel-files [data-node="review-checklist"]').click();
  await page.getByRole('tab', { name: 'Activity', exact: true }).click();
  assert.equal(await page.locator('#object-id').textContent(), 'example:review-checklist');
  await page.getByRole('tab', { name: 'Activity', exact: true }).focus();
  for (const [key, id] of [['Home','map'],['ArrowRight','files'],['End','activity'],['ArrowLeft','files']]) {
    await page.keyboard.press(key);
    assert.equal(await page.locator(`#tab-${id}`).getAttribute('aria-selected'), 'true');
  }
}

async function skillChecks(page, base) {
  await page.goto(base + '/skills.html');
  assert.equal(await page.locator('.sk:visible').count(), 17);
  const input = page.locator('#q');
  await input.fill('zzzz-no-matching-skill');
  assert.equal(await page.locator('.sk:visible').count(), 0);
  assert.match(await page.locator('#skill-count').innerText(), /^0 skills/);
  assert(await page.locator('#no-results').isVisible());
  await input.fill('context-packs');
  assert.equal(await page.locator('.sk:visible').count(), 1);
  assert.match(await page.locator('#skill-count').innerText(), /^1 skill\b/);
  await input.fill('');
  assert.equal(await page.locator('.sk:visible').count(), 17);
}

async function motionChecks(page, base, route) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + route);
  const examples = page.locator('[data-motion]');
  for (let i = 0; i < await examples.count(); i++) {
    const example = examples.nth(i);
    const steps = example.locator('[data-motion-step]');
    const play = example.locator('[data-motion-play]');
    const reset = example.locator('[data-motion-reset]');
    assert(await steps.count() >= 2, 'Motion example needs distinct selectable steps');
    assert.equal(await example.locator('[data-motion-step][aria-pressed="true"]').count(), 1);
    assert.equal(await example.locator('svg [data-stage].is-active').count(), 1);
    assert.equal(await example.locator('svg [data-stage].is-active').getAttribute('data-stage'), '0');
    assert(await play.isDisabled(), 'Automatic motion must be disabled under reduced motion');
    assert.doesNotMatch(await play.innerText(), /pause/i, 'Motion should start in a static state');
    const initialCaption = await example.locator('[data-motion-caption]').textContent();
    await steps.last().click();
    assert.equal(await steps.last().getAttribute('aria-pressed'), 'true');
    assert.equal(await example.locator('svg [data-stage].is-active').getAttribute('data-stage'), await steps.last().getAttribute('data-motion-step'));
    assert.notEqual(await example.locator('[data-motion-caption]').textContent(), initialCaption);
    await reset.click();
    assert.equal(await steps.first().getAttribute('aria-pressed'), 'true');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(element => !element.disabled, await play.elementHandle());
    await page.clock.fastForward(5000);
    assert.equal(await steps.first().getAttribute('aria-pressed'), 'true', 'Motion must remain static until playback is requested');
    await play.click();
    await page.waitForFunction(element => /pause/i.test(element.textContent), await play.elementHandle());
    await page.clock.fastForward(2500);
    assert.equal(await steps.first().getAttribute('aria-pressed'), 'false', 'Requested playback must advance the diagram');
    await play.click();
    assert.doesNotMatch(await play.innerText(), /pause/i);
    const pausedStep = await example.locator('[data-motion-step][aria-pressed="true"]').getAttribute('data-motion-step');
    await page.clock.fastForward(5000);
    assert.equal(await example.locator('[data-motion-step][aria-pressed="true"]').getAttribute('data-motion-step'), pausedStep, 'Pause must stop the diagram');
    await play.click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(element => element.disabled && !/pause/i.test(element.textContent), await play.elementHandle());
    const reducedStep = await example.locator('[data-motion-step][aria-pressed="true"]').getAttribute('data-motion-step');
    await page.clock.fastForward(5000);
    assert.equal(await example.locator('[data-motion-step][aria-pressed="true"]').getAttribute('data-motion-step'), reducedStep, 'A reduced-motion preference change must stop active playback');
    await reset.click();
    assert.equal(await steps.first().getAttribute('aria-pressed'), 'true');
  }
  return await examples.count();
}

async function videoPlaybackChecks(page, base, sources) {
  const results = [];
  for (const [src, route] of sources) {
    await page.goto(base + route);
    const index = await page.locator('video').evaluateAll((videos, source) => videos.findIndex(video =>
      new URL(video.currentSrc || video.querySelector('source').src, document.baseURI).pathname === source), src);
    assert(index >= 0, `Missing reviewed recording ${src}`);
    const video = page.locator('video').nth(index);
    await video.evaluate(element => element.play());
    await page.waitForFunction(element => element.readyState >= 2 && element.currentTime > 0,
      await video.elementHandle(), { timeout: 15000 });
    const playback = await video.evaluate(element => {
      element.pause();
      return { paused: element.paused, duration: element.duration, currentTime: element.currentTime,
        videoWidth: element.videoWidth, videoHeight: element.videoHeight };
    });
    assert(playback.paused, `Recording failed to pause: ${src}`);
    assert(Number.isFinite(playback.duration) && playback.duration > 0 && playback.duration < 3600,
      `Unexpected preview recording duration: ${src}`);
    assert(playback.videoWidth > 0 && playback.videoHeight > 0, `Recording has no decoded frame: ${src}`);
    results.push({ src, route, ...playback });
  }
  return results;
}

async function run() {
  const config = siteConfiguration();
  fs.mkdirSync(path.join(config.output, 'screenshots'), { recursive: true });
  const site = await startSite(config.root);
  let browser, lastPage;
  const result = { startedAt: new Date().toISOString(), source: config.root, routes: config.routes,
    layouts: [], reflow: [], zoomEquivalent: [], scrollRegions: [], videoPlayback: [], heroText: [], interactions: [], links: [], errors: [], externalRequests: [] };
  const motionRoutes = new Set();
  const mediaRoutes = new Set();
  const videoSources = new Map();
  try {
    browser = await chromium.launch(browserOptions());
    result.browser = await browser.version();
    for (const width of [320,360,761,834,1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', hasTouch: width < 900 });
      const page = await context.newPage();
      lastPage = page;
      page.on('pageerror', error => result.errors.push(error.message));
      page.on('request', request => { if (!request.url().startsWith(site.base)) result.externalRequests.push(request.url()); });
      for (const route of config.routes) {
        const response = await page.goto(site.base + route);
        assert.equal(response.status(), 200, route);
        assert.equal(await page.locator('main').count(), 1, route);
        assert.equal(await page.locator('h1').count(), 1, route);
        await assertLayout(page, route, width);
        result.scrollRegions.push(...await scrollRegionChecks(page, route));
        const contacts = await page.locator('a[href^="mailto:"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
        assert(contacts.length > 0 && contacts.every(href => href === 'mailto:macrothought@macrothought.org'), `Unexpected contact destination on ${route}`);
        result.layouts.push({ route, width });
        const videos = await page.locator('video').evaluateAll(nodes => nodes.map(video => ({ controls: video.controls, autoplay: video.autoplay, preload: video.preload,
          src: new URL(video.currentSrc || video.querySelector('source').src, document.baseURI).pathname })));
        assert(videos.every(video => video.controls && !video.autoplay && video.preload === 'none'), `Unexpected automatic video on ${route}`);
        for (const video of videos) videoSources.set(video.src, route);
        if (await page.locator('[data-motion]').count()) motionRoutes.add(route);
        if (await page.locator('.media-detail').count()) mediaRoutes.add(route);
        if ([360,834,1440].includes(width) && ['/', '/consulate/', '/docs/', '/devlog/', '/status/'].includes(route)) {
          const name = route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, '');
          await prepareScreenshot(page);
          await page.screenshot({ path: path.join(config.output, 'screenshots', `${name}-${width}.png`), fullPage: true });
        }
      }
      await inspectorChecks(page, site.base);
      await skillChecks(page, site.base);
      result.interactions.push({ width, inspectorIdentity: true, inspectorKeyboard: true, skillSearch: true });
      await context.close();
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    lastPage = page;
    for (const route of config.routes) {
      await page.goto(site.base + route);
      const hrefs = await page.locator('a[href]').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('href')))]);
      for (const href of hrefs) {
        const url = new URL(href, site.base + route);
        if (url.origin !== site.base) continue;
        const response = await page.request.get(url.href.split('#')[0]);
        assert.equal(response.status(), 200, `${route} links to ${href}`);
        if (url.hash) {
          await page.goto(url.href);
          assert(await page.evaluate(id => Boolean(document.getElementById(id)), decodeURIComponent(url.hash.slice(1))), `Missing target ${href} from ${route}`);
        }
        result.links.push({ route, href, status: 200 });
      }
      if (route.startsWith('/docs/') && route !== '/docs/') {
        await page.goto(site.base + route);
        const headings = await page.locator('.article-content h2').evaluateAll(nodes => nodes.map(node => node.id));
        assert(headings.length > 0, `Guide missing section headings ${route}`);
        const toc = await page.locator('[data-toc] a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
        assert.deepEqual(toc, headings.map(id => '#' + id), `Incomplete guide contents ${route}`);
      }
    }
    result.interactions.push({ localLinks: true, guideContents: true });
    for (const route of config.routes) {
      for (const [width, style, name] of [[720, 'html{font-size:200%!important}', 'double-root-text'], [320, '*{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}p{margin-bottom:2em!important}', 'custom-spacing']]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(site.base + route);
        await page.addStyleTag({ content: style });
        await assertLayout(page, route, width);
        result.scrollRegions.push(...await scrollRegionChecks(page, route));
        result.reflow.push({ route, width, setting: name });
      }
    }
    // Equivalent rendering dimensions for a 1440px display at 200% zoom:
    // 720 CSS pixels at 2 device pixels per CSS pixel. This is a viewport
    // simulation, separate from the root-font enlargement checks above.
    const zoomContext = await browser.newContext({ viewport: { width: 720, height: 500 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const zoomPage = await zoomContext.newPage();
    lastPage = zoomPage;
    for (const route of config.routes) {
      await zoomPage.goto(site.base + route);
      await assertLayout(zoomPage, route, 720);
      result.zoomEquivalent.push({ route, cssWidth: 720, deviceScaleFactor: 2, equivalentDisplayWidth: 1440 });
    }
    await zoomContext.close();
    lastPage = page;
    // Keep the clipping check for the historical illustration wherever it is used.
    for (const route of ['/', '/consulate/']) {
      for (const [width, customSpacing] of [[761,true],[834,false],[1050,false],[1440,false]]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(site.base + route);
        if (customSpacing) await page.addStyleTag({ content: '*{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}p{margin-bottom:2em!important}' });
        const labels = page.locator('.hero-art .orbit-label,.hero-art .orbit-center,.hero-art figcaption');
        const checked = await labels.count();
        const clipped = await labels.evaluateAll(labels => labels.filter(label => {
          const range = document.createRange(); range.selectNodeContents(label);
          const box = range.getBoundingClientRect();
          const hero = label.closest('.hero')?.getBoundingClientRect();
          return box.left < -1 || box.right > innerWidth + 1 || (hero &&
            (box.left < hero.left - 1 || box.right > hero.right + 1 || box.top < hero.top - 1 || box.bottom > hero.bottom + 1));
        }).map(label => label.textContent.trim()));
        assert.deepEqual(clipped, [], `Clipped illustration text at ${route} ${width}px`);
        result.heroText.push({ route, width, customSpacing, checked, clipped });
      }
    }
    await page.setViewportSize({ width: 360, height: 1000 });
    await page.goto(site.base + '/');
    const disclosure = page.locator('.nav-disclosure');
    assert.equal(await disclosure.count(), 1);
    await disclosure.locator('summary').focus(); await page.keyboard.press('Enter');
    assert(await disclosure.getAttribute('open') !== null);
    assert(await disclosure.locator('a[href="/docs/"]').isVisible());
    await assertLayout(page, '/', 360);
    await disclosure.locator('summary').press('Enter');
    assert.equal(await disclosure.getAttribute('open'), null);
    result.interactions.push({ keyboardMobileNavigation: true });
    await page.goto(site.base + '/'); await page.keyboard.press('Tab');
    const skip = await page.evaluate(() => ({ text: document.activeElement.textContent, href: document.activeElement.getAttribute('href') }));
    assert.match(skip.text, /skip/i); assert.equal(skip.href, '#main');
    await page.keyboard.press('Enter'); assert.equal(new URL(page.url()).hash, '#main');
    result.interactions.push({ skipLink: true });
    for (const id of ['workspace', 'status', 'architecture', 'workflows']) assert.equal(await page.locator(`#${id}`).count(), 1, `Missing retained home anchor #${id}`);
    assert(mediaRoutes.size > 0, 'Editorial site must expose its reviewed media');
    for (const route of mediaRoutes) {
      await page.goto(site.base + route);
      const details = page.locator('.media-detail');
      for (let i = 0; i < await details.count(); i++) {
        const detail = details.nth(i);
        assert.equal(await detail.evaluate(element => element.tagName), 'DETAILS');
        assert.match(await detail.locator('summary').innerText(), /Inspect full image/i);
        await detail.locator('summary').click();
        assert(await detail.getAttribute('open') !== null);
        assert(await detail.locator('img').first().isVisible());
        await detail.locator('img').first().evaluate(image => image.decode());
        await assertLayout(page, route, 360);
        result.scrollRegions.push(...await scrollRegionChecks(page, route));
        await detail.locator('summary').click();
      }
    }
    result.interactions.push({ mediaZoomRoutes: [...mediaRoutes] });
    assert.equal(videoSources.size, 2, 'Expected the two reviewed historical recordings');
    result.videoPlayback = await videoPlaybackChecks(page, site.base, videoSources);
    assert(motionRoutes.size > 0, 'Editorial site must expose controlled diagram motion');
    await page.clock.install();
    for (const route of motionRoutes) result.interactions.push({ motionRoute: route, examples: await motionChecks(page, site.base, route) });
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 1000 }, reducedMotion: 'reduce' });
    const staticPage = await nojs.newPage();
    lastPage = staticPage;
    for (const route of config.routes) {
      await staticPage.goto(site.base + route);
      assert(await staticPage.locator('h1').isVisible(), route);
      assert((await staticPage.locator('main').innerText()).trim().length > 40, `Missing readable content ${route}`);
      assert(await staticPage.locator('[data-motion-step]').evaluateAll(buttons => buttons.every(button => button.disabled)), `Unenhanced motion controls must be disabled on ${route}`);
      await assertLayout(staticPage, route, 360);
      result.scrollRegions.push(...await scrollRegionChecks(staticPage, route));
    }
    await staticPage.goto(site.base + '/skills.html');
    assert.equal(await staticPage.locator('.sk:visible').count(), 17);
    await nojs.close();
    result.interactions.push({ allPagesReadableWithoutJavaScript: true });
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.externalRequests, []);
    result.success = true;
  } catch (error) {
    result.success = false; result.failure = error.stack;
    if (lastPage && !lastPage.isClosed()) {
      result.failurePage = lastPage.url();
      try {
        result.failureScreenshot = path.join(config.output, 'browser-failure.png');
        await prepareScreenshot(lastPage);
        await lastPage.screenshot({ path: result.failureScreenshot, fullPage: true });
      } catch (captureError) { result.screenshotError = captureError.message; }
    }
    throw error;
  } finally {
    result.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(config.output, 'browser-results.json'), JSON.stringify(result, null, 2) + '\n');
    if (browser) await browser.close();
    await site.close();
  }
  console.log(JSON.stringify({ success: result.success, layouts: result.layouts.length, reflow: result.reflow.length,
    zoomEquivalent: result.zoomEquivalent.length,
    scrollRegions: result.scrollRegions.length,
    videoPlayback: result.videoPlayback.length,
    interactions: result.interactions.length, links: result.links.length, errors: result.errors, output: config.output }, null, 2));
}

module.exports = { siteConfiguration, startSite, browserOptions, assertLayout, prepareScreenshot, scrollRegionChecks, motionChecks, videoPlaybackChecks };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
