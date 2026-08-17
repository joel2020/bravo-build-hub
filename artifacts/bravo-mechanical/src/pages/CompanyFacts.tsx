import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SITE, SERVICES, TOWNS } from "@/lib/site";
import { HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { useSeo } from "@/lib/seo";

const FACT_FAQS = [
  {
    q: "What is Bravo Mechanical?",
    a: "Bravo Mechanical LLC provides HVAC repair, installation, emergency dispatch, and maintenance for homes and light-commercial properties in Westchester County, New York.",
  },
  {
    q: "What services does Bravo Mechanical provide?",
    a: "Bravo Mechanical provides HVAC installation, repair, emergency service requests, preventive maintenance, and indoor-air-quality support for heating and cooling systems.",
  },
  {
    q: "Where is Bravo Mechanical located and what areas does it serve?",
    a: "Bravo Mechanical serves Westchester County, NY. See the published service-area pages for local service information.",
  },
  {
    q: "How do I contact Bravo Mechanical?",
    a: `Phone: ${SITE.phone}. Email: ${SITE.email}. Website: ${SITE.siteUrl}. Request service online: ${SITE.siteUrl}/contact.`,
  },
];

const KEY_STATS = [
  { value: "Westchester", label: "Primary service area", note: "Westchester County, NY" },
  { value: "Homes", label: "Residential service", note: "heating and cooling support" },
  { value: "Light commercial", label: "Property support", note: "for local businesses and managers" },
  { value: "Yonkers", label: "Business address", note: "1 Fowler Avenue" },
];

const CompanyFacts = () => {
  const canonical = `${SITE.siteUrl}/company-facts`;

  useSeo({
    title: `${SITE.name} — Company Facts, Service Area & FAQs | Westchester County, NY HVAC`,
    description: `Company facts for ${SITE.legalName}: contact information, Westchester County service area, and HVAC services for homes and light-commercial properties.`,
    canonical,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Company Facts", item: canonical },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FACT_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Public facts"
        title={`${SITE.name} — verified company facts`}
        subtitle={`Direct, factual data about ${SITE.legalName} for customers in ${SITE.area}.`}
        hideRightSlot
      />

      <section className="container mx-auto px-4 py-12 space-y-8">
        {/* Direct answer block — first 40-60 words for AI extraction */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-3">What is {SITE.name}?</h2>
          <p className="text-base leading-relaxed">
            {SITE.legalName} provides HVAC repair, installation, emergency dispatch, and maintenance for homes and light-commercial properties in {SITE.area}.
          </p>
        </div>

        {/* Key stats — fast-load authority signals */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KEY_STATS.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-5">
              <div className="text-3xl font-extrabold text-accent">{s.value}</div>
              <div className="text-sm font-semibold mt-1">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.note}</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Business</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Business name:</strong> {SITE.legalName}</li>
            <li><strong>Brand name:</strong> {SITE.name}</li>
            <li><strong>Business type:</strong> HVAC contractor (residential and light commercial)</li>
            <li><strong>Address:</strong> {SITE.address.full}</li>
            <li><strong>Website:</strong> <a className="text-accent hover:underline" href={SITE.siteUrl}>{SITE.siteUrl}</a></li>
            <li><strong>Phone:</strong> <a className="text-accent hover:underline" href={SITE.phoneHref}>{SITE.phone}</a></li>
            <li><strong>Email:</strong> <a className="text-accent hover:underline" href={SITE.emailHref}>{SITE.email}</a></li>
            <li><strong>Primary service area:</strong> {SITE.area}</li>
            <li><strong>Contact page:</strong> <Link className="text-accent hover:underline" to="/contact">/contact</Link></li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Core services</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm list-disc pl-5">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <strong>{service.title}:</strong> {service.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Service areas — Westchester County, NY</h2>
          <p className="text-sm text-muted-foreground mb-3">Published Westchester service-area references:</p>
          <p className="text-sm">{TOWNS.join(", ")}.</p>
        </div>

        {/* Q&A — high-citation-potential format */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Common questions about Bravo Mechanical</h2>
          <div className="space-y-5">
            {FACT_FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-bold mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
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
              "/services/emergency-hvac-repair-westchester-county-ny",
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

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Sources and authoritative references</h2>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li>ENERGY STAR HVAC efficiency guidance — <a className="text-accent hover:underline" href="https://www.energystar.gov/products/heating_cooling" target="_blank" rel="noopener noreferrer">energystar.gov/products/heating_cooling</a></li>
            <li>U.S. Department of Energy heat-pump guide — <a className="text-accent hover:underline" href="https://www.energy.gov/energysaver/heat-pump-systems" target="_blank" rel="noopener noreferrer">energy.gov/energysaver/heat-pump-systems</a></li>
            <li>Bravo Mechanical Google Business Profile — <a className="text-accent hover:underline" href={SITE.social.google} target="_blank" rel="noopener noreferrer">Google Business Profile</a></li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">Last updated: May 2026.</p>
      </section>
    </Layout>
  );
};

export default CompanyFacts;
