import type { VercelRequest, VercelResponse } from '@vercel/node';
import { submitToIndexNow } from './lib/indexnow';

type PageType = 'blog' | 'service' | 'city' | 'seo';

function buildPagePath(type: PageType, slug: string): string {
  if (type === 'blog') return `/blog/${slug}`;
  if (type === 'service') return `/services/${slug}`;
  if (type === 'city') return `/service-areas/${slug}`;
  return `/${slug}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return res.status(500).json({ error: 'NEXT_PUBLIC_SITE_URL env variable not set' });
  }

  const { type, slug } = req.body as { type?: PageType; slug?: string };

  if (!type || !slug || !['blog', 'service', 'city', 'seo'].includes(type)) {
    return res.status(400).json({ error: 'type must be one of blog|service|city|seo and slug is required' });
  }

  const pageUrl = `${siteUrl.replace(/\/$/, '')}${buildPagePath(type, slug)}`;

  void submitToIndexNow({ url: pageUrl });

  return res.status(200).json({ success: true, pageUrl, indexNowTriggered: true });
}
