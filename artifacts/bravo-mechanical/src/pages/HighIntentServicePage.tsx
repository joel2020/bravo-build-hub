import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  getHighIntentService,
  HIGH_INTENT_SERVICES,
} from "@/lib/highIntentServices";
import { SERVICE_CITY_LANDING_CONTENT } from "@/lib/localLandingContent";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick, trackRequestServiceClick } from "@/lib/analytics";

const HighIntentServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = getHighIntentService(slug);
  if (!service) return <Navigate to="/services" replace />;

  const url = `${SITE.siteUrl}/services/${service.slug}`;
  const related = HIGH_INTENT_SERVICES.filter(
    (item) => item.slug !== service.slug,
  ).slice(0, 4);
  const localServicePages = Object.values(SERVICE_CITY_LANDING_CONTENT).filter(
    (page) => page.parentServicePath === `/services/${service.slug}`,
  );

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.h1,
      serviceType: service.schema.serviceType,
      description: service.metaDescription,
      keywords: service.primaryKeyword,
      url,
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Westchester County, NY",
      },
      provider: {
        "@id": `${SITE.siteUrl}/#localbusiness`,
      },
      availableChannel: service.schema.emergency
        ? {
            "@type": "ServiceChannel",
            servicePhone: {
              "@type": "ContactPoint",
              telephone: SITE.phone,
              contactType: "Emergency HVAC",
              areaServed: "Westchester County, NY",
            },
          }
        : undefined,
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
          name: "Services",
          item: `${SITE.siteUrl}/services`,
        },
        { "@type": "ListItem", position: 3, name: service.h1, item: url },
      ],
    },
  ];

  if (service.faqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
  }

  useSeo({
    title: service.seoTitle,
    description: service.metaDescription,
    canonical: url,
    jsonLd,
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Westchester HVAC Service"
        title={service.h1}
        subtitle={service.heroSubtitle}
      />

      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-9">
          <div>
            <h2 className="text-2xl font-extrabold mb-3">Local overview</h2>
            <div className="space-y-4 text-muted-foreground">
              {service.localOverview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              Common symptoms and problems
            </h2>
            <ul className="space-y-2">
              {service.symptoms.map((symptom) => (
                <li key={symptom} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                  {symptom}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-4">What’s included</h2>
            <ul className="space-y-2">
              {service.whatsIncluded.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-4">Our process</h2>
            <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
              {service.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              Repair vs replace guidance
            </h2>
            <div className="space-y-3 text-muted-foreground">
              {service.repairReplaceGuidance.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          {service.schema.emergency && (
            <div className="border border-amber-300/60 bg-amber-50/60 rounded-lg p-5 text-slate-900">
              <h2 className="text-2xl font-extrabold mb-3">
                Safety steps before HVAC service
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  If you smell gas, leave the building and call 911 or your gas
                  utility from a safe location. Do not operate switches or use a
                  flame.
                </li>
                <li>
                  If you see smoke, sparks, or an active fire, leave the
                  building and call 911. Shut off equipment only when it is safe
                  to do so.
                </li>
                <li>
                  For water near electrical equipment, keep clear of the area
                  and switch off the circuit only if the panel is dry and safely
                  accessible.
                </li>
                <li>
                  When you call, have the service address, equipment type,
                  symptoms, error code, and any recent work ready. Dispatch
                  timing depends on conditions and technician availability.
                </li>
              </ul>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-xl font-extrabold mb-3">
                Equipment types we service
              </h2>
              <ul className="space-y-2">
                {service.equipmentTypes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-xl font-extrabold mb-3">
                Property types served
              </h2>
              <ul className="space-y-2">
                {service.propertyTypes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible>
              {service.faqs.map((faq, idx) => (
                <AccordionItem key={faq.q} value={`faq-${idx}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h2 className="text-xl font-extrabold mb-3">Related local links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {service.relatedLinks.map((item) => (
                <Link
                  key={item.href + item.label}
                  to={item.href}
                  className="border border-border rounded-md p-3 hover:border-accent transition-colors font-semibold text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {localServicePages.length > 0 && (
            <div>
              <h2 className="text-xl font-extrabold mb-3">
                {service.h1.replace(" in Westchester County, NY", "")} in
                Westchester communities
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {localServicePages.map((page) => (
                  <Link
                    key={`${page.serviceSlug}-${page.citySlug}`}
                    to={`/services/${page.serviceSlug}/${page.citySlug}`}
                    className="border border-border rounded-md p-3 hover:border-accent transition-colors font-semibold text-sm"
                  >
                    {page.h1.replace(", NY", "")}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-extrabold mb-3">
              Related HVAC services
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/services/${item.slug}`}
                  className="border border-border rounded-md p-3 hover:border-accent transition-colors font-semibold text-sm"
                >
                  {item.h1}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-2">
            Need {service.h1.replace(" in Westchester County, NY", "")}?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Call Bravo Mechanical LLC at {SITE.phone} or request local service
            online. Scheduling and dispatch depend on current availability.
          </p>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              <Link
                to="/contact"
                onClick={() =>
                  trackRequestServiceClick(`service_sidebar_${service.slug}`)
                }
              >
                {service.primaryCta}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-bold">
              <a
                href={SITE.phoneHref}
                data-call-tracked="true"
                onClick={() =>
                  trackCallClick(`service_sidebar_${service.slug}`)
                }
              >
                <Phone className="h-4 w-4 mr-2" />
                Call {SITE.phone}
              </a>
            </Button>
          </div>
        </aside>
      </section>

      <CTABand
        title={`Book ${service.h1}`}
        subtitle="Residential and commercial HVAC service throughout Westchester County, NY."
      />
    </Layout>
  );
};

export default HighIntentServicePage;
