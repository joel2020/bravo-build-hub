import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
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
import { SITE } from "@/lib/site";
import {
  buildServiceCityPageSemantics,
  localPageSchemaArray,
} from "@/lib/localPageModel";
import {
  trackEmergencyCtaClick,
  trackRequestServiceClick,
} from "@/lib/analytics";
import { useSeo } from "@/lib/seo";

const ServiceCityPage = () => {
  const { serviceSlug, citySlug } = useParams<{
    serviceSlug: string;
    citySlug: string;
  }>();
  const landing =
    serviceSlug && citySlug
      ? getServiceCityLanding(serviceSlug, citySlug)
      : undefined;
  const city = citySlug ? getCityLanding(citySlug) : undefined;
  const pageUrl = landing
    ? `${SITE.siteUrl}/services/${landing.serviceSlug}/${landing.citySlug}`
    : SITE.siteUrl;
  const semantics = landing && city
    ? buildServiceCityPageSemantics(landing, city, SITE.siteUrl)
    : undefined;

  useSeo({
    title: landing?.metaTitle ?? "",
    description: landing?.metaDescription ?? "",
    canonical: pageUrl,
    image: "/og-image.jpg",
    jsonLd: semantics ? localPageSchemaArray(semantics) : undefined,
  });

  if (!landing || !city || !semantics) return <Navigate to="/services" replace />;

  const relatedGuides = landing.relatedGuideSlugs
    .map(getPostBySlug)
    .filter((post): post is NonNullable<typeof post> => !!post);
  const relatedServices = landing.relatedServiceSlugs
    .map((relatedSlug) => getServiceCityLanding(relatedSlug, city.slug))
    .filter((page): page is NonNullable<typeof page> => !!page);
  const otherCities = Object.values(SERVICE_CITY_LANDING_CONTENT).filter(
    (page) =>
      page.serviceSlug === landing.serviceSlug && page.citySlug !== city.slug,
  );

  return (
    <Layout>
      <PageHero
        eyebrow={`${landing.serviceTitle} • ${city.name}, NY`}
        title={semantics.h1}
        subtitle={`Property-specific ${landing.serviceTitle.toLowerCase()} guidance for ${city.name} homes and light-commercial spaces from a Westchester HVAC contractor.`}
      />

      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            to={semantics.parent.path}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {semantics.parent.linkLabel}
          </Link>
          <Link
            to={`/service-areas/${city.slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <MapPin className="h-4 w-4" /> All HVAC services in {city.name}
          </Link>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                {landing.serviceTitle} guidance for {city.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {landing.answerFirst}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold mb-4">
                Local considerations
              </h2>
              <ul className="space-y-2">
                {landing.localConsiderations.map((consideration) => (
                  <li key={consideration} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    {consideration}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  Common concerns
                </h2>
                <ul className="space-y-2">
                  {landing.commonConcerns.map((concern) => (
                    <li key={concern} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  Service scope to discuss
                </h2>
                <ul className="space-y-2">
                  {landing.serviceScope.map((scope) => (
                    <li key={scope} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {scope}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <aside className="bg-card border border-border rounded-lg p-6 h-fit">
            <div className="text-accent font-bold uppercase tracking-wider text-xs mb-2">
              Request service
            </div>
            <h2 className="font-bold text-lg mb-3">
              {landing.serviceTitle} for {city.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Request a written, project-specific scope from Bravo Mechanical
              and verify the applicable requirements before approving work.
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
                    trackRequestServiceClick(
                      `service_city_${landing.serviceSlug}_${landing.citySlug}`,
                    )
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
              {landing.serviceSlug === "hvac-repair" && (
                <Button
                  asChild
                  size="lg"
                  variant="destructive"
                  className="font-bold"
                >
                  <a
                    href={SITE.phoneHref}
                    onClick={() =>
                      trackEmergencyCtaClick(
                        `service_city_emergency_${city.slug}`,
                      )
                    }
                  >
                    Emergency HVAC Call
                  </a>
                </Button>
              )}
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
              {landing.safeChecks.map((check) => (
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
              {landing.professionalBoundaries.map((boundary) => (
                <li key={boundary} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {boundary}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {relatedGuides.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-extrabold mb-6">Related guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {relatedGuides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/blog/${guide.slug}`}
                className="border border-border rounded-md p-4 hover:border-accent transition-colors font-semibold text-sm"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedServices.length > 0 && (
        <section className="bg-secondary border-y border-border">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <h2 className="text-2xl font-extrabold mb-6">
              Related HVAC services in {city.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedServices.map((service) => (
                <Link
                  key={service.serviceSlug}
                  to={`/services/${service.serviceSlug}/${service.citySlug}`}
                  className="border border-border bg-card rounded-md p-4 hover:border-accent transition-colors font-semibold text-sm"
                >
                  {service.serviceTitle} in {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {otherCities.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mb-6">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">
              Nearby cities
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {landing.serviceTitle} in other published service areas
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {otherCities.map((otherCity) => {
              const cityName =
                getCityLanding(otherCity.citySlug)?.name ?? otherCity.citySlug;
              return (
                <Link
                  key={otherCity.citySlug}
                  to={`/services/${otherCity.serviceSlug}/${otherCity.citySlug}`}
                  className="flex items-center gap-2 p-3 bg-card border border-border rounded-md hover:border-accent transition-colors"
                >
                  <MapPin className="h-4 w-4 text-accent shrink-0" />
                  <span className="font-semibold text-sm">
                    {otherCity.shortTitle} in {cityName}
                  </span>
                </Link>
              );
            })}
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
              {landing.serviceTitle} in {city.name} — common questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="max-w-3xl">
            {landing.faqItems.map((faq, index) => (
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

      <CTABand
        title={`Need ${landing.serviceTitle.toLowerCase()} in ${city.name}?`}
        subtitle="Request a written, project-specific scope from a Westchester HVAC team and review the terms before approving work."
      />
    </Layout>
  );
};

export default ServiceCityPage;
