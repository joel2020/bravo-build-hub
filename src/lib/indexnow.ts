/**
 * submitToIndexNow
 * Notifies IndexNow (Bing, Yandex, etc.) of new or updated URLs.
 * Silently fails — will never throw or break the UI.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;

  try {
    const res = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    if (!res.ok) {
      console.warn('[IndexNow] Submission failed:', res.status, await res.text());
    }
  } catch (err) {
    // Silent — never crash the calling UI flow
    console.warn('[IndexNow] Network error:', err);
  }
}

/**
 * buildPageUrl
 * Convenience helper — builds an absolute URL for a given path.
 */
export function buildPageUrl(path: string): string {
  const host = 'https://bravomechanicalny.com';
  return `${host}${path.startsWith('/') ? path : `/${path}`}`;
}
