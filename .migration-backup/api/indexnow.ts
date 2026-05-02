import type { VercelRequest, VercelResponse } from '@vercel/node';
import { submitToIndexNow } from './lib/indexnow';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body as { url?: string };

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  await submitToIndexNow({ url });
  return res.status(200).json({ success: true });
}
