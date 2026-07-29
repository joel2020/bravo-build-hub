// Blog post METADATA only — no bodies. Backed by src/content/blog-index.json,
// which scripts/generate-blog-index.mjs regenerates from the markdown on build.
//
// List views (the blog index, and getPostsForCity on every city page) only ever
// need titles, excerpts, tags and covers. Reading those from this small JSON
// index keeps the 53 post bodies out of their chunks — previously every city
// page downloaded the entire blog corpus just to render three related links.
//
// If you need the body of a post, import getPostBySlug from "@/lib/blogBodies",
// and only from the BlogPost route, or the whole corpus comes back with it.

import index from "@/content/blog-index.json";
import { getCoverForSlug } from "./blogCovers";

export type BlogPostMeta = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  city?: string;
  cover?: string;
  author: string;
  readingMinutes: number;
};

const posts: BlogPostMeta[] = (index as Omit<BlogPostMeta, "cover">[])
  .map((p) => ({ ...p, cover: getCoverForSlug(p.slug) || undefined }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getAllPosts = (): BlogPostMeta[] => posts;
export const getAllTags = (): string[] =>
  Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

// Returns posts relevant to a given city. Matches by exact city frontmatter first,
// then falls back to posts that include the city name as a tag. Used for internal
// SEO linking from /service-areas/:slug pages to local blog content.
export const getPostsForCity = (cityName: string, limit = 4): BlogPostMeta[] => {
  const norm = cityName.trim().toLowerCase();
  const direct = posts.filter((p) => (p.city || "").trim().toLowerCase() === norm);
  if (direct.length >= limit) return direct.slice(0, limit);

  const tagged = posts.filter(
    (p) =>
      !direct.includes(p) &&
      p.tags.some((t) => t.trim().toLowerCase() === norm),
  );

  return [...direct, ...tagged].slice(0, limit);
};
