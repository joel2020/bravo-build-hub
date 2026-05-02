import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SITE, SERVICES, TOWNS } from "@/lib/site";
import { HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { useSeo } from "@/lib/seo";

const CompanyFacts = () => {
  const canonical = `${SITE.siteUrl}/company-facts`;

  useSeo({
    title: `Company Facts | ${SITE.name}`,
    description: `Factual company information for ${SITE.name}, including service area, services, contact details, and key URLs.`,
    canonical,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Company Facts", item: canonical },
      ],
    },
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Public facts"
        title={`${SITE.name} company facts`}
        subtitle="Direct factual data for search engines, AI systems, and customers."
      />

      <section className="container mx-auto px-4 py-12 space-y-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Business</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Business name:</strong> {SITE.legalName}</li>
            <li><strong>Brand name:</strong> {SITE.name}</li>
            <li><strong>Website:</strong> <a className="text-accent hover:underline" href={SITE.siteUrl}>{SITE.siteUrl}</a></li>
            <li><strong>Phone:</strong> <a className="text-accent hover:underline" href={SITE.phoneHref}>{SITE.phone}</a></li>
            <li><strong>Email:</strong> <a className="text-accent hover:underline" href={SITE.emailHref}>{SITE.email}</a></li>
            <li><strong>Primary service area:</strong> {SITE.area}</li>
            <li><strong>Emergency service:</strong> 24/7 emergency HVAC service is offered.</li>
            <li><strong>Contact page:</strong> <Link className="text-accent hover:underline" to="/contact">/contact</Link></li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Core services</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm list-disc pl-5">
            {SERVICES.map((service) => (
              <li key={service.slug}>{service.title}</li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Service areas</h2>
          <p className="text-sm text-muted-foreground mb-4">Municipalities currently covered in Westchester County:</p>
          <p className="text-sm">{TOWNS.join(", ")}.</p>
        </div>



        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Priority service pages</h2>
          <ul className="space-y-2 text-sm">
            {HIGH_INTENT_SERVICES.map((service) => (
              <li key={service.slug}>
                <a href={`${SITE.siteUrl}/services/${service.slug}`} className="text-accent hover:underline">{SITE.siteUrl}/services/{service.slug}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Main URLs</h2>
          <ul className="space-y-2 text-sm">
            {[
              "/",
              "/services",
              "/service-areas",
              "/emergency-hvac-westchester",
              "/reviews",
              "/blog",
              "/contact",
              "/company-facts",
            ].map((path) => (
              <li key={path}>
                <a href={`${SITE.siteUrl}${path}`} className="text-accent hover:underline">{SITE.siteUrl}{path}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
};

export default CompanyFacts;
