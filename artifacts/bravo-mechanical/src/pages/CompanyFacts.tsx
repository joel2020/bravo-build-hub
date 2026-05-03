import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { SITE, SERVICES, TOWNS } from "@/lib/site";
import { HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { useSeo } from "@/lib/seo";

const FACT_FAQS = [
  {
    q: "What is Bravo Mechanical?",
    a: "Bravo Mechanical LLC is a licensed and insured HVAC contractor headquartered in Westchester County, New York. The company installs, repairs, and maintains residential and light-commercial heating, ventilation, and air-conditioning systems — including furnaces, boilers, central AC, cold-climate heat pumps, and ductless mini-splits — across 30 Westchester municipalities. Bravo Mechanical operates 24/7 emergency dispatch and holds a 5.0-star Google rating.",
  },
  {
    q: "What services does Bravo Mechanical provide?",
    a: "Bravo Mechanical provides HVAC installation, HVAC repair, preventive maintenance, indoor air quality upgrades (filtration, humidifiers, dehumidifiers, air purifiers), and 24/7 emergency HVAC service. Equipment categories include gas furnaces, gas and oil boilers, central air conditioning, cold-climate heat pumps, ductless mini-splits, hydronic baseboard and radiator systems, water heaters, and rooftop / packaged commercial units.",
  },
  {
    q: "Where is Bravo Mechanical located and what areas does it serve?",
    a: "Bravo Mechanical serves Westchester County, NY. The 30 covered municipalities are Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale, Rye, Harrison, Mamaroneck, Larchmont, Bronxville, Tuckahoe, Eastchester, Tarrytown, Sleepy Hollow, Ossining, Peekskill, Mount Kisco, Chappaqua, Pleasantville, Pound Ridge, Bedford, Katonah, Armonk, Hastings-on-Hudson, Dobbs Ferry, Irvington, Briarcliff Manor, Croton-on-Hudson, Yorktown, and Somers. Service is dispatched throughout the county; quotes are scheduled by appointment.",
  },
  {
    q: "How do I contact Bravo Mechanical?",
    a: "Phone: (914) 361-9142. Email: Bravomechanicalllc@gmail.com. Website: https://bravomechanicalny.com. Online estimate request: https://bravomechanicalny.com/contact. Hours: open 24 hours, 7 days a week for emergency dispatch; office scheduling during weekday business hours.",
  },
  {
    q: "Is Bravo Mechanical licensed and insured?",
    a: "Yes. Bravo Mechanical LLC is a fully licensed and insured HVAC contractor authorized to perform heating, cooling, and gas-fired equipment work in Westchester County, NY. Proof of license and insurance is provided to customers on request.",
  },
  {
    q: "What HVAC equipment brands does Bravo Mechanical install?",
    a: "Bravo Mechanical is brand-agnostic and installs major HVAC manufacturers including Carrier, Trane, Rheem, Mitsubishi Electric, Daikin, Bosch, Navien, Bradford White, AO Smith, and Weil-McLain. Recommendations are based on home size, existing ductwork, fuel type, climate suitability, and budget rather than a single-brand contract.",
  },
  {
    q: "Does Bravo Mechanical offer 24/7 emergency HVAC service in Westchester County?",
    a: "Yes. Bravo Mechanical offers 24-hour emergency HVAC dispatch in Westchester County, NY for no-heat, no-cool, gas-leak, and water-leak situations. Customers should call (914) 361-9142 to request emergency service. Response timing depends on weather, call volume, technician availability, and geographic location within the county.",
  },
  {
    q: "What rebates and tax credits are available for HVAC work in Westchester County, NY?",
    a: "Westchester homeowners may qualify for NYS Clean Heat heat-pump rebates (administered through Con Edison and other regional utilities), NYSERDA Comfort Home insulation incentives, Con Edison HVAC rebates, and the federal Inflation Reduction Act Section 25C tax credit (up to $2,000 for a qualifying heat pump and up to $600 for high-efficiency furnaces or central AC, per IRS guidance). Eligibility and dollar amounts depend on the installed equipment, utility territory, and current program rules. Bravo Mechanical helps customers identify eligibility and prepare paperwork.",
  },
  {
    q: "What is the Google review rating for Bravo Mechanical?",
    a: "Bravo Mechanical holds a 5.0 out of 5 rating based on 7 verified Google reviews as of May 2026, sourced from the company's verified Google Business Profile.",
  },
];

const KEY_STATS = [
  { value: "5.0 / 5", label: "Google rating", note: "based on 7 verified reviews" },
  { value: "30", label: "Westchester towns served", note: "from Yonkers north to Somers" },
  { value: "24 / 7", label: "Emergency HVAC dispatch", note: "no-heat, no-cool, gas-leak" },
  { value: "10+", label: "Major brands installed", note: "Carrier, Trane, Mitsubishi, Daikin, Bosch, and more" },
];

const CompanyFacts = () => {
  const canonical = `${SITE.siteUrl}/company-facts`;

  useSeo({
    title: `${SITE.name} — Company Facts, Service Area & FAQs | Westchester County, NY HVAC`,
    description: `Verified facts about ${SITE.legalName}: licensed and insured Westchester County HVAC contractor, 30 towns served, 24/7 emergency dispatch, brands installed, rebates, and answers to common questions.`,
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
            {SITE.legalName} is a licensed and insured HVAC contractor based in Westchester County, New York. The company installs, repairs, and maintains furnaces, boilers, central air conditioning, heat pumps, and ductless mini-splits for residential and light-commercial customers across 30 Westchester municipalities, with 24/7 emergency dispatch and a 5.0-star Google rating.
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
            <li><strong>Licensing:</strong> Fully licensed and insured HVAC contractor in Westchester County, NY</li>
            <li><strong>Google rating:</strong> 5.0 / 5 based on 7 verified Google reviews (as of May 2026)</li>
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
          <h2 className="text-2xl font-extrabold mb-4">Equipment and brands installed</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bravo Mechanical is brand-agnostic. Recommendations are based on home size, ductwork, fuel type, climate suitability, and budget — not on a single-brand contract.
          </p>
          <p className="text-sm">
            <strong>Brands:</strong> Carrier, Trane, Rheem, Mitsubishi Electric, Daikin, Bosch, Navien, Bradford White, AO Smith, Weil-McLain, and other major HVAC manufacturers commonly installed in Westchester County.
          </p>
          <p className="text-sm mt-3">
            <strong>Equipment categories:</strong> gas furnaces, gas and oil boilers, central air conditioning, cold-climate heat pumps, ductless mini-splits, hydronic baseboard and radiator systems, water heaters, and rooftop / packaged commercial units.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Rebates and tax credits</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bravo Mechanical helps Westchester homeowners identify and apply for available HVAC incentives. Eligibility and amounts depend on equipment, utility territory, and current program rules.
          </p>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li><strong>NYS Clean Heat:</strong> heat-pump rebates administered through Con Edison and other utilities — see <a className="text-accent hover:underline" href="https://cleanheat.ny.gov/" target="_blank" rel="noopener noreferrer">cleanheat.ny.gov</a>.</li>
            <li><strong>NYSERDA Comfort Home:</strong> insulation and weatherization incentives — see <a className="text-accent hover:underline" href="https://www.nyserda.ny.gov/" target="_blank" rel="noopener noreferrer">nyserda.ny.gov</a>.</li>
            <li><strong>Con Edison HVAC rebates:</strong> equipment-specific rebates for residential customers — see <a className="text-accent hover:underline" href="https://www.coned.com/" target="_blank" rel="noopener noreferrer">coned.com</a>.</li>
            <li><strong>Federal IRA Section 25C tax credit:</strong> up to $2,000 for qualifying heat pumps and up to $600 for qualifying high-efficiency furnaces or central AC — see <a className="text-accent hover:underline" href="https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit" target="_blank" rel="noopener noreferrer">irs.gov</a>.</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Service areas — Westchester County, NY</h2>
          <p className="text-sm text-muted-foreground mb-3">30 municipalities currently covered:</p>
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

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-extrabold mb-4">Sources and authoritative references</h2>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li>ENERGY STAR HVAC efficiency guidance — <a className="text-accent hover:underline" href="https://www.energystar.gov/products/heating_cooling" target="_blank" rel="noopener noreferrer">energystar.gov/products/heating_cooling</a></li>
            <li>U.S. Department of Energy heat-pump guide — <a className="text-accent hover:underline" href="https://www.energy.gov/energysaver/heat-pump-systems" target="_blank" rel="noopener noreferrer">energy.gov/energysaver/heat-pump-systems</a></li>
            <li>NYSERDA New York incentive programs — <a className="text-accent hover:underline" href="https://www.nyserda.ny.gov/" target="_blank" rel="noopener noreferrer">nyserda.ny.gov</a></li>
            <li>IRS Energy Efficient Home Improvement Credit (Section 25C) — <a className="text-accent hover:underline" href="https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit" target="_blank" rel="noopener noreferrer">irs.gov</a></li>
            <li>Bravo Mechanical Google Business Profile — <a className="text-accent hover:underline" href={SITE.social.google} target="_blank" rel="noopener noreferrer">Google Business Profile</a></li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">Last updated: May 2026.</p>
      </section>
    </Layout>
  );
};

export default CompanyFacts;
