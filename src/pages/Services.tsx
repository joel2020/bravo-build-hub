import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Flame, Wrench, Wind, Snowflake, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";

const SITE_URL = "https://bravo-build-hub.lovable.app";

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
    desc: "Fast diagnostics and repair for any make or model heating and cooling equipment.",
    tasks: ["No heat / no cool calls", "Refrigerant leaks", "Blower & motor issues", "Thermostat & control problems", "Emergency service"],
    benefits: ["Same-day appointments when available", "Clear pricing before work begins", "Repairs done right the first time"],
  },
  {
    icon: CheckCircle2,
    title: "Preventive Maintenance",
    desc: "Seasonal tune-ups and service plans that extend equipment life and prevent breakdowns.",
    tasks: ["Spring AC tune-ups", "Fall heating tune-ups", "Filter replacement", "System cleaning & inspection", "Annual service plans"],
    benefits: ["Lower energy bills", "Fewer breakdowns", "Longer equipment life"],
  },
  {
    icon: Wind,
    title: "Indoor Air Quality",
    desc: "Cleaner, healthier indoor air with filtration, humidity control, and purification solutions.",
    tasks: ["Whole-home air purifiers", "Humidifiers & dehumidifiers", "HEPA & high-efficiency filtration", "Duct cleaning coordination", "Ventilation upgrades"],
    benefits: ["Better comfort year-round", "Allergy & dust reduction", "Healthier indoor environment"],
  },
  {
    icon: Home,
    title: "Residential HVAC",
    desc: "Whole-home heating and cooling solutions for single-family homes, condos, and multi-units.",
    tasks: ["System replacements", "Add-on cooling for older homes", "Zoning systems", "Energy-efficient upgrades", "Maintenance plans"],
    benefits: ["Comfort in every room", "Quiet, efficient equipment", "Trusted by Westchester homeowners"],
  },
  {
    icon: Building2,
    title: "Commercial HVAC",
    desc: "Reliable HVAC service for offices, retail, restaurants, and light-industrial buildings.",
    tasks: ["Rooftop units", "Split & packaged systems", "Service contracts", "Emergency response", "Preventive maintenance"],
    benefits: ["Minimized downtime", "Predictable service costs", "Responsive local support"],
  },
];

const Services = () => (
  <Layout>
    <PageHero
      eyebrow="Our Services"
      title="HVAC services for Westchester County"
      subtitle="Installation, repair, and maintenance for residential and commercial heating, cooling, and ventilation systems."
    />

    <section className="container mx-auto px-4 py-16 space-y-12">
      {services.map((s, i) => (
        <article key={s.title} id={s.title.toLowerCase().replace(/\s+/g, "-")} className="grid lg:grid-cols-3 gap-8 items-start pb-12 border-b border-border last:border-0">
          <div className="lg:col-span-1">
            <div className="h-12 w-12 rounded-md bg-accent text-accent-foreground flex items-center justify-center mb-4">
              <s.icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">{s.title}</h2>
            <p className="text-muted-foreground">{s.desc}</p>
            <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Link to="/contact">Request Service</Link>
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

export default Services;
