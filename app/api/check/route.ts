import { NextRequest, NextResponse } from 'next/server';
import { withSteelSession } from '@/lib/steel';
import { takeScreenshots, analyseLayout, collectConsoleErrors, auditLinks, BREAKPOINTS } from '@/lib/checks';
import { diffImages } from '@/lib/diff';
import { runPSI } from '@/lib/psi';
import type { LayoutResult, LayoutDiff, PixelDiff } from '@/lib/types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { urlA, urlB } = await req.json();

  if (!urlA) return NextResponse.json({ error: 'urlA is required' }, { status: 400 });

  try {
    new URL(urlA);
    if (urlB) new URL(urlB);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const solo = !urlB;

  try {
    if (solo) {
      const { screenshots, layout, consoleErrors, links } = await withSteelSession(async (page) => {
        const screenshots   = await takeScreenshots(page, urlA);
        const layout        = await analyseLayout(page, urlA);
        const consoleErrors = await collectConsoleErrors(page, urlA);
        const links         = await auditLinks(page, urlA);
        return { screenshots, layout, consoleErrors, links };
      });

      const psi = await runPSI(urlA).catch(() => null);

      return NextResponse.json({
        success: true,
        results: {
          mode: 'health',
          urlA,
          timestamp: new Date().toISOString(),
          screenshots,
          layout,
          consoleErrors,
          links,
          psi,
        },
      });

    } else {
      const dataA = await withSteelSession(async (page) => {
        const screenshots   = await takeScreenshots(page, urlA);
        const layout        = await analyseLayout(page, urlA);
        const consoleErrors = await collectConsoleErrors(page, urlA);
        const links         = await auditLinks(page, urlA);
        return { screenshots, layout, consoleErrors, links };
      });

      const dataB = await withSteelSession(async (page) => {
        const screenshots   = await takeScreenshots(page, urlB);
        const layout        = await analyseLayout(page, urlB);
        const consoleErrors = await collectConsoleErrors(page, urlB);
        const links         = await auditLinks(page, urlB);
        return { screenshots, layout, consoleErrors, links };
      });

      const diffs: Record<string, PixelDiff> = {};
      for (const bp of BREAKPOINTS) {
        diffs[bp.name] = await diffImages(dataA.screenshots[bp.name], dataB.screenshots[bp.name]);
      }

      const layoutDiffs = diffLayouts(dataA.layout, dataB.layout);

      const [psiA, psiB] = await Promise.all([
        runPSI(urlA).catch(() => null),
        runPSI(urlB).catch(() => null),
      ]);

      return NextResponse.json({
        success: true,
        results: {
          mode: 'compare',
          urlA,
          urlB,
          timestamp: new Date().toISOString(),
          screenshots: { a: dataA.screenshots, b: dataB.screenshots, diff: diffs },
          layout: { a: dataA.layout, b: dataB.layout, diffs: layoutDiffs },
          consoleErrors: { a: dataA.consoleErrors, b: dataB.consoleErrors },
          links: { a: dataA.links, b: dataB.links },
          psi: { a: psiA, b: psiB },
        },
      });
    }
  } catch (err: unknown) {
    console.error('Check failed:', err);
    const message = err instanceof Error ? err.message : 'Check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function diffLayouts(layoutA: LayoutResult, layoutB: LayoutResult): Record<string, LayoutDiff[]> {
  const diffs: Record<string, LayoutDiff[]> = {};

  for (const name of ['Mobile', 'Tablet', 'Desktop'] as const) {
    const a = layoutA[name];
    const b = layoutB[name];
    if (!a || !b) continue;

    const mapA: Record<string, typeof a.elementData[number]> = {};
    a.elementData.forEach(el => { mapA[el.label] = el; });

    diffs[name] = b.elementData
      .filter(el => mapA[el.label])
      .map(el => {
        const aEl = mapA[el.label];
        return {
          element: el.label,
          a: { w: aEl.width, h: aEl.height, top: aEl.top },
          b: { w: el.width,  h: el.height,  top: el.top  },
          wDiff: Math.abs(el.width  - aEl.width),
          hDiff: Math.abs(el.height - aEl.height),
          yDiff: Math.abs(el.top    - aEl.top),
        };
      })
      .filter(d => d.wDiff > 10 || d.hDiff > 10 || d.yDiff > 20);
  }

  return diffs;
}
