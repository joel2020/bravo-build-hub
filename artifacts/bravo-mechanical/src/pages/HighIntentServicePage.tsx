import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/LeadForm";
import { getHighIntentService, HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { getPriorityServiceAnswer } from "@/lib/priorityServiceAnswers";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick, trackEmergencyCtaClick, trackRequestServiceClick } from "@/lib/analytics";

const EMERGENCY_SERVICE_SLUG = "emergency-hvac-repair-westchester-county-ny";

const trackEmergencyCall = (location: string, service?: string) => {
  trackCallClick(location, service ? { service } : {});
  trackEmergencyCtaClick(location);
};

const HighIntentServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = getHighIntentService(slug);
  if (!service) return <Navigate to="/services" replace />;

  const url = `${SITE.siteUrl}/services/${service.slug}`;
  const related = HIGH_INTENT_SERVICES.filter((item) => item.slug !== service.slug).slice(0, 4);
  const priorityAnswer = getPriorityServiceAnswer(service.slug);
  const isCanonicalEmergency = service.slug === EMERGENCY_SERVICE_SLUG;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.h1,
      serviceType: service.schema.serviceType,
      description: service.metaDescription,
      keywords: service.primaryKeyword,
      url,
      areaServed: { "@type": "AdministrativeArea", name: "Westchester County, NY" },
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
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.siteUrl}/services` },
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
    alternates: isCanonicalEmergency
      ? { en: url, es: `${SITE.siteUrl}/es/emergencia` }
      : undefined,
    jsonLd,
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Westchester HVAC Service"
        title={service.h1}
        subtitle={service.heroSubtitle}
        trackingContext={service.slug}
        rightSlot={isCanonicalEmergency ? (
          <aside aria-label="Emergency HVAC actions" className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Call Bravo Mechanical for safety-first triage and the next available response window.</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <a href={SITE.phoneHref} onClick={() => trackEmergencyCall("emergency_service_hero", service.slug)}>
                  <Phone className="h-4 w-4 mr-2" />Call Bravo Mechanical
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="font-bold">
                <a href="#emergency-service-request" onClick={() => trackRequestServiceClick("emergency_service_hero", { service: service.slug })}>Request Emergency HVAC Service</a>
              </Button>
            </div>
          </aside>
        ) : undefined}
      />

      {priorityAnswer && (
        <section className="container mx-auto px-4 pt-10" aria-labelledby="service-answer-heading">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 id="service-answer-heading" className="text-2xl font-extrabold">What to know first</h2>
            <p data-answer-summary className="mt-3 text-muted-foreground">{priorityAnswer.answer}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {priorityAnswer.decisionFactors.map((factor) => (
                <li data-decision-factor key={factor}>{factor}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {isCanonicalEmergency && (
        <section id="emergency-service-request" className="container mx-auto px-4 pt-10" aria-labelledby="emergency-service-request-heading">
          <h2 id="emergency-service-request-heading" className="text-2xl font-extrabold mb-4">Request emergency HVAC service</h2>
          <LeadForm
            source="contact_form"
            defaultService="Emergency HVAC repair"
            urgency="emergency"
            defaultMessage="Urgent no-heat or no-cool issue."
          />
        </section>
      )}

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
            <h2 className="text-2xl font-extrabold mb-4">Common symptoms and problems</h2>
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
            <h2 className="text-2xl font-extrabold mb-4">Repair vs replace guidance</h2>
            <div className="space-y-3 text-muted-foreground">
              {service.repairReplaceGuidance.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-xl font-extrabold mb-3">Equipment types we service</h2>
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
              <h2 className="text-xl font-extrabold mb-3">Property types served</h2>
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
            <h2 className="text-2xl font-extrabold mb-4">Frequently asked questions</h2>
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
            {priorityAnswer && (
              <>
                <h2 className="text-xl font-extrabold mb-3">Supporting information</h2>
                <div className="grid sm:grid-cols-2 gap-3 mb-9">
                  {priorityAnswer.proofLinks.map((item) => (
                    <Link key={item.href + item.label} to={item.href} className="border border-border rounded-md p-3 hover:border-accent transition-colors font-semibold text-sm">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
            <h2 className="text-xl font-extrabold mb-3">Related local links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {service.relatedLinks.map((item) => (
                <Link key={item.href + item.label} to={item.href} className="border border-border rounded-md p-3 hover:border-accent transition-colors font-semibold text-sm">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold mb-3">Related HVAC services</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((item) => (
                <Link key={item.slug} to={`/services/${item.slug}`} className="border border-border rounded-md p-3 hover:border-accent transition-colors font-semibold text-sm">
                  {item.h1}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-2">Need {service.h1.replace(" in Westchester County, NY", "")}?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isCanonicalEmergency
              ? "Call Bravo Mechanical for safety-first triage or use the urgent service request form on this page."
              : `Call Bravo Mechanical LLC at ${SITE.phone} or request service online.`}
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Link
                to={isCanonicalEmergency ? "#emergency-service-request" : "/contact"}
                onClick={isCanonicalEmergency
                  ? () => trackRequestServiceClick("emergency_service_sidebar", { service: service.slug })
                  : () => trackRequestServiceClick("service_sidebar", { service: service.slug })}
              >
                {service.primaryCta}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-bold">
              <a
                href={SITE.phoneHref}
                onClick={isCanonicalEmergency
                  ? () => trackEmergencyCall("emergency_service_sidebar", service.slug)
                  : () => trackCallClick("service_sidebar", { service: service.slug })}
              >
                <Phone className="h-4 w-4 mr-2" />{isCanonicalEmergency ? "Call Bravo Mechanical" : `Call ${SITE.phone}`}
              </a>
            </Button>
          </div>
        </aside>
      </section>

      <CTABand
        title={isCanonicalEmergency ? "Request Emergency HVAC Service" : `Book ${service.h1}`}
        subtitle={isCanonicalEmergency
          ? "Call Bravo Mechanical for safety-first triage or submit the urgent service request form."
          : "Residential and commercial HVAC service throughout Westchester County, NY."}
        primaryLabel={isCanonicalEmergency ? "Request Emergency HVAC Service" : undefined}
        primaryHref={isCanonicalEmergency ? "#emergency-service-request" : undefined}
        phoneLabel={isCanonicalEmergency ? "Call Bravo Mechanical" : undefined}
        onPrimaryClick={isCanonicalEmergency ? () => trackRequestServiceClick("emergency_service_footer", { service: service.slug }) : undefined}
        onPhoneClick={isCanonicalEmergency ? () => trackEmergencyCall("emergency_service_footer", service.slug) : undefined}
        trackingContext={service.slug}
      />
    </Layout>
  );
};

export default HighIntentServicePage;
