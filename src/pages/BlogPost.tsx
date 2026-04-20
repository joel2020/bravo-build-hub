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

  const url = `${window.location.origin}/blog/${post.slug}`;
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  useSeo({
    title: `${post.title} | ${SITE.name} Blog`,
    description: post.excerpt,
    canonical: url,
    type: "article",
    image: post.cover,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: post.author, url: window.location.origin },
      publisher: {
        "@type": "Organization",
        name: SITE.legalName,
        url: window.location.origin,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      keywords: post.tags.join(", "),
      articleSection: post.tags[0],
    },
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
