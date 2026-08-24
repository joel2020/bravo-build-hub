// Blog post loader: parses markdown files in src/content/blog/*.md with YAML frontmatter.
// Frontmatter keys: title, slug, date (YYYY-MM-DD), excerpt, tags (comma list), city, author, readingTime
// Cover images are resolved via src/lib/blogCovers.ts (slug → imported asset URL).
import { getCoverForSlug } from "./blogCovers";

export type BlogPost = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  city?: string;
  cover?: string;
  author: string;
  readingMinutes: number;
  body: string;
};

// Eager-load all markdown files at build time
const modules = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  return { data, body: match[2] };
}

function estimateMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

const posts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const fileSlug = path.split("/").pop()!.replace(/\.md$/, "");
    return {
      title: data.title || fileSlug,
      slug: data.slug || fileSlug,
      date: data.date || "1970-01-01",
      excerpt: data.excerpt || "",
      tags: (data.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      city: data.city || undefined,
      cover: getCoverForSlug(data.slug || fileSlug) || data.cover || undefined,
      author: data.author || "Bravo Mechanical Team",
      readingMinutes: estimateMinutes(body),
      body,
    } satisfies BlogPost;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getAllPosts = (): BlogPost[] => posts;
export const getPostBySlug = (slug: string): BlogPost | undefined => posts.find((p) => p.slug === slug);
export const getAllTags = (): string[] => Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

export const formatBlogDate = (date: string): string =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// Returns posts relevant to a given city. Matches by exact city frontmatter first,
// then falls back to posts that include the city name as a tag. Used for internal
// SEO linking from /service-areas/:slug pages to local blog content.
export const getPostsForCity = (cityName: string, limit = 4): BlogPost[] => {
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
