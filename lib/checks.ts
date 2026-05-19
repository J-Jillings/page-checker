import type { Page } from 'playwright-core';
import type { LayoutResult, LinkResult, ConsoleError } from './types';

export const BREAKPOINTS = [
  { name: 'Mobile',  width: 375,  height: 812  },
  { name: 'Tablet',  width: 768,  height: 1024 },
  { name: 'Desktop', width: 1440, height: 900  },
] as const;

export async function takeScreenshots(page: Page, url: string): Promise<Record<string, string>> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const results: Record<string, string> = {};

  for (const bp of BREAKPOINTS) {
    // Scale viewport to 50% to keep response size manageable
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.waitForTimeout(500);
    const buffer = await page.screenshot({ fullPage: true, scale: 'css' });
    results[bp.name] = `data:image/png;base64,${buffer.toString('base64')}`;
  }

  return results;
}

export async function analyseLayout(page: Page, url: string): Promise<LayoutResult> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const results: Partial<LayoutResult> = {};

  for (const bp of BREAKPOINTS) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.waitForTimeout(400);

    const data = await page.evaluate((vpWidth: number) => {
      const issues: Array<{type: string; severity: string; element: string; detail: string}> = [];
      const elementData: Array<{
        label: string; top: number; left: number; right: number; bottom: number;
        width: number; height: number; display: string; visibility: string; overflow: string;
      }> = [];

      const selectors = [
        'header', 'nav', 'main', 'footer', 'section', 'article',
        'h1', 'h2', 'h3',
        'img', 'video', 'picture',
        'button', 'a[href]',
        '[class*="hero"]', '[class*="banner"]', '[class*="cta"]',
        '[class*="card"]', '[class*="modal"]', '[class*="nav"]',
        '[class*="header"]', '[class*="footer"]',
      ];

      const seen = new Set<Element>();
      const elements: Element[] = [];

      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (!seen.has(el)) {
            seen.add(el);
            elements.push(el);
          }
        });
      });

      elements.forEach(el => {
        const rect   = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        const tag    = el.tagName.toLowerCase();
        const cls    = (el.className && typeof el.className === 'string')
          ? el.className.split(' ').filter(Boolean).slice(0, 3).join(' ')
          : '';
        const id    = el.id ? `#${el.id}` : '';
        const label = `${tag}${id}${cls ? '.' + cls.replace(/ /g, '.') : ''}`.slice(0, 60);

        const scrollY  = window.scrollY || 0;
        const absTop   = rect.top + scrollY;
        const absLeft  = rect.left;
        const absRight = rect.right;
        const absBot   = rect.bottom + scrollY;

        elementData.push({
          label,
          top:    Math.round(absTop),
          left:   Math.round(absLeft),
          right:  Math.round(absRight),
          bottom: Math.round(absBot),
          width:  Math.round(rect.width),
          height: Math.round(rect.height),
          display:    styles.display,
          visibility: styles.visibility,
          overflow:   styles.overflow,
        });

        // Zero-dimension check
        if (
          styles.display !== 'none' &&
          styles.visibility !== 'hidden' &&
          rect.width === 0 && rect.height === 0 &&
          !['script', 'style', 'link', 'meta', 'head'].includes(tag)
        ) {
          issues.push({
            type: 'zero-size',
            severity: 'warning',
            element: label,
            detail: 'Element has zero width and height but is not hidden',
          });
        }

        // Overflow / off-screen check
        if (rect.width > 0 && rect.right > vpWidth + 5) {
          issues.push({
            type: 'overflow',
            severity: 'error',
            element: label,
            detail: `Element extends ${Math.round(rect.right - vpWidth)}px beyond right edge of viewport`,
          });
        }

        // Images — capture src/alt for actionable error messages
        if (tag === 'img') {
          const imgEl = el as HTMLImageElement;
          const src = imgEl.currentSrc || imgEl.src || el.getAttribute('src') || '';
          const alt = imgEl.alt || el.getAttribute('alt') || '';
          const srcLabel = src ? ` — src: ${src.length > 80 ? src.slice(0, 80) + '…' : src}` : '';
          const altLabel = alt ? ` (alt: "${alt}")` : '';

          if (!el.getAttribute('width') && !el.getAttribute('height')) {
            issues.push({
              type: 'img-no-dimensions',
              severity: 'info',
              element: label,
              detail: `No explicit width/height attributes (can cause layout shift)${srcLabel}${altLabel}`,
            });
          }
          if (imgEl.naturalWidth > 0 && rect.width === 0) {
            issues.push({
              type: 'img-collapsed',
              severity: 'error',
              element: label,
              detail: `Image loaded but renders at zero width${srcLabel}${altLabel}`,
            });
          }
          if (imgEl.complete && imgEl.naturalWidth === 0 && src) {
            issues.push({
              type: 'img-broken',
              severity: 'error',
              element: label,
              detail: `Image failed to load${srcLabel}${altLabel}`,
            });
          }
        }
      });

      // Overlap detection
      const candidates = elementData.filter(e => e.width > 10 && e.height > 10);

      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          const a = candidates[i];
          const b = candidates[j];

          const aContainsB = a.left <= b.left && a.top <= b.top && a.right >= b.right && a.bottom >= b.bottom;
          const bContainsA = b.left <= a.left && b.top <= a.top && b.right >= a.right && b.bottom >= a.bottom;
          if (aContainsB || bContainsA) continue;

          const overlapX = Math.min(a.right, b.right)   - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

          if (overlapX > 10 && overlapY > 10) {
            issues.push({
              type: 'overlap',
              severity: 'error',
              element: `${a.label}  ↔  ${b.label}`,
              detail: `Elements overlap by ${Math.round(overlapX)}×${Math.round(overlapY)}px`,
            });
          }
        }
      }

      return { issues, elementCount: elementData.length, elementData };
    }, bp.width);

    results[bp.name as keyof LayoutResult] = data as LayoutResult[keyof LayoutResult];
  }

  return results as LayoutResult;
}

export async function collectConsoleErrors(page: Page, url: string): Promise<ConsoleError[]> {
  const errors: ConsoleError[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const loc = msg.location();
      errors.push({
        text: msg.text(),
        url: loc.url || undefined,
        line: loc.lineNumber != null ? loc.lineNumber : undefined,
        column: loc.columnNumber != null ? loc.columnNumber : undefined,
      });
    }
  });
  page.on('pageerror', err => errors.push({ text: err.message }));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  return errors;
}

export async function auditLinks(page: Page, url: string): Promise<LinkResult[]> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map(a => ({ href: (a as HTMLAnchorElement).href, text: ((a as HTMLAnchorElement).innerText || '').trim().slice(0, 60) }))
      .filter(l => l.href.startsWith('http'))
      .filter((l, i, arr) => arr.findIndex(x => x.href === l.href) === i)
      .slice(0, 60)
  );

  const results: LinkResult[] = [];
  for (const link of links) {
    try {
      const res = await page.request.get(link.href, { timeout: 8000 });
      results.push({ ...link, status: res.status(), ok: res.status() < 400 });
    } catch {
      results.push({ ...link, status: 'ERR', ok: false });
    }
  }
  return results;
}
