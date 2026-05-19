export interface Issue {
  type: 'zero-size' | 'overflow' | 'img-no-dimensions' | 'img-collapsed' | 'overlap';
  severity: 'error' | 'warning' | 'info';
  element: string;
  detail: string;
}

export interface ElementData {
  label: string;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  display: string;
  visibility: string;
  overflow: string;
}

export interface BreakpointLayout {
  issues: Issue[];
  elementData: ElementData[];
  elementCount: number;
}

export interface LayoutResult {
  Mobile: BreakpointLayout;
  Tablet: BreakpointLayout;
  Desktop: BreakpointLayout;
}

export interface LayoutDiff {
  element: string;
  a: { w: number; h: number; top: number };
  b: { w: number; h: number; top: number };
  wDiff: number;
  hDiff: number;
  yDiff: number;
}

export interface PSIResult {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  vitals: {
    lcp: string;
    cls: string;
    tbt: string;
    fcp: string;
    si: string;
  };
}

export interface LinkResult {
  href: string;
  text: string;
  status: number | 'ERR';
  ok: boolean;
}

export interface PixelDiff {
  diffPercentage: string;
  diffBase64: string;
}

export interface HealthCheckResults {
  mode: 'health';
  urlA: string;
  timestamp: string;
  screenshots: Record<string, string>;
  layout: LayoutResult;
  consoleErrors: string[];
  links: LinkResult[];
  psi: PSIResult | null;
}

export interface CompareCheckResults {
  mode: 'compare';
  urlA: string;
  urlB: string;
  timestamp: string;
  screenshots: {
    a: Record<string, string>;
    b: Record<string, string>;
    diff: Record<string, PixelDiff>;
  };
  layout: {
    a: LayoutResult;
    b: LayoutResult;
    diffs: Record<string, LayoutDiff[]>;
  };
  consoleErrors: { a: string[]; b: string[] };
  links: { a: LinkResult[]; b: LinkResult[] };
  psi: { a: PSIResult | null; b: PSIResult | null };
}

export type CheckResults = HealthCheckResults | CompareCheckResults;
