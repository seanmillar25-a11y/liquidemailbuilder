// Automated checks for the Liquid Email Builder.
// Serves the site locally, opens it in headless Chromium, runs the built-in self-test
// (Menu → Run self-test) plus a few interface checks, and fails if anything breaks.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/`;

const launch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('requestfailed', r => { if (!r.url().startsWith(url)) errors.push('External request: ' + r.url()); });
page.on('request', r => { if (!r.url().startsWith(url) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) errors.push('External request: ' + r.url()); });

let failed = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? '✓' : '✕'} ${name}${!ok && detail ? '\n    ' + detail : ''}`); if (!ok) failed++; };

await page.goto(url);
await page.waitForFunction(() => window.__leb);
await page.waitForTimeout(800);

// Built-in self-test
const results = await page.evaluate(() => window.__leb.selfTest());
for (const r of results) {
  if (r.pass === null) { console.log(`– ${r.name} (skipped)`); continue; }
  check(`${r.group}: ${r.name}`, r.pass, String(r.detail).replace(/<[^>]+>/g, ' '));
}
check('Self-test ran the live-template comparisons', results.some(r => r.group === 'Live templates' && r.pass === true));

// Interface checks
await page.locator('.cv').first().click();
check('Clicking a block opens it in the editing panel', await page.locator('#insp .insp-head input').count() === 1);
// the self-test redraws the page when it finishes, so let it settle before dragging
await page.waitForTimeout(600);
const before = await page.locator('.cv').count();
let added = false;
for (let attempt = 0; attempt < 3 && !added; attempt++) {
  await page.locator('.tile:has-text("Highlight")').dragTo(page.locator('.cv').nth(1), { targetPosition: { x: 200, y: 4 } });
  await page.waitForTimeout(400);
  added = (await page.locator('.cv').count()) > before;
}
check('Dragging a block into the email adds it', added);
const code = await page.evaluate(() => window.__leb.generate());
check('Generated code includes the Gecko email shell', code.includes('class="row-content"') && code.trim().endsWith('</html>'));
const verOk = await page.evaluate(async () => (await (await fetch('version.json')).json()).version === window.__leb.version);
check('version.json matches APP_VERSION (bump both when releasing)', verOk);
check('Team lists file loaded', await page.evaluate(() => fetch('team-lists.json').then(r => r.ok)));
check('No page errors or requests to other servers', errors.length === 0, errors.join('\n    '));

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
