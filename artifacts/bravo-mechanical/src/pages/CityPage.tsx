import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPostBySlug } from "@/lib/blog";
import {
  getCityLanding,
  getServiceCityLanding,
  SERVICE_CITY_LANDING_CONTENT,
} from "@/lib/localLandingContent";
import { SERVICES, SITE } from "@/lib/site";
import { trackRequestServiceClick } from "@/lib/analytics";
import { useSeo } from "@/lib/seo";

const GENERAL_SERVICE_LINKS: Record<string, string> = {
  "hvac-installation": "/services/ac-installation-westchester-county-ny",
  "hvac-repair": "/services/ac-repair-westchester-county-ny",
  "preventive-maintenance": "/services/hvac-maintenance-westchester-county-ny",
  "indoor-air-quality": "/services/indoor-air-quality-westchester-county-ny",
  residential: "/services",
  commercial: "/services/commercial-hvac-westchester-county-ny",
};

const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const city = slug ? getCityLanding(slug) : undefined;
  const pageUrl = city
    ? `${SITE.siteUrl}/service-areas/${city.slug}`
    : SITE.siteUrl;

  useSeo({
    title: city ? city.title : "Service Areas",
    description: city?.metaDescription ?? "",
    canonical: pageUrl,
    image: "/og-image.jpg",
    jsonLd: city
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${pageUrl}#service`,
            name: `HVAC service in ${city.name}, NY`,
            serviceType:
              "Heating, cooling, installation, repair, and maintenance",
            description: city.metaDescription,
            url: pageUrl,
            areaServed: { "@type": "City", name: `${city.name}, NY` },
            provider: { "@id": `${SITE.siteUrl}/#localbusiness` },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: city.faqItems.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${SITE.siteUrl}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Service Areas",
                item: `${SITE.siteUrl}/service-areas`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: city.name,
                item: pageUrl,
              },
            ],
          },
        ]
      : undefined,
  });

  if (!city) return <Navigate to="/service-areas" replace />;

  const relatedGuides = city.relatedGuideSlugs
    .map(getPostBySlug)
    .filter((post): post is NonNullable<typeof post> => !!post);
  const nearbyCities = city.nearbyCitySlugs
    .map(getCityLanding)
    .filter((nearby): nearby is NonNullable<typeof nearby> => !!nearby);

  return (
    <Layout>
      <PageHero
        eyebrow={`${city.region} • Westchester County, NY`}
        title={`HVAC Services in ${city.name}, NY`}
        subtitle={`Local heating, cooling, and air-quality service for homes and businesses in ${city.name}, provided by a licensed Westchester HVAC contractor.`}
        hideRightSlot
      />

      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="mb-6">
          <Link
            to="/service-areas"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All Westchester service areas
          </Link>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                HVAC guidance for {city.name} properties
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {city.answerFirst}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold mb-4">
                Local context in {city.name}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                {city.localContext.map((context) => (
                  <p key={context}>{context}</p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold mb-4">
                Common HVAC concerns
              </h2>
              <ul className="space-y-2">
                {city.commonConcerns.map((concern) => (
                  <li key={concern} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="bg-card border border-border rounded-lg p-6 h-fit">
            <div className="text-accent font-bold uppercase tracking-wider text-xs mb-2">
              Request service
            </div>
            <h2 className="font-bold text-lg mb-3">
              Local techs serving {city.name}.
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Request a written, project-specific quote from a licensed
              Westchester HVAC contractor.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
              >
                <Link
                  to="/contact"
                  onClick={() =>
                    trackRequestServiceClick(`city_page_${city.slug}`)
                  }
                >
                  Request an Estimate
                </Link>
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
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {SITE.rating.score} on Google
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              What {city.name} property owners can check safely
            </h2>
            <ul className="space-y-2">
              {city.safeChecks.map((check) => (
                <li key={check} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              Leave these HVAC checks to a professional
            </h2>
            <ul className="space-y-2">
              {city.professionalBoundaries.map((boundary) => (
                <li key={boundary} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {boundary}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {city.municipalResources.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-extrabold mb-4">
            Municipal resources for {city.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Confirm permit requirements and responsibilities in the written
            proposal or scope for the specific project.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {city.municipalResources.map((resource) => {
              const label =
                resource.label === "City of Yonkers forms and permits"
                  ? "City of Yonkers building permits and forms"
                  : resource.label;
              return (
                <a
                  key={resource.url}
                  href={resource.url}
                  className="border border-border rounded-md p-4 hover:border-accent transition-colors font-semibold text-sm"
                >
                  {label}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-2xl mb-8">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">
            Services in {city.name}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold">
            HVAC service pages for {city.name}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service) => {
            const localService = getServiceCityLanding(service.slug, city.slug);
            const href = localService
              ? `/services/${localService.serviceSlug}/${localService.citySlug}`
              : (GENERAL_SERVICE_LINKS[service.slug] ?? "/services");
            const label = localService
              ? `${localService.serviceTitle} in ${city.name} →`
              : `${service.title} services →`;
            return (
              <div
                key={service.slug}
                className="bg-card border border-border rounded-lg p-5 flex flex-col"
              >
                <h3 className="font-bold mb-2">
                  {localService?.serviceTitle ?? service.title}
                </h3>
                <p className="text-sm text-muted-foreground flex-1">
                  {localService?.answerFirst ?? service.description}
                </p>
                <Link
                  to={href}
                  className="text-sm text-accent font-semibold mt-4"
                >
                  {label}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {relatedGuides.length > 0 && (
        <section className="bg-secondary border-y border-border">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <h2 className="text-2xl font-extrabold mb-6">
              Related guides for {city.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/blog/${guide.slug}`}
                  className="border border-border bg-card rounded-md p-4 hover:border-accent transition-colors font-semibold text-sm"
                >
                  {guide.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {nearbyCities.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">
              Nearby
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              We also serve nearby communities
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {nearbyCities.map((nearby) => (
              <Link
                key={nearby.slug}
                to={`/service-areas/${nearby.slug}`}
                className="flex items-center gap-2 p-3 bg-card border border-border rounded-md hover:border-accent transition-colors"
              >
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span className="font-semibold text-sm">{nearby.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/service-areas"
              className="text-accent font-semibold text-sm"
            >
              View all Westchester service areas →
            </Link>
          </div>
        </section>
      )}

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">
              FAQ
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {city.name} HVAC questions, answered
            </h2>
          </div>
          <Accordion type="single" collapsible className="max-w-3xl">
            {city.faqItems.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
};

export default CityPage;
