import { URL } from 'node:url';

type IndexNowSubmitParams = {
  url: string;
};

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function submitToIndexNow({ url }: IndexNowSubmitParams): Promise<void> {
  const indexNowKey = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!indexNowKey || !siteUrl) {
    console.warn('[IndexNow] Skipped submission: missing INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL env vars.');
    return;
  }

  const host = new URL(siteUrl).host;
  const payload = {
    host,
    key: indexNowKey,
    keyLocation: `${siteUrl.replace(/\/$/, '')}/${indexNowKey}.txt`,
    urlList: [url],
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[IndexNow] Failed for URL: ${url}`, { status: response.status, body });
      return;
    }

    console.info(`[IndexNow] Success for URL: ${url}`);
  } catch (error) {
    console.error(`[IndexNow] Network/error for URL: ${url}`, error);
  }
}
