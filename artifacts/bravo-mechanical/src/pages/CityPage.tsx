import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, Phone, ArrowLeft, Star, Calendar, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCity, CITIES } from "@/lib/cities";
import { SERVICES, SITE } from "@/lib/site";
import { isTopCity } from "@/lib/serviceCityCombos";
import { getPostsForCity } from "@/lib/blog";
import { trackRequestServiceClick } from "@/lib/analytics";
import { useSeo } from "@/lib/seo";

const TOP_CITY_NOTES: Record<string, { housing: string; permitting: string; seasonal: string }> = {
  yonkers: {
    housing: "Many Yonkers homes still run legacy steam or hot-water boilers. We frequently retrofit these systems with high-efficiency gas boilers and add ductless cooling where ductwork is limited.",
    permitting: "For larger replacements, we coordinate permits and inspection timing with local requirements so homeowners have paperwork in place for resale and warranty support.",
    seasonal: "Winter no-heat and summer no-cool calls are common in older housing stock, so we prioritize same-day triage whenever possible.",
  },
  "white-plains": {
    housing: "White Plains includes both high-rise condos and older single-family homes. Our work often combines airflow correction with equipment upgrades to fix uneven comfort.",
    permitting: "We handle replacement documentation and permit coordination for homeowners, building managers, and light commercial properties.",
    seasonal: "High summer humidity and shoulder-season furnace issues are the most frequent causes of emergency calls here.",
  },
  "new-rochelle": {
    housing: "New Rochelle's coastal housing often mixes boiler heat with no central AC. We commonly install multi-zone mini-splits to add cooling without major demolition.",
    permitting: "Where permit-triggering equipment changes are required, we provide scope details and model documentation up front.",
    seasonal: "Sound-shore humidity drives indoor air quality concerns, so dehumidification and filtration upgrades are common add-ons.",
  },
  "mount-vernon": {
    housing: "Mount Vernon properties often include older boilers and oil systems. We regularly replace unsafe or inefficient components while preserving existing distribution where possible.",
    permitting: "Our team documents safety and combustion checks clearly so owners and property managers have clean records.",
    seasonal: "Fast-response heating repairs in winter are especially important for multi-family and older buildings.",
  },
  scarsdale: {
    housing: "Scarsdale homes are often larger and older, which makes zoning and load calculations critical. We design for consistent room-by-room comfort rather than one-size-fits-all sizing.",
    permitting: "For full replacements and major retrofits, we coordinate permit-ready scopes and code-compliant final layouts.",
    seasonal: "High expectations for quiet operation, clean installation details, and long-term efficiency shape most Scarsdale projects.",
  },
};

const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const city = slug ? getCity(slug) : undefined;

  const pageUrl = city ? `${SITE.siteUrl}/service-areas/${city.slug}` : SITE.siteUrl;
  const title = city ? `HVAC ${city.name}, NY — Heating, Cooling & Repair | ${SITE.name}` : "Service Areas";
  const description = city
    ? `Local HVAC service in ${city.name}, NY. Heating, cooling, repair, and installation by licensed Westchester County technicians. 24/7 emergency service. Call ${SITE.phone}.`
    : "";

  useSeo({
    title,
    description,
    canonical: pageUrl,
    image: "/og-image.jpg",
    jsonLd: city
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${pageUrl}#service`,
            name: `HVAC service in ${city.name}, NY`,
            serviceType: "Heating, cooling, installation, repair, and maintenance",
            description,
            url: pageUrl,
            areaServed: { "@type": "City", name: `${city.name}, NY` },
            provider: {
              "@id": `${SITE.siteUrl}/#localbusiness`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: city.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.siteUrl}/` },
              { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE.siteUrl}/service-areas` },
              { "@type": "ListItem", position: 3, name: city.name, item: pageUrl },
            ],
          },
        ]
      : undefined,
  });

  if (!city) return <Navigate to="/service-areas" replace />;

  const related = CITIES.filter((c) => c.slug !== city.slug && c.region === city.region).slice(0, 4);
  const localPosts = getPostsForCity(city.name, 4);

  return (
    <Layout>
      <PageHero
        eyebrow={`${city.region} • Westchester County, NY`}
        title={`HVAC Services in ${city.name}, NY`}
        subtitle={`Local heating, cooling, and air-quality service for homes and businesses in ${city.name}. Licensed, insured, and dispatched from right here in Westchester County.`}
        hideRightSlot
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
                <Link to="/contact" onClick={() => trackRequestServiceClick(`city_page_${city.slug}`)}>Get a Free Estimate</Link>
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

      {TOP_CITY_NOTES[city.slug] && (
        <section className="container mx-auto px-4 py-6 lg:py-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-extrabold mb-3">What we see most in {city.name} homes</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Housing and systems:</strong> {TOP_CITY_NOTES[city.slug].housing}</li>
              <li><strong className="text-foreground">Permits and compliance:</strong> {TOP_CITY_NOTES[city.slug].permitting}</li>
              <li><strong className="text-foreground">Seasonal service demand:</strong> {TOP_CITY_NOTES[city.slug].seasonal}</li>
            </ul>
          </div>
        </section>
      )}

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
              const href = hasCombo ? `/services/${s.slug}/${city.slug}` : `/services/${s.slug}`;
              const label = hasCombo ? `${s.title} in ${city.name} →` : `${s.title} services →`;
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
            { t: "Straight pricing", d: "A written, itemized estimate before any work begins — equipment options and total price fixed up front." },
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

    </Layout>
  );
};

export default CityPage;
