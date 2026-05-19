export async function withSteelSession<T>(
  fn: (page: import('playwright-core').Page) => Promise<T>
): Promise<T> {
  // Lazy imports — avoid module-level initialization that crashes on Vercel cold starts
  const Steel = (await import('steel-sdk')).default;
  const { chromium } = await import('playwright-core');

  const client = new Steel({ steelAPIKey: process.env.STEEL_API_KEY! });
  const session = await client.sessions.create();

  const browser = await chromium.connectOverCDP(
    `wss://connect.steel.dev?apiKey=${process.env.STEEL_API_KEY}&sessionId=${session.id}`
  );

  try {
    const context = browser.contexts()[0] ?? await browser.newContext();
    const page = await context.newPage();
    const result = await fn(page);
    return result;
  } finally {
    await browser.close();
    await client.sessions.release(session.id);
  }
}
