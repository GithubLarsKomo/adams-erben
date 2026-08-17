import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'https://preview.adams-erben.de';
const widths = [390, 430, 768, 1024];
const routes = [
  { path: '/', variant: 'landing', cta: '#quick-finder' },
  { path: '/rudern/', variant: 'rowing', cta: '#vereine' }
];

const outDir = path.resolve('qa-artifacts');
fs.mkdirSync(outDir, { recursive: true });
const results = [];
const failures = [];

function record(route, width, check, ok, details = '') {
  const row = { route, width, check, ok, details };
  results.push(row);
  if (!ok) failures.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${width}px ${route} :: ${check}${details ? ` — ${details}` : ''}`);
}

async function isVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

async function gotoWithRetry(page, url) {
  let response = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      if (response && response.status() < 500) return { response, lastError: null };
    } catch (error) {
      lastError = error;
    }
    await page.waitForTimeout(3000);
  }
  return { response, lastError };
}

const browser = await chromium.launch({ headless: true });
try {
  for (const width of widths) {
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();
      const url = `${baseUrl}${route.path}`;
      const safeName = route.path === '/' ? 'root' : route.path.replace(/^\/+|\/+$/g, '').replaceAll('/', '-');

      try {
        const { response, lastError } = await gotoWithRetry(page, url);
        if (!response) {
          record(route.path, width, 'HTTP reachable', false, lastError?.message || 'no response');
          continue;
        }

        record(route.path, width, 'HTTP 200', response.status() === 200, `status=${response.status()}`);
        await page.waitForTimeout(400);

        const shellState = await page.evaluate(() => ({
          path: document.body?.dataset.shellPath || '',
          variant: document.body?.dataset.shellVariant || '',
          shellCss: Boolean(document.querySelector('link[href="/assets/site-shell.css"]')),
          shellHeader: Boolean(document.querySelector('.site-header[data-site-shell="header"]')),
          robots: document.querySelector('meta[name="robots"]')?.content || '',
          previewText: document.querySelector('#preview-banner')?.textContent?.replace(/\s+/g, ' ').trim() || ''
        }));
        record(
          route.path,
          width,
          'deployed shared-shell branch marker',
          shellState.path === route.path && shellState.variant === route.variant && shellState.shellCss && shellState.shellHeader,
          `path=${shellState.path || '(missing)'}, variant=${shellState.variant || '(missing)'}`
        );
        record(route.path, width, 'preview noindex', shellState.robots === 'noindex,nofollow', `robots=${shellState.robots || '(missing)'}`);
        record(route.path, width, 'preview banner', /Prototyp/i.test(shellState.previewText), shellState.previewText.slice(0, 120));

        const header = page.locator('.site-header').first();
        if ((await header.count()) !== 1) {
          record(route.path, width, 'fixed/sticky header mode', false, 'site header missing');
        } else {
          const before = await header.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return { top: rect.top, height: rect.height, position: style.position };
          });
          record(route.path, width, 'fixed/sticky header mode', ['fixed', 'sticky'].includes(before.position), `position=${before.position}, height=${before.height.toFixed(1)}`);
          await page.evaluate(() => window.scrollTo(0, Math.max(0, Math.min(700, document.documentElement.scrollHeight - innerHeight))));
          await page.waitForTimeout(120);
          const afterTop = await header.evaluate((el) => el.getBoundingClientRect().top);
          record(route.path, width, 'header remains pinned after scroll', Math.abs(afterTop) <= 1.5, `top=${afterTop.toFixed(1)}`);
        }

        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(80);

        const toggle = page.locator('.menu-toggle').first();
        const nav = page.locator('#primary-navigation').first();
        const mobile = width <= 920;
        const toggleVisible = await isVisible(toggle);
        const navVisibleInitially = await isVisible(nav);
        record(route.path, width, 'responsive hamburger visibility', mobile ? toggleVisible : !toggleVisible, `toggleVisible=${toggleVisible}, mobileExpected=${mobile}`);
        record(route.path, width, 'responsive nav initial state', mobile ? !navVisibleInitially : navVisibleInitially, `navVisible=${navVisibleInitially}`);

        if (mobile && toggleVisible) {
          const beforeExpanded = await toggle.getAttribute('aria-expanded');
          await toggle.click();
          await page.waitForTimeout(80);
          const afterExpanded = await toggle.getAttribute('aria-expanded');
          const navVisibleOpen = await isVisible(nav);
          record(route.path, width, 'hamburger opens menu', beforeExpanded === 'false' && afterExpanded === 'true' && navVisibleOpen, `aria ${beforeExpanded}→${afterExpanded}, navVisible=${navVisibleOpen}`);
        }

        const mobileCta = page.locator('.header-find-club').first();
        const desktopCta = page.locator('#primary-navigation .nav-cta').first();
        const activeCta = mobile ? mobileCta : desktopCta;
        const ctaVisible = await isVisible(activeCta);
        const ctaHref = (await activeCta.count()) ? await activeCta.getAttribute('href') : null;
        record(route.path, width, 'CTA visible and correct', ctaVisible && ctaHref === route.cta, `visible=${ctaVisible}, href=${ctaHref || '(missing)'}`);

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        }));
        record(route.path, width, 'no horizontal viewport overflow', overflow.scrollWidth <= overflow.innerWidth + 1, `scrollWidth=${overflow.scrollWidth}, innerWidth=${overflow.innerWidth}`);

        const h1 = page.locator('h1').first();
        if ((await h1.count()) !== 1) {
          record(route.path, width, 'H1 wraps without clipping', false, 'h1 missing');
        } else {
          const h1Metrics = await h1.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
            return {
              left: rect.left,
              right: rect.right,
              height: rect.height,
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              lines: Math.max(1, Math.round(rect.height / lineHeight)),
              overflowWrap: style.overflowWrap
            };
          });
          const h1Fits = h1Metrics.left >= -1 && h1Metrics.right <= width + 1 && h1Metrics.scrollWidth <= h1Metrics.clientWidth + 1;
          record(route.path, width, 'H1 wraps without clipping', h1Fits, `lines≈${h1Metrics.lines}, right=${h1Metrics.right.toFixed(1)}, scroll/client=${h1Metrics.scrollWidth}/${h1Metrics.clientWidth}, overflowWrap=${h1Metrics.overflowWrap}`);
        }

        if ((await nav.count()) === 1) {
          const anchors = await page.locator('#primary-navigation a[href^="#"]').evaluateAll((els) => els.map((el) => el.getAttribute('href')));
          const targetCheck = await page.evaluate((hrefs) => hrefs.map((href) => ({ href, exists: Boolean(href && document.querySelector(href)) })), anchors);
          record(route.path, width, 'all shell in-page targets exist', targetCheck.length > 0 && targetCheck.every((item) => item.exists), JSON.stringify(targetCheck));

          const firstHref = targetCheck.find((item) => item.exists)?.href;
          if (firstHref) {
            const link = page.locator(`#primary-navigation a[href="${firstHref}"]`).first();
            await link.click();
            await page.waitForTimeout(150);
            const navResult = await page.evaluate((href) => {
              const target = document.querySelector(href);
              const siteHeader = document.querySelector('.site-header');
              if (!target || !siteHeader) return null;
              return {
                hash: location.hash,
                targetTop: target.getBoundingClientRect().top,
                headerBottom: siteHeader.getBoundingClientRect().bottom
              };
            }, firstHref);
            record(route.path, width, 'in-page navigation click works', Boolean(navResult && navResult.hash === firstHref && navResult.targetTop >= navResult.headerBottom - 3), navResult ? `hash=${navResult.hash}, targetTop=${navResult.targetTop.toFixed(1)}, headerBottom=${navResult.headerBottom.toFixed(1)}` : 'missing target/header');
          }
        }

        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(80);
        await page.screenshot({ path: path.join(outDir, `${safeName}-${width}.png`), fullPage: true });
      } catch (error) {
        record(route.path, width, 'case execution', false, error?.stack || error?.message || String(error));
        try {
          await page.screenshot({ path: path.join(outDir, `${safeName}-${width}-error.png`), fullPage: true });
        } catch {
          // Page may not be renderable after a navigation/network failure.
        }
      } finally {
        await context.close();
        fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify({ baseUrl, results, failures }, null, 2));
      }
    }
  }
} finally {
  await browser.close();
}

const byCheck = results.reduce((acc, row) => {
  acc[row.check] ||= { pass: 0, fail: 0 };
  acc[row.check][row.ok ? 'pass' : 'fail'] += 1;
  return acc;
}, {});
console.log('\n=== QA SUMMARY ===');
console.log(JSON.stringify(byCheck, null, 2));
console.log(`Failures: ${failures.length}`);
if (failures.length) process.exit(1);
