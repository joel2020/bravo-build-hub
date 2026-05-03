/**
 * Meta Graph API client for auto-posting to Facebook Page + Instagram Business.
 *
 * Required env vars (request via environment-secrets skill):
 *   META_PAGE_ACCESS_TOKEN — long-lived Page Access Token (60 days)
 *   META_PAGE_ID            — Facebook Page numeric ID
 *   META_IG_USER_ID         — Instagram Business Account ID (optional, IG-only)
 *
 * Required permissions on the token:
 *   pages_manage_posts, pages_read_engagement,
 *   instagram_basic, instagram_content_publish, pages_show_list
 *
 * NOTE: Instagram requires a publicly-fetchable image URL. The image URL
 * passed here MUST be reachable by Meta's servers (HTTPS, no auth).
 */
import { logger } from "./logger";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function token(): string | null { return process.env["META_PAGE_ACCESS_TOKEN"] ?? null; }
function pageId(): string | null { return process.env["META_PAGE_ID"] ?? null; }
function igUserId(): string | null { return process.env["META_IG_USER_ID"] ?? null; }

export interface MetaConfig {
  facebookConfigured: boolean;
  instagramConfigured: boolean;
  pageName?: string;
  igUsername?: string;
  tokenExpiresAt?: string;
  error?: string;
}

export async function getMetaConfig(): Promise<MetaConfig> {
  const t = token();
  const pid = pageId();
  if (!t || !pid) {
    return {
      facebookConfigured: false,
      instagramConfigured: false,
      error: !t ? "META_PAGE_ACCESS_TOKEN not set" : "META_PAGE_ID not set",
    };
  }
  try {
    const url = `${GRAPH_BASE}/${pid}?fields=name,instagram_business_account&access_token=${encodeURIComponent(t)}`;
    const res = await fetch(url);
    const data = (await res.json()) as { name?: string; error?: { message: string }; instagram_business_account?: { id: string } };
    if (data.error) {
      return { facebookConfigured: false, instagramConfigured: false, error: data.error.message };
    }
    let igUsername: string | undefined;
    const ig = igUserId() ?? data.instagram_business_account?.id;
    if (ig) {
      try {
        const r = await fetch(`${GRAPH_BASE}/${ig}?fields=username&access_token=${encodeURIComponent(t)}`);
        const d = (await r.json()) as { username?: string };
        igUsername = d.username;
      } catch { /* ignore */ }
    }
    return {
      facebookConfigured: true,
      instagramConfigured: Boolean(ig),
      pageName: data.name,
      igUsername,
    };
  } catch (err: unknown) {
    return { facebookConfigured: false, instagramConfigured: false, error: (err as Error).message };
  }
}

export interface PostResult {
  ok: boolean;
  publicUrl?: string;
  postId?: string;
  error?: string;
}

/** Post text (and optional image) to a Facebook Page. */
export async function postToFacebook(args: { message: string; imageUrl?: string }): Promise<PostResult> {
  const t = token(); const pid = pageId();
  if (!t || !pid) return { ok: false, error: "Meta not configured" };
  try {
    const endpoint = args.imageUrl ? `${GRAPH_BASE}/${pid}/photos` : `${GRAPH_BASE}/${pid}/feed`;
    const body = new URLSearchParams();
    body.set("access_token", t);
    if (args.imageUrl) {
      body.set("url", args.imageUrl);
      body.set("caption", args.message);
    } else {
      body.set("message", args.message);
    }
    const res = await fetch(endpoint, { method: "POST", body });
    const data = (await res.json()) as { id?: string; post_id?: string; error?: { message: string } };
    if (data.error) return { ok: false, error: data.error.message };
    const postId = data.post_id ?? data.id;
    if (!postId) return { ok: false, error: "Meta returned no post id" };
    // FB post URLs: when posted as photo, post_id has format pageId_postId
    const fbId = data.post_id ?? `${pid}_${data.id}`;
    return { ok: true, postId, publicUrl: `https://www.facebook.com/${fbId.replace("_", "/posts/")}` };
  } catch (err: unknown) {
    logger.error({ err }, "postToFacebook failed");
    return { ok: false, error: (err as Error).message };
  }
}

/** Post image + caption to an Instagram Business Account (2-step container flow). */
export async function postToInstagram(args: { caption: string; imageUrl: string }): Promise<PostResult> {
  const t = token(); const ig = igUserId();
  if (!t || !ig) return { ok: false, error: "Instagram not configured (need META_IG_USER_ID)" };
  if (!args.imageUrl) return { ok: false, error: "Instagram requires an image_url" };
  try {
    // Step 1: create media container
    const containerBody = new URLSearchParams();
    containerBody.set("image_url", args.imageUrl);
    containerBody.set("caption", args.caption);
    containerBody.set("access_token", t);
    const cRes = await fetch(`${GRAPH_BASE}/${ig}/media`, { method: "POST", body: containerBody });
    const cData = (await cRes.json()) as { id?: string; error?: { message: string } };
    if (cData.error || !cData.id) return { ok: false, error: cData.error?.message ?? "no container id" };

    // Step 2: publish
    const pubBody = new URLSearchParams();
    pubBody.set("creation_id", cData.id);
    pubBody.set("access_token", t);
    const pRes = await fetch(`${GRAPH_BASE}/${ig}/media_publish`, { method: "POST", body: pubBody });
    const pData = (await pRes.json()) as { id?: string; error?: { message: string } };
    if (pData.error || !pData.id) return { ok: false, error: pData.error?.message ?? "publish failed" };

    // Fetch permalink
    let publicUrl: string | undefined;
    try {
      const r = await fetch(`${GRAPH_BASE}/${pData.id}?fields=permalink&access_token=${encodeURIComponent(t)}`);
      const d = (await r.json()) as { permalink?: string };
      publicUrl = d.permalink;
    } catch { /* ignore */ }
    return { ok: true, postId: pData.id, publicUrl };
  } catch (err: unknown) {
    logger.error({ err }, "postToInstagram failed");
    return { ok: false, error: (err as Error).message };
  }
}
