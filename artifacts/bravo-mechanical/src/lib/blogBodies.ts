// Full blog posts, INCLUDING bodies. Eager-globs every markdown file, so this
// module carries the whole blog corpus (~200 KB raw).
//
// Import it ONLY from the BlogPost route. Anything that just needs titles,
// excerpts, or tags must use "@/lib/blog" instead — otherwise the entire corpus
// gets pulled into that page's chunk, which is exactly the bug this split fixed
// (every city page was shipping all 53 post bodies to render three links).

import { getCoverForSlug } from "./blogCovers";
import type { BlogPostMeta } from "./blog";

export type BlogPost = BlogPostMeta & { body: string };

const modules = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: match[2] };
}

const estimateMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 220));

const posts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const fileSlug = path.split("/").pop()!.replace(/\.md$/, "");
    const slug = data.slug || fileSlug;
    return {
      title: data.title || fileSlug,
      slug,
      date: data.date || "1970-01-01",
      excerpt: data.excerpt || "",
      tags: (data.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      city: data.city || undefined,
      cover: getCoverForSlug(slug) || data.cover || undefined,
      author: data.author || "Bravo Mechanical Team",
      readingMinutes: estimateMinutes(body),
      body,
    } satisfies BlogPost;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  posts.find((p) => p.slug === slug);
