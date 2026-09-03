import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Flame, Wrench, Wind, Snowflake, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { HIGH_INTENT_SERVICES } from "@/lib/highIntentServices";
import { getLocalServiceLinksForParent } from "@/generated/localServiceLinks";
import { approvedServiceAreaPlaces } from "@/lib/localPageModel";
import { useSeo } from "@/lib/seo";

const SITE_URL = "https://www.bravomechanicalny.com";

const services = [
  {
    icon: Flame,
    title: "HVAC Installation",
    desc: "New and replacement heating and cooling systems sized and engineered for your space.",
    tasks: ["Furnaces & boilers", "Central air conditioning", "Heat pumps & ductless mini-splits", "Ductwork design and installation", "Thermostat upgrades"],
    benefits: ["Manufacturer-approved equipment", "Clean, code-compliant installs", "Honest sizing — no oversold systems"],
  },
  {
    icon: Wrench,
    title: "HVAC Repair",
    desc: "Diagnostics and repair options for residential and light-commercial heating and cooling equipment.",
    tasks: ["No heat / no cool calls", "Refrigerant leaks", "Blower & motor issues", "Thermostat & control problems", "Emergency service"],
    benefits: ["Scheduling based on current availability", "Clear pricing before work begins", "Post-repair operating checks"],
  },
  {
    icon: CheckCircle2,
    title: "Preventive Maintenance",
    desc: "Seasonal maintenance that documents system condition and helps identify avoidable reliability risks.",
    tasks: ["Spring AC tune-ups", "Fall heating tune-ups", "Filter replacement", "System cleaning & inspection", "Annual service plans"],
    benefits: ["Documented system condition", "Earlier warning of wear", "Seasonal operating checks"],
  },
  {
    icon: Wind,
    title: "Indoor Air Quality",
    desc: "Filtration, humidity-control, ventilation, and purification options matched to the building and HVAC system.",
    tasks: ["Whole-home air purifiers", "Humidifiers & dehumidifiers", "HEPA & high-efficiency filtration", "Duct cleaning coordination", "Ventilation upgrades"],
    benefits: ["Options matched to the building", "Filtration and humidity evaluation", "Clear maintenance guidance"],
  },
  {
    icon: Home,
    title: "Residential HVAC",
    desc: "Whole-home heating and cooling solutions for single-family homes, condos, and multi-units.",
    tasks: ["System replacements", "Add-on cooling for older homes", "Zoning systems", "Energy-efficient upgrades", "Maintenance plans"],
    benefits: ["Room-by-room comfort review", "Equipment options explained", "Westchester-focused service"],
  },
  {
    icon: Building2,
    title: "Commercial HVAC",
    desc: "Reliable HVAC service for offices, retail, restaurants, and light-industrial buildings.",
    tasks: ["Rooftop units", "Split & packaged systems", "Service contracts", "Emergency response", "Preventive maintenance"],
    benefits: ["Operational priorities documented", "Written service recommendations", "Local service requests"],
  },
];

const Services = () => {
  const localServicePages = getLocalServiceLinksForParent("/services");
  useSeo({
    title: "HVAC Services in Westchester County, NY | Bravo Mechanical",
    description: "AC repair and installation, furnace and boiler repair, heat pumps, HVAC maintenance, and commercial HVAC for listed Westchester communities.",
    canonical: `${SITE.siteUrl}/services`,
  });

  useEffect(() => {
    const provider = {
      "@id": `${SITE_URL}/#localbusiness`,
    };

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      ],
    };

    const serviceLds = services.map((s) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${s.title} — Westchester County, NY`,
      serviceType: s.title,
      description: s.desc,
      provider,
      areaServed: approvedServiceAreaPlaces(),
      url: `${SITE_URL}/services#${s.title.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    const all = [breadcrumbLd, ...serviceLds];
    const scripts = all.map((data, i) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.jsonld = `services-${i}`;
      el.text = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });
    return () => scripts.forEach((s) => s.remove());
  }, []);

  return (
  <Layout>
    <PageHero
      eyebrow="Our Services"
      title="HVAC services for Westchester County"
      subtitle="Installation, repair, and maintenance for residential and commercial heating, cooling, and ventilation systems."
    />

    <section className="container mx-auto px-4 py-16 space-y-12">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-extrabold mb-3">High-intent local services in Westchester County</h2>
        <p className="text-muted-foreground mb-4">Explore dedicated local pages built for homeowners and property managers searching for specific HVAC services.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HIGH_INTENT_SERVICES.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`} className="border border-border rounded-md p-3 text-sm font-semibold hover:border-accent transition-colors">
              {service.h1}
            </Link>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-extrabold mb-3">Installation and repair in listed communities</h2>
        <p className="text-muted-foreground mb-4">Explore published installation and repair pages for individual service areas.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {localServicePages.map((page) => (
            <Link key={page.path} to={page.path} className="border border-border rounded-md p-3 text-sm font-semibold hover:border-accent transition-colors">
              {page.label}
            </Link>
          ))}
        </div>
      </div>
      {services.map((s, i) => (
        <article key={s.title} id={s.title.toLowerCase().replace(/\s+/g, "-")} className="grid lg:grid-cols-3 gap-8 items-start pb-12 border-b border-border last:border-0">
          <div className="lg:col-span-1">
            <div className="h-12 w-12 rounded-md bg-accent text-accent-foreground flex items-center justify-center mb-4">
              <s.icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">{s.title}</h2>
            <p className="text-muted-foreground">{s.desc}</p>
            <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Link to="/contact">Request {s.title}</Link>
            </Button>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">What we handle</h3>
              <ul className="space-y-2">
                {s.tasks.map((t) => (
                  <li key={t} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Why choose Bravo</h3>
              <ul className="space-y-2">
                {s.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}
    </section>

    <CTABand />
  </Layout>
  );
};

export default Services;
