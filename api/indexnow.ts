import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_HOST = 'bravomechanicalny.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

type IndexNowBody = {
  urls?: string[];
};

function normalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.INDEXNOW_KEY;
  const host = process.env.INDEXNOW_HOST || DEFAULT_HOST;

  if (!key) {
    return res.status(500).json({ error: 'Missing INDEXNOW_KEY environment variable' });
  }

  const body = req.body as IndexNowBody;
  const urls = Array.isArray(body?.urls) ? body.urls : [];
  const urlList = urls.map(normalizeUrl).filter((url): url is string => Boolean(url));

  if (urlList.length === 0) {
    return res.status(400).json({ error: 'Provide at least one valid URL in urls[]' });
  }

  if (urlList.length > 10000) {
    return res.status(400).json({ error: 'IndexNow supports up to 10,000 URLs per request' });
  }

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  };

  const indexNowResponse = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await indexNowResponse.text();

  if (!indexNowResponse.ok) {
    return res.status(indexNowResponse.status).json({
      success: false,
      status: indexNowResponse.status,
      response: responseText,
    });
  }

  return res.status(200).json({
    success: true,
    submitted: urlList.length,
    response: responseText,
  });
}
