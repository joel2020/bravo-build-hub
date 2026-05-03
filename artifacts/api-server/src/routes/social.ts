import { Router, type IRouter } from "express";
import {
  getSocialPosts,
  updateSocialPosts,
  newId,
  type SocialPost,
  type SocialPostStatus,
} from "../lib/social-storage";
import { PLATFORMS, getPlatform, type PlatformId } from "../lib/social-platforms";
import { generatePlatformDrafts } from "../lib/social-text-generator";
import { getMetaConfig, postToFacebook, postToInstagram } from "../lib/meta-client";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function nowIso(): string { return new Date().toISOString(); }

function joinTextWithHashtags(text: string, hashtags: string[]): string {
  if (!hashtags.length) return text;
  const tags = hashtags.map((h) => h.startsWith("#") ? h : `#${h}`).join(" ");
  return `${text}\n\n${tags}`;
}

router.get("/social/data", async (_req, res) => {
  const [posts, meta] = await Promise.all([getSocialPosts(), getMetaConfig()]);
  res.json({
    posts: posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    platforms: PLATFORMS.map((p) => ({
      id: p.id,
      label: p.label,
      autoPost: p.autoPost,
      charLimit: p.charLimit,
      hashtagBudget: p.hashtagBudget,
      requiresImage: p.requiresImage ?? false,
      prefillsText: p.prefillsText,
    })),
    meta,
  });
});

router.post("/social/generate", async (req, res) => {
  const { topic, platforms, notes, cta, imageUrl } = req.body as {
    topic?: string;
    platforms?: PlatformId[];
    notes?: string;
    cta?: string;
    imageUrl?: string;
  };
  if (!topic || topic.trim().length < 5) {
    res.status(400).json({ error: "topic is required (min 5 chars)" });
    return;
  }
  try {
    const drafts = await generatePlatformDrafts({ topic, platforms, notes, cta });
    const briefId = newId();
    const created: SocialPost[] = drafts.map((d) => ({
      id: newId(),
      briefId,
      topic,
      platform: d.platform as PlatformId,
      text: d.text,
      hashtags: d.hashtags ?? [],
      imageUrl: imageUrl || undefined,
      status: "draft",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }));
    await updateSocialPosts((items) => [...created, ...items]);
    res.json({ briefId, posts: created });
  } catch (err: unknown) {
    logger.error({ err }, "social generate failed");
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/social/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { text, hashtags, imageUrl, status } = req.body as {
    text?: string; hashtags?: string[]; imageUrl?: string; status?: SocialPostStatus;
  };
  let updated: SocialPost | undefined;
  await updateSocialPosts((items) => {
    const p = items.find((x) => x.id === id);
    if (!p) return items;
    if (typeof text === "string") p.text = text;
    if (Array.isArray(hashtags)) p.hashtags = hashtags;
    if (typeof imageUrl === "string") p.imageUrl = imageUrl || undefined;
    if (status) p.status = status;
    p.updatedAt = nowIso();
    updated = p;
    return items;
  });
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(updated);
});

router.delete("/social/posts/:id", async (req, res) => {
  const { id } = req.params;
  await updateSocialPosts((items) => items.filter((x) => x.id !== id));
  res.json({ ok: true });
});

/** Auto-post to Facebook or Instagram via Meta Graph API. */
router.post("/social/posts/:id/publish", async (req, res) => {
  const { id } = req.params;
  const posts = await getSocialPosts();
  const post = posts.find((x) => x.id === id);
  if (!post) { res.status(404).json({ error: "not found" }); return; }
  const platform = getPlatform(post.platform);
  if (!platform || !platform.autoPost) {
    res.status(400).json({ error: `Platform ${post.platform} cannot be auto-published — use the deep-link composer.` });
    return;
  }
  await updateSocialPosts((items) => {
    const p = items.find((x) => x.id === id);
    if (p) { p.status = "posting"; p.updatedAt = nowIso(); p.error = undefined; }
    return items;
  });
  const fullText = joinTextWithHashtags(post.text, post.hashtags);
  let result: { ok: boolean; publicUrl?: string; postId?: string; error?: string };
  if (post.platform === "facebook") {
    result = await postToFacebook({ message: fullText, imageUrl: post.imageUrl });
  } else if (post.platform === "instagram") {
    if (!post.imageUrl) {
      result = { ok: false, error: "Instagram requires an image URL." };
    } else {
      result = await postToInstagram({ caption: fullText, imageUrl: post.imageUrl });
    }
  } else {
    result = { ok: false, error: "platform not supported for auto-post" };
  }
  await updateSocialPosts((items) => {
    const p = items.find((x) => x.id === id);
    if (p) {
      p.status = result.ok ? "posted" : "failed";
      p.postedAt = result.ok ? nowIso() : undefined;
      p.publicUrl = result.publicUrl;
      p.postId = result.postId;
      p.error = result.error;
      p.updatedAt = nowIso();
    }
    return items;
  });
  res.json(result);
});

/** "Publish all auto-postable drafts in this brief" — one click weekly send. */
router.post("/social/briefs/:briefId/publish", async (req, res) => {
  const { briefId } = req.params;
  const posts = await getSocialPosts();
  const targets = posts.filter(
    (p) => p.briefId === briefId
      && p.status === "draft"
      && getPlatform(p.platform)?.autoPost,
  );
  res.json({ message: `Publishing ${targets.length} posts in background` });
  void (async () => {
    for (const p of targets) {
      try {
        await fetch(`http://localhost:${process.env["PORT"]}/api/social/posts/${p.id}/publish`, { method: "POST" });
      } catch (err) { logger.error({ err, id: p.id }, "brief publish failed"); }
    }
  })();
});

export default router;
