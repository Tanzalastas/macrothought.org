'use strict';
// Read-only website checks. Launches a temporary local HTTP server; never imports the application.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'), out=path.resolve(process.env.REVIEW_OUTPUT || path.join(root,'..','review'));
const screenshots=path.join(out,'screenshots'); fs.mkdirSync(screenshots,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
 if (!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(err?'Not found':data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || undefined});
 const results={browser:await browser.version(),layouts:[],interactions:[],links:[],errors:[],externalRequests:[],metrics:{}};
 try {
  for(const [name,width,height] of [['phone',360,800],['fold-cover',344,882],['phone-wide',390,844],['fold-open',720,900],['tablet',834,1112],['desktop',1440,1000],['wide',1920,1080]]) {
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:width<900,reducedMotion:'reduce'});
   const page=await context.newPage();
   page.on('pageerror',e=>results.errors.push(e.message));
   page.on('request',r=>{if(!r.url().startsWith(base))results.externalRequests.push(r.url());});
   for(const namePage of ['index.html','skills.html','app.html','setup.html']){
    const response=await page.goto(base+'/'+namePage);assert.equal(response.status(),200);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('main').count(),1);
    const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main,header,footer,a,button,input,select,h1,h2,h3,p')].filter(el=>{let r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&!el.classList.contains('skip')}).map(el=>el.tagName+':'+el.textContent.slice(0,35))}));
    assert(geometry.scrollWidth<=width+1, namePage+' overflow at '+width);assert.equal(geometry.overflow.length,0,JSON.stringify(geometry));
    results.layouts.push({page:namePage,viewport:name,width,height,overflow:false});
    if(namePage==='index.html'&&['phone','fold-open','tablet','desktop'].includes(name)) {
     await page.screenshot({path:path.join(screenshots,'home-'+name+'-full.png'),fullPage:true});
     await page.screenshot({path:path.join(screenshots,'home-'+name+'-hero.png')});
     await page.locator('.demo-shell').screenshot({path:path.join(screenshots,'workspace-'+name+'.png')});
    }
    if(namePage==='skills.html'&&['phone','desktop'].includes(name))await page.screenshot({path:path.join(screenshots,'skills-'+name+'.png')});
   }
   await page.goto(base+'/index.html');
   await page.locator('#panel-map [data-node="source-library"]').click();
   await page.getByRole('tab',{name:'Files',exact:true}).click();
   assert.equal(await page.locator('#object-id').textContent(),'example:source-library');
   assert.equal(await page.locator('#panel-files [data-node="source-library"]').getAttribute('aria-pressed'),'true');
   await page.locator('#panel-files [data-node="review-checklist"]').click();
   await page.getByRole('tab',{name:'Activity',exact:true}).click();
   assert.equal(await page.locator('#object-id').textContent(),'example:review-checklist');
   await page.getByRole('tab',{name:'Activity',exact:true}).focus(); await page.keyboard.press('Home');
   assert.equal(await page.locator('#tab-map').getAttribute('aria-selected'),'true');
   await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-files').getAttribute('aria-selected'),'true');
   await page.keyboard.press('End');assert.equal(await page.locator('#tab-activity').getAttribute('aria-selected'),'true');
   await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#tab-files').getAttribute('aria-selected'),'true');
   results.interactions.push({viewport:name,persistentIdentity:true,keyboardTabs:true});
   await page.goto(base+'/skills.html');
   assert.equal(await page.locator('.sk:visible').count(),17);
   await page.getByLabel('Find a skill').fill('zzzzzz-no-match');assert.equal(await page.locator('.sk:visible').count(),0);assert(await page.locator('#no-results').isVisible());
   await page.getByLabel('Find a skill').fill('context-packs');assert.equal(await page.locator('.sk:visible').count(),1);
   await page.getByLabel('Find a skill').fill('');assert.equal(await page.locator('.sk:visible').count(),17);
   results.interactions.at(-1).skillSearch=true;
   await context.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(base+'/index.html');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#main');
  results.interactions.push({skipLink:true});
  for(const filename of ['index.html','skills.html','app.html','setup.html']){
   await page.goto(base+'/'+filename);
   const targets=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')));
   for(const href of [...new Set(targets)].filter(h=>!h.startsWith('http'))){
    const u=new URL(href,base+'/'+filename), resp=await page.request.get(u.href.split('#')[0]);assert.equal(resp.status(),200,href);
    if(u.hash){await page.goto(u.href);assert.equal(await page.locator(u.hash).count(),1,href);}
    results.links.push({from:filename,href,status:200});
   }
  }
  await page.goto(base+'/index.html');
  results.metrics=await page.evaluate(()=>({domNodes:document.querySelectorAll('*').length,resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').pop(),bytes:r.decodedBodySize})),loadMs:performance.getEntriesByType('navigation')[0].loadEventEnd}));
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:800}});const n=await nojs.newPage();await n.goto(base+'/index.html');assert(await n.locator('h1').isVisible());assert(await n.locator('noscript').isVisible());assert.equal(await n.locator('.tabs:visible').count(),0);await n.goto(base+'/skills.html');assert.equal(await n.locator('.sk:visible').count(),17);results.interactions.push({noJavaScriptReadable:true});await nojs.close();
  const fileContext=await browser.newContext();const f=await fileContext.newPage();await f.goto('file://'+path.join(root,'index.html'));await f.getByRole('tab',{name:'Files',exact:true}).click();assert(await f.locator('#panel-files').isVisible());results.interactions.push({portableFileProtocol:true});await fileContext.close();
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');results.interactions.push({reducedMotion:true});
  assert.equal(results.errors.length,0);assert.equal(results.externalRequests.length,0);
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({layouts:results.layouts.length,interactions:results.interactions.length,localLinks:results.links.length,errors:results.errors,externalRequests:results.externalRequests,metrics:results.metrics},null,2));
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
