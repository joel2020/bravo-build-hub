import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, Phone, ArrowLeft, Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCity, CITIES } from "@/lib/cities";
import { SERVICES, SITE } from "@/lib/site";
import { isTopCity } from "@/lib/serviceCityCombos";
import { getPostsForCity } from "@/lib/blog";
import { Calendar, Clock } from "lucide-react";

const SITE_URL = "https://bravo-build-hub.lovable.app";

const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const city = slug ? getCity(slug) : undefined;

  useEffect(() => {
    if (!city) return;
    const pageUrl = `${SITE_URL}/service-areas/${city.slug}`;
    const title = `HVAC ${city.name}, NY — Heating, Cooling & Repair | ${SITE.name}`;
    const metaDescription = `Local HVAC service in ${city.name}, NY. Heating, cooling, repair, and installation by licensed Westchester County technicians. 24/7 emergency service. Call ${SITE.phone}.`;

    const prevTitle = document.title;
    const descEl = document.querySelector('meta[name="description"]');
    const prevDesc = descEl?.getAttribute("content") ?? "";
    document.title = title;
    if (descEl) descEl.setAttribute("content", metaDescription);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let createdCanonical = false;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    const prevHref = canonical.href;
    canonical.href = pageUrl;

    const localBusinessLd = {
      "@context": "https://schema.org",
      "@type": "HVACBusiness",
      name: SITE.legalName,
      image: `${SITE_URL}/og-image.jpg`,
      telephone: SITE.phone,
      email: SITE.email,
      url: pageUrl,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: "NY",
        addressCountry: "US",
      },
      areaServed: {
        "@type": "City",
        name: `${city.name}, NY`,
      },
      openingHoursSpecification: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "00:00",
        closes: "23:59",
      }],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: SITE.rating.score,
        reviewCount: SITE.rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    };

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: city.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE_URL}/service-areas` },
        { "@type": "ListItem", position: 3, name: city.name, item: pageUrl },
      ],
    };

    const scripts = [localBusinessLd, faqLd, breadcrumbLd].map((data, i) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.jsonld = `city-${i}`;
      el.text = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });

    return () => {
      document.title = prevTitle;
      if (descEl) descEl.setAttribute("content", prevDesc);
      if (canonical) {
        if (createdCanonical) canonical.remove();
        else canonical.href = prevHref;
      }
      scripts.forEach((s) => s.remove());
    };
  }, [city]);

  if (!city) return <Navigate to="/service-areas" replace />;

  const related = CITIES.filter((c) => c.slug !== city.slug && c.region === city.region).slice(0, 4);
  const localPosts = getPostsForCity(city.name, 4);

  return (
    <Layout>
      <PageHero
        eyebrow={`${city.region} • Westchester County, NY`}
        title={`HVAC Services in ${city.name}, NY`}
        subtitle={`Local heating, cooling, and air-quality service for homes and businesses in ${city.name}. Licensed, insured, and dispatched from right here in Westchester County.`}
      />

      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="mb-6">
          <Link to="/service-areas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All Westchester service areas
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold">Trusted HVAC service in {city.name}</h2>
            <p className="text-muted-foreground leading-relaxed">{city.intro}</p>
            <p className="text-muted-foreground leading-relaxed">{city.housing}</p>
            <p className="text-muted-foreground leading-relaxed">{city.climateNote}</p>

            {(city.zips.length > 0 || city.neighborhoods.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-5 pt-2">
                {city.neighborhoods.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Neighborhoods we cover</h3>
                    <ul className="space-y-1.5">
                      {city.neighborhoods.map((n) => (
                        <li key={n} className="flex gap-2 text-sm"><MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {city.zips.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">ZIP codes served</h3>
                    <div className="flex flex-wrap gap-2">
                      {city.zips.map((z) => (
                        <span key={z} className="text-sm font-mono bg-secondary border border-border rounded px-2 py-1">{z}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="bg-card border border-border rounded-lg p-6 h-fit">
            <div className="text-accent font-bold uppercase tracking-wider text-xs mb-2">Get a free estimate</div>
            <h3 className="font-bold text-lg mb-3">Local techs serving {city.name}.</h3>
            <p className="text-sm text-muted-foreground mb-5">No-pressure written quote. Licensed & insured. Same-day service when available.</p>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link to="/contact">Request an Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
              </Button>
            </div>
            <div className="mt-5 pt-5 border-t border-border flex items-center gap-2 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-muted-foreground">{SITE.rating.score} on Google</span>
            </div>
          </aside>
        </div>
      </section>

      {/* Services in this city */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl mb-8">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Services in {city.name}</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Full residential & commercial HVAC</h2>
            <p className="mt-3 text-muted-foreground">Whatever your heating, cooling, or air-quality need in {city.name}, we handle it in-house — no subcontractors, no run-around.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => {
              const hasCombo = isTopCity(city.slug);
              const href = hasCombo ? `/services/${s.slug}/${city.slug}` : "/services";
              const label = hasCombo ? `${s.title} in ${city.name} →` : "View all services →";
              return (
                <div key={s.slug} className="bg-card border border-border rounded-lg p-5 flex flex-col">
                  <h3 className="font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{s.description}</p>
                  <Link to={href} className="text-sm text-accent font-semibold mt-4">{label}</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why local matters */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-2xl mb-8">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Why local matters</div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Why {city.name} homeowners choose Bravo Mechanical</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { t: "We live and work in Westchester", d: `Our techs know ${city.name} — the housing stock, the climate, the building codes. No guessing.` },
            { t: "Honest sizing and honest pricing", d: "We do real load calculations and quote in writing before any work begins. No bait-and-switch." },
            { t: "Licensed, insured, and code-compliant", d: "Every install is permitted when required and built to last. We protect your home." },
            { t: "Rebate-savvy", d: "We know the NYS Clean Heat, Comfort Home, IRA 25C, and Con Edison programs and confirm eligibility before you buy." },
          ].map((b) => (
            <div key={b.t} className="bg-card border border-border rounded-lg p-5 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1">{b.t}</div>
                <div className="text-sm text-muted-foreground">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">FAQ</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">{city.name} HVAC questions, answered</h2>
          </div>
          <Accordion type="single" collapsible className="max-w-3xl">
            {city.faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Local blog guides for this city */}
      {localPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl mb-8">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Local guides</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">HVAC guides for {city.name} homeowners</h2>
            <p className="mt-3 text-muted-foreground">
              Practical advice from our techs on the systems, weather, and housing stock we see most often in {city.name}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {localPosts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors flex flex-col"
              >
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={p.title}
                    width={1600}
                    height={896}
                    loading="lazy"
                    className="w-full aspect-[16/9] object-cover"
                  />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{p.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.readingMinutes} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/blog" className="text-accent font-semibold text-sm">Browse all HVAC guides →</Link>
          </div>
        </section>
      )}

      {/* Nearby cities */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Nearby</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">We also serve nearby {city.region}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {related.map((c) => (
              <Link
                key={c.slug}
                to={`/service-areas/${c.slug}`}
                className="flex items-center gap-2 p-3 bg-card border border-border rounded-md hover:border-accent transition-colors"
              >
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span className="font-semibold text-sm">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/service-areas" className="text-accent font-semibold text-sm">View all Westchester service areas →</Link>
          </div>
        </section>
      )}

      <CTABand
        title={`Need HVAC service in ${city.name}?`}
        subtitle={`Call us or request an estimate online — we'll be back to you fast.`}
      />
    </Layout>
  );
};

export default CityPage;
