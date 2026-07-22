// Records a real screen-capture of the site scrolling through
// hero -> services -> tarifs, using the site's own built-in reveal
// animations (no AI video generation involved — avoids the text/UI
// warping that image-to-video models introduce on screenshots).
//
// Requires: `npm install playwright` (or a global install) + `npx playwright install chromium`
// Run: node higgsfield/record-demo.js
// Output: higgsfield/output/<hash>.webm

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_DIR = path.join(__dirname, '..');
const VIDEO_DIR = path.join(__dirname, 'output');
fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function smoothScrollTo(page, selector, ms) {
  await page.evaluate(({ selector, ms }) => {
    const el = document.querySelector(selector);
    const targetY = el.getBoundingClientRect().top + window.scrollY;
    const startY = window.scrollY;
    const startTime = performance.now();
    return new Promise((resolve) => {
      function step(now) {
        const t = Math.min(1, (now - startTime) / ms);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        window.scrollTo(0, startY + (targetY - startY) * ease);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }, { selector, ms });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1600, height: 900 } },
  });
  const page = await context.newPage();

  await page.goto('file://' + path.join(SITE_DIR, 'index.html'), { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => document.getElementById('intro')?.classList.contains('done'), { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(1200);

  // Hero hold
  await page.waitForTimeout(1800);

  // Scroll to services
  await smoothScrollTo(page, '#services', 1400);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')));
  await page.waitForTimeout(2200);

  // Scroll to tarifs
  await smoothScrollTo(page, '#tarifs', 1400);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')));
  await page.waitForTimeout(2600);

  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  console.log('recorded:', files);
})();
