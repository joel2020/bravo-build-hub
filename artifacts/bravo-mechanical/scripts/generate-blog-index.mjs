// Generates src/content/blog-index.json — post metadata WITHOUT the bodies.
//
// Why: src/lib/blog.ts used to eager-glob every .md file, which inlined all 53
// post bodies (~200 KB raw / ~74 KB gzipped) into a single chunk. Any page that
// merely listed post titles — every /service-areas/* city page, via
// getPostsForCity — downloaded the entire blog corpus to render three links.
//
// Now list views read this metadata index, and the bodies live in
// src/lib/blogBodies.ts, which only the BlogPost route imports.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, "../src/content/blog");
const OUT = path.resolve(__dirname, "../src/content/blog-index.json");

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = {};
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

const estimateMinutes = (text) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 220));

const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));

const posts = (
  await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(BLOG_DIR, file), "utf8");
      const { data, body } = parseFrontmatter(raw);
      const fileSlug = file.replace(/\.md$/, "");
      return {
        title: data.title || fileSlug,
        slug: data.slug || fileSlug,
        date: data.date || "1970-01-01",
        excerpt: data.excerpt || "",
        tags: (data.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
        city: data.city || undefined,
        author: data.author || "Bravo Mechanical Team",
        readingMinutes: estimateMinutes(body),
      };
    }),
  )
).sort((a, b) => (a.date < b.date ? 1 : -1));

await writeFile(OUT, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
console.log(`✅ generate-blog-index: ${posts.length} posts → src/content/blog-index.json (metadata only, no bodies)`);
