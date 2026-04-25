import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCity } from "@/lib/cities";
import { getServiceContent, SERVICE_CONTENT } from "@/lib/serviceContent";
import { isTopCity, TOP_CITY_SLUGS } from "@/lib/serviceCityCombos";
import { SITE } from "@/lib/site";

const SITE_URL = "https://bravomechanicalny.com";

const ServiceCityPage = () => {
  const { serviceSlug, citySlug } = useParams<{ serviceSlug: string; citySlug: string }>();
  const service = getServiceContent(serviceSlug);
  const city = citySlug ? getCity(citySlug) : undefined;
  const valid = !!service && !!city && isTopCity(citySlug);

  useEffect(() => {
    if (!valid || !service || !city) return;
    const pageUrl = `${SITE_URL}/services/${service.slug}/${city.slug}`;
    const title = service.metaTitle(city.name);
    const description = service.metaDescription(city.name);

    const prevTitle = document.title;
    const descEl = document.querySelector('meta[name="description"]');
    const prevDesc = descEl?.getAttribute("content") ?? "";
    document.title = title;
    if (descEl) descEl.setAttribute("content", description);

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

    const serviceLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${service.title} in ${city.name}, NY`,
      serviceType: service.title,
      provider: {
        "@type": "HVACBusiness",
        name: SITE.legalName,
        telephone: SITE.phone,
        email: SITE.email,
        url: pageUrl,
        priceRange: "$$",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: SITE.rating.score,
          reviewCount: SITE.rating.count,
        },
      },
      areaServed: { "@type": "City", name: `${city.name}, NY` },
      description: service.metaDescription(city.name),
      url: pageUrl,
    };

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs(city.name).map((f) => ({
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
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
        { "@type": "ListItem", position: 3, name: service.title, item: `${SITE_URL}/services` },
        { "@type": "ListItem", position: 4, name: city.name, item: pageUrl },
      ],
    };

    const scripts = [serviceLd, faqLd, breadcrumbLd].map((data, i) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.jsonld = `service-city-${i}`;
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
  }, [valid, service, city]);

  if (!valid || !service || !city) return <Navigate to="/services" replace />;

  const otherServices = Object.values(SERVICE_CONTENT).filter((s) => s.slug !== service.slug);
  const otherCities = TOP_CITY_SLUGS.filter((s) => s !== city.slug)
    .map((s) => getCity(s))
    .filter((c): c is NonNullable<ReturnType<typeof getCity>> => !!c);

  return (
    <Layout>
      <PageHero
        eyebrow={`${service.title} • ${city.name}, NY`}
        title={service.h1(city.name)}
        subtitle={`Licensed, insured, local — ${service.title.toLowerCase()} for ${city.name} homes and businesses, dispatched from right here in Westchester County.`}
      />

      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link to="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All services
          </Link>
          <Link to={`/service-areas/${city.slug}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <MapPin className="h-4 w-4" /> All HVAC services in {city.name}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {service.title} done right in {city.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{service.intro(city.name)}</p>

            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">What's included</h3>
                <ul className="space-y-2">
                  {service.scope.map((t) => (
                    <li key={t} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Why Bravo in {city.name}</h3>
                <ul className="space-y-2">
                  {service.signals.map((b) => (
                    <li key={b} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {b.replace("${c}", city.name)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="bg-card border border-border rounded-lg p-6 h-fit">
            <div className="text-accent font-bold uppercase tracking-wider text-xs mb-2">Get a free quote</div>
            <h3 className="font-bold text-lg mb-3">{service.title} in {city.name}, NY</h3>
            <p className="text-sm text-muted-foreground mb-5">No-pressure written quote. Licensed & insured. Same-day service when available.</p>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link to="/contact">Request an Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <a href={SITE.phoneHref}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call {SITE.phone}
                </a>
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

      {/* FAQs */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">FAQ</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {service.title} in {city.name} — common questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="max-w-3xl">
            {service.faqs(city.name).map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Other services in this city */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-6">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">More in {city.name}</div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Other HVAC services we offer in {city.name}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {otherServices.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}/${city.slug}`}
              className="flex items-center gap-2 p-4 bg-card border border-border rounded-md hover:border-accent transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span className="font-semibold text-sm">{s.title} in {city.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Same service, other cities */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Nearby cities</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">{service.title} across Westchester County</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                to={`/services/${service.slug}/${c.slug}`}
                className="flex items-center gap-2 p-3 bg-card border border-border rounded-md hover:border-accent transition-colors"
              >
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span className="font-semibold text-sm">{service.shortTitle} in {c.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/service-areas" className="text-accent font-semibold text-sm">View all Westchester service areas →</Link>
          </div>
        </div>
      </section>

      <CTABand
        title={`Need ${service.title.toLowerCase()} in ${city.name}?`}
        subtitle={`Get a free written quote from a local Westchester HVAC team — no pressure, no run-around.`}
      />
    </Layout>
  );
};

export default ServiceCityPage;
