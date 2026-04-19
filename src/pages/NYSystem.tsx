import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { RebateEstimator } from "@/components/RebateEstimator";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getNYSystem, NY_SYSTEMS } from "@/lib/nySystems";
import { SITE } from "@/lib/site";

const NYSystem = () => {
  const { slug } = useParams<{ slug: string }>();
  const system = slug ? getNYSystem(slug) : undefined;

  useEffect(() => {
    if (!system) return;
    const prevTitle = document.title;
    const desc = document.querySelector('meta[name="description"]');
    const prevDesc = desc?.getAttribute("content") ?? "";
    document.title = `${system.page.title} | ${SITE.name}`;
    if (desc) desc.setAttribute("content", system.page.metaDescription);

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let createdCanonical = false;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    const prevHref = canonical.href;
    const pageUrl = `https://bravo-build-hub.lovable.app/services/${system.slug}`;
    canonical.href = pageUrl;

    // JSON-LD: Service + FAQPage
    const serviceLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: system.page.title,
      serviceType: system.card.title,
      description: system.page.metaDescription,
      areaServed: { "@type": "AdministrativeArea", name: SITE.area },
      provider: {
        "@type": "LocalBusiness",
        name: SITE.name,
        telephone: SITE.phone,
        email: SITE.email,
        areaServed: SITE.area,
      },
      url: pageUrl,
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: system.page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://bravo-build-hub.lovable.app/" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://bravo-build-hub.lovable.app/services" },
        { "@type": "ListItem", position: 3, name: system.card.title, item: pageUrl },
      ],
    };
    const serviceScript = document.createElement("script");
    serviceScript.type = "application/ld+json";
    serviceScript.dataset.jsonld = "service";
    serviceScript.text = JSON.stringify(serviceLd);
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.dataset.jsonld = "faq";
    faqScript.text = JSON.stringify(faqLd);
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.dataset.jsonld = "breadcrumb";
    breadcrumbScript.text = JSON.stringify(breadcrumbLd);
    document.head.appendChild(serviceScript);
    document.head.appendChild(faqScript);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.title = prevTitle;
      if (desc) desc.setAttribute("content", prevDesc);
      if (canonical) {
        if (createdCanonical) canonical.remove();
        else canonical.href = prevHref;
      }
      serviceScript.remove();
      faqScript.remove();
    };
  }, [system]);

  if (!system) return <Navigate to="/services" replace />;

  const { page } = system;
  const related = NY_SYSTEMS.filter((s) => s.slug !== system.slug).slice(0, 3);

  return (
    <Layout>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-8">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to all services
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold">Overview</h2>
            {page.overview.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </div>
          <aside className="bg-card border border-border rounded-lg p-6 h-fit">
            <div className="text-accent font-bold uppercase tracking-wider text-xs mb-2">Get an estimate</div>
            <h3 className="font-bold text-lg mb-3">Free written quote, no pressure.</h3>
            <p className="text-sm text-muted-foreground mb-5">Local techs, licensed & insured, serving all of {SITE.area}.</p>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link to="/contact">Request an Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Recent installs</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Real {system.card.title.toLowerCase()} jobs in Westchester</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.gallery.map((g, i) => (
              <img key={i} src={g.src} alt={g.alt} loading="lazy" className="aspect-[4/3] w-full object-cover rounded-lg border border-border" />
            ))}
          </div>
        </div>
      </section>

      {/* Rebates */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-2xl mb-8">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Rebates & incentives</div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Programs that may apply to your install</h2>
          <p className="mt-3 text-muted-foreground text-sm">Final eligibility depends on equipment model, installation address, and program funding at the time of install. We help confirm before purchase.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {page.rebates.map((r) => (
            <div key={r.name} className="bg-card border border-border rounded-lg p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <RebateEstimator />
      </section>

      {/* FAQs */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">FAQ</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Common questions</h2>
          </div>
          <Accordion type="single" collapsible className="max-w-3xl">
            {page.faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-6">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Also popular in NY</div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Related systems</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {related.map((r) => (
            <Link key={r.slug} to={`/services/${r.slug}`} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-accent transition-colors">
              <img src={r.card.img} alt={r.card.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold mb-1">{r.card.title}</h3>
                <div className="text-sm text-accent mt-auto pt-3 font-semibold">Learn more →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default NYSystem;
