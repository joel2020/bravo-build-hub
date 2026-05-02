import { Link, useParams, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Layout } from "@/components/Layout";
import { CTABand } from "@/components/CTABand";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowLeft, Phone, ArrowRight } from "lucide-react";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { CITIES } from "@/lib/cities";
import { CommentsSection } from "@/components/CommentsSection";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const url = `${SITE.siteUrl}/blog/${post.slug}`;
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);
  const cityMatch = post.city
    ? CITIES.find((c) => c.name.toLowerCase() === post.city!.toLowerCase())
    : undefined;

  const origin = SITE.siteUrl;
  const absoluteCover = post.cover
    ? (post.cover.startsWith("http") ? post.cover : origin + post.cover)
    : undefined;

  useSeo({
    title: `${post.title} | ${SITE.name} Blog`,
    description: post.excerpt,
    canonical: url,
    type: "article",
    image: post.cover,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Organization",
          name: post.author,
          url: origin,
        },
        publisher: {
          "@type": "Organization",
          name: SITE.legalName,
          url: origin,
          logo: {
            "@type": "ImageObject",
            url: `${origin}/favicon.png`,
          },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        keywords: post.tags.join(", "),
        articleSection: post.tags[0],
        ...(absoluteCover ? { image: [absoluteCover] } : {}),
        ...(post.city ? { contentLocation: { "@type": "Place", name: `${post.city}, NY` } } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  });

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <Link to="/blog" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>By {post.author}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingMinutes} min read
            </span>
            {post.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {post.city}
              </span>
            )}
          </div>
          {post.cover && (
            <img
              src={post.cover}
              alt={post.title}
              width={1600}
              height={896}
              fetchPriority="high"
              className="w-full h-auto rounded-lg border border-border shadow-sm aspect-[16/9] object-cover"
            />
          )}
        </header>

        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-p:text-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>

        {cityMatch && (
          <aside className="mt-10 rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Local service
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  HVAC service in {cityMatch.name}, NY
                </h2>
                <p className="text-sm text-muted-foreground">
                  Need help with this in {cityMatch.name}? Our licensed Westchester techs serve
                  {cityMatch.neighborhoods.length > 0 && (
                    <> {cityMatch.neighborhoods.slice(0, 3).join(", ")}, </>
                  )}
                  {" "}and the rest of {cityMatch.region}.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
                <Link
                  to={`/service-areas/${cityMatch.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  {cityMatch.name} HVAC <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Phone className="h-4 w-4" /> {SITE.phone}
                </a>
              </div>
            </div>
          </aside>
        )}

        <CommentsSection postSlug={post.slug} />

        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related posts</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="block p-4 border border-border rounded-lg hover:bg-secondary transition-colors">
                  <h3 className="font-semibold text-foreground mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <CTABand />
    </Layout>
  );
};

export default BlogPost;
