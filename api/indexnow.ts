import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.INDEXNOW_KEY;
  const host = process.env.INDEXNOW_HOST ?? 'bravomechanicalny.com';

  if (!key) {
    return res.status(500).json({ error: 'INDEXNOW_KEY env variable not set' });
  }

  const { urls } = req.body as { urls: string[] };

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'urls must be a non-empty array' });
  }

  if (urls.length > 10000) {
    return res.status(400).json({ error: 'urls array exceeds 10,000 limit' });
  }

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        success: false,
        status: response.status,
        message: text,
      });
    }

    return res.status(200).json({
      success: true,
      submitted: urls.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}
