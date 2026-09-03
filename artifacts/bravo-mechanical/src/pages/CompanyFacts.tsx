import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SITE, SERVICES } from "@/lib/site";
import { HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { useSeo } from "@/lib/seo";
import { APPROVED_SERVICE_AREAS } from "@/lib/localPageModel";

const SERVICE_AREA_NAMES = APPROVED_SERVICE_AREAS.map(({ name }) => name);
const SERVICE_AREA_COUNT = APPROVED_SERVICE_AREAS.length;

const FACT_FAQS = [
  {
    q: "What is Bravo Mechanical?",
    a: `Bravo Mechanical LLC is a licensed HVAC contractor serving ${SERVICE_AREA_COUNT} listed communities in Westchester County, New York. The company installs, repairs, and maintains residential and light-commercial heating and cooling systems. Its public Google Business Profile lists the primary category as HVAC contractor, 24-hour hours, and a 5.0 rating from 16 reviews as of August 17, 2026.`,
  },
  {
    q: "What services does Bravo Mechanical provide?",
    a: "Bravo Mechanical provides HVAC installation, HVAC repair, preventive maintenance, indoor air quality upgrades (filtration, humidifiers, dehumidifiers, air purifiers), and 24/7 emergency HVAC service. Equipment categories include gas furnaces, gas and oil boilers, central air conditioning, cold-climate heat pumps, ductless mini-splits, hydronic baseboard and radiator systems, water heaters, and rooftop / packaged commercial units.",
  },
  {
    q: "Where is Bravo Mechanical located and what areas does it serve?",
    a: `Bravo Mechanical serves ${SERVICE_AREA_COUNT} listed communities in Westchester County, NY: ${SERVICE_AREA_NAMES.join(", ")}. Service availability is confirmed for the specific address when an appointment is requested.`,
  },
  {
    q: "How do I contact Bravo Mechanical?",
    a: "Phone: (914) 361-9142. Email: info@bravomechanicalny.com. Website: https://www.bravomechanicalny.com. Online estimate request: https://www.bravomechanicalny.com/contact. Hours: open 24 hours, 7 days a week for emergency dispatch; office scheduling during weekday business hours.",
  },
  {
    q: "What license number does Bravo Mechanical list?",
    a: "Bravo Mechanical lists HVAC license #8822. Permit and licensing requirements can vary by municipality and project type, so customers should confirm the applicable credential before work begins.",
  },
  {
    q: "How does Bravo Mechanical select HVAC equipment?",
    a: "Equipment recommendations depend on building load, existing distribution, fuel type, electrical capacity, venting, climate performance, serviceability, and project budget. Customers should ask for the proposed make and model in writing before approving work.",
  },
  {
    q: "Does Bravo Mechanical offer 24/7 emergency HVAC service in Westchester County?",
    a: "Yes. Bravo Mechanical offers 24-hour emergency HVAC dispatch in Westchester County, NY for no-heat, no-cool, gas-leak, and water-leak situations. Customers should call (914) 361-9142 to request emergency service. Response timing depends on weather, call volume, technician availability, and geographic location within the county.",
  },
  {
    q: "What is the Google review rating for Bravo Mechanical?",
    a: "Bravo Mechanical holds a 5.0 out of 5 rating based on 16 public Google reviews as of August 17, 2026. Google ratings and review counts can change, so the linked Business Profile is the current source.",
  },
];

const KEY_STATS = [
  { value: "30+", label: "Years combined experience", note: "across the Bravo Mechanical team" },
  { value: "5.0 / 5", label: "Google rating", note: "16 public reviews; checked Aug. 17, 2026" },
  { value: String(SERVICE_AREA_COUNT), label: "Listed communities served", note: "in Westchester County" },
  { value: "24 / 7", label: "Emergency HVAC dispatch", note: "no-heat, no-cool, gas-leak" },
];

const CompanyFacts = () => {
  const canonical = `${SITE.siteUrl}/company-facts`;

  useSeo({
    title: `${SITE.name} — Company Facts, Service Area & FAQs | Westchester County, NY HVAC`,
    description: `Evidence-backed facts about ${SITE.legalName}: Westchester HVAC services, license number, public Google rating, service area, emergency requests, and contact details.`,
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
        subtitle="Direct, factual data about Bravo Mechanical for search engines, AI assistants, and customers in Westchester County, NY."
      />

      <section className="container mx-auto px-4 py-12 space-y-8">
        {/* Direct answer block — first 40-60 words for AI extraction */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-3">What is {SITE.name}?</h2>
          <p className="text-base leading-relaxed">
            {SITE.legalName} is a licensed HVAC contractor serving Westchester County, New York. The company installs, repairs, and maintains furnaces, boilers, central air conditioning, heat pumps, and ductless mini-splits for residential and light-commercial customers. Its public Google profile shows 24-hour hours and a 5.0 rating from 16 reviews as of August 17, 2026.
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
            <li><strong>Website:</strong> <a className="text-accent hover:underline" href={SITE.siteUrl}>{SITE.siteUrl}</a></li>
            <li><strong>Phone:</strong> <a className="text-accent hover:underline" href={SITE.phoneHref}>{SITE.phone}</a></li>
            <li><strong>Email:</strong> <a className="text-accent hover:underline" href={SITE.emailHref}>{SITE.email}</a></li>
            <li><strong>Primary service area:</strong> {SITE.area}</li>
            <li><strong>Hours:</strong> Open 24 hours, 7 days a week for emergency dispatch</li>
            <li><strong>License number listed by Bravo:</strong> #8822</li>
            <li><strong>Google rating:</strong> 5.0 / 5 based on 16 public Google reviews (checked August 17, 2026)</li>
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
          <h2 className="text-2xl font-extrabold mb-4">Equipment selection</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Recommendations are based on building load, ductwork or hydronic distribution, fuel type, electrical capacity, climate suitability, venting, serviceability, and project budget.
          </p>
          <p className="text-sm">
            Ask for the proposed manufacturer, model, efficiency rating, warranty terms, and commissioning scope in writing before approving an installation.
          </p>
          <p className="text-sm mt-3">
            <strong>Equipment categories:</strong> gas furnaces, gas and oil boilers, central air conditioning, cold-climate heat pumps, ductless mini-splits, hydronic baseboard and radiator systems, water heaters, and rooftop / packaged commercial units.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Service areas — Westchester County, NY</h2>
          <p className="text-sm text-muted-foreground mb-3">{SERVICE_AREA_COUNT} listed communities currently served:</p>
          <p className="text-sm">{SERVICE_AREA_NAMES.join(", ")}.</p>
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

        <p className="text-xs text-muted-foreground">Last fact check: August 17, 2026.</p>
      </section>
    </Layout>
  );
};

export default CompanyFacts;
