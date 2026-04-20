import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Search, X } from "lucide-react";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const Blog = () => {
  const posts = getAllPosts();
  const tags = getAllTags();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, activeTag, query]);

  useSeo({
    title: "HVAC Blog — Westchester Heating & Cooling Tips | Bravo Mechanical",
    description:
      "Practical HVAC guides for Westchester County homeowners: seasonal tune-ups, NY rebates, troubleshooting, and local install advice from licensed pros.",
    canonical: `${window.location.origin}/blog`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${SITE.name} HVAC Blog`,
      url: `${window.location.origin}/blog`,
      publisher: { "@type": "Organization", name: SITE.legalName },
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${window.location.origin}/blog/${p.slug}`,
        datePublished: p.date,
        author: { "@type": "Organization", name: p.author },
      })),
    },
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Blog"
        title="HVAC tips & guides for Westchester homeowners"
        subtitle="Seasonal advice, rebate breakdowns, troubleshooting walkthroughs, and local install know-how from licensed Westchester County pros."
      />

      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 max-w-xl">
          <label htmlFor="blog-search" className="sr-only">Search posts</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts by title, city, or topic…"
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {(query || activeTag) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "post" : "posts"}
              {activeTag && <> tagged <span className="font-semibold text-foreground">{activeTag}</span></>}
              {query && <> matching <span className="font-semibold text-foreground">"{query}"</span></>}
            </p>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-secondary"
              }`}
            >
              All posts
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-secondary"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                {post.cover && (
                  <img
                    src={post.cover}
                    alt={post.title}
                    width={1600}
                    height={896}
                    loading="lazy"
                    className="w-full aspect-[16/9] object-cover"
                  />
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingMinutes} min read
                    </span>
                    {post.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.city}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No posts in this category yet.</p>
        )}
      </section>

      <CTABand />
    </Layout>
  );
};

export default Blog;
