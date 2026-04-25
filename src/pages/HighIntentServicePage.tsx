import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getHighIntentService, HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";

const HighIntentServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = getHighIntentService(slug);
  if (!service) return <Navigate to="/services" replace />;

  const url = `${SITE.siteUrl}/services/${service.slug}`;
  const related = HIGH_INTENT_SERVICES.filter((item) => item.slug !== service.slug).slice(0, 4);

  useSeo({
    title: service.seoTitle,
    description: service.metaDescription,
    canonical: url,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.h1,
        serviceType: service.h1,
        description: service.metaDescription,
        url,
        areaServed: { "@type": "AdministrativeArea", name: "Westchester County, NY" },
        provider: {
          "@type": "HVACBusiness",
          name: SITE.legalName,
          telephone: SITE.phone,
          email: SITE.email,
          url: SITE.siteUrl,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
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
    ],
  });

  return (
    <Layout>
      <PageHero eyebrow="Westchester HVAC Service" title={service.h1} subtitle={service.localIntro} />

      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold mb-3">Local HVAC experts in Westchester County</h2>
            <p className="text-muted-foreground">{service.localIntro}</p>
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
            <h2 className="text-2xl font-extrabold mb-4">Our process</h2>
            <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
              {service.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
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

        <aside className="bg-card border border-border rounded-lg p-6 h-fit">
          <h3 className="font-bold text-lg mb-2">Need {service.h1.replace(" in Westchester County, NY", "")}?</h3>
          <p className="text-sm text-muted-foreground mb-4">Request a quote online or call now for faster emergency response.</p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Link to="/contact">Request Service</Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-bold">
              <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
            </Button>
          </div>
        </aside>
      </section>

      <CTABand title={`Book ${service.h1}`} subtitle="Fast response, clear pricing, and local licensed technicians." />
    </Layout>
  );
};

export default HighIntentServicePage;
