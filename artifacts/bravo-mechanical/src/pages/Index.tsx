
import { Link } from "react-router-dom";
import { Phone, Snowflake, Flame, Wind, Clock, MapPin, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layout } from "@/components/Layout";
import { CTABand } from "@/components/CTABand";
import { useSeo } from "@/lib/seo";

import { SITE, FEATURED_SERVICE_LINKS } from "@/lib/site";
import { trackRequestServiceClick } from "@/lib/analytics";
import heroTechnician from "@/assets/hero-technician.webp";
import jobMitsubishi from "@/assets/job-mitsubishi-install.webp";
import jobBoiler from "@/assets/job-boiler-install.webp";
import jobWaterHeater from "@/assets/job-water-heater.webp";
import jobOilTank from "@/assets/job-oil-tank.webp";
import jobRadiator from "@/assets/job-radiator-repair.webp";
import jobMiniSplit from "@/assets/job-mini-split-exterior.webp";
import jobExteriorWhite from "@/assets/job-exterior-white-house.webp";
import jobBoilerBefore from "@/assets/job-boiler-before.avif";
import jobBoilerAfter from "@/assets/job-boiler-after.avif";
import projectBoilerAfter from "@/assets/project-boiler-after.webp";
import projectBurnerService from "@/assets/project-burner-service.avif";
import projectGasBoiler from "@/assets/project-gas-boiler.avif";

const Index = () => {
  const homepageFaqs = [
    {
      q: "What is Bravo Mechanical?",
      a: `${SITE.legalName} provides HVAC repair, installation, emergency dispatch, and maintenance for homes and light-commercial properties in ${SITE.area}.`,
    },
    {
      q: "What areas does Bravo Mechanical serve?",
      a: `Bravo Mechanical serves ${SITE.area}. See the published service-area pages for local service information.`,
    },
    {
      q: "How do I request urgent HVAC help?",
      a: `For urgent heating or cooling concerns, call ${SITE.phone} to request the next available response window. For a gas smell or immediate safety hazard, contact the appropriate emergency utility or service first.`,
    },
    {
      q: "Should I repair or replace an HVAC system?",
      a: "Repair-versus-replacement planning depends on the system condition, the problem found, and the property’s needs. Request service to discuss the next practical step.",
    },
    {
      q: "Does Bravo Mechanical service both residential and commercial properties?",
      a: `Bravo Mechanical supports homes, property managers, and light-commercial customers in ${SITE.area}.`,
    },
    {
      q: "How do I contact Bravo Mechanical?",
      a: `Call ${SITE.phone}, email ${SITE.email}, or request service at ${SITE.siteUrl}/contact.`,
    },
  ];

  useSeo({
    title: "HVAC Contractor Westchester County, NY | Bravo Mechanical",
    description: "HVAC repair, installation, emergency service requests, and maintenance for homes and light-commercial properties in Westchester County, NY.",
    canonical: `${SITE.siteUrl}/`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: homepageFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  // Homepage LocalBusiness + AggregateRating JSON-LD lives in static index.html
  // so it's visible to all crawlers without JS rendering.

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-sm mb-4">
              <MapPin className="h-4 w-4" /> Serving Westchester County, NY
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.05]">
              Heating and Cooling Help from a Local Westchester Team
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              From no-cool calls to boiler and heat pump projects, we focus on clear communication, careful workmanship, and practical options for your home or business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link to="/contact" onClick={() => trackRequestServiceClick("home_hero")}>Request Service</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold border-foreground/20">
                <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                {SITE.area}
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Homes and light-commercial properties
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Request service online
              </span>
            </div>
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Local HVAC service in</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Yonkers", slug: "yonkers" },
                  { name: "White Plains", slug: "white-plains" },
                  { name: "New Rochelle", slug: "new-rochelle" },
                  { name: "Mount Vernon", slug: "mount-vernon" },
                  { name: "Scarsdale", slug: "scarsdale" },
                ].map((c) => (
                  <Link
                    key={c.slug}
                    to={`/service-areas/${c.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold bg-card border border-border rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {c.name}
                  </Link>
                ))}
                <Link
                  to="/service-areas"
                  className="inline-flex items-center text-sm font-semibold text-accent px-2 py-1.5 hover:underline"
                >
                  View all →
                </Link>
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border shadow-lg">
            <img
              src={heroTechnician}
              alt="Bravo Mechanical HVAC technician servicing an outdoor AC condenser unit at a Westchester County home"
              width={1280}
              height={960}
              fetchPriority="high" className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Flame, label: "Heating" },
            { icon: Snowflake, label: "Cooling" },
            { icon: Wind, label: "Ventilation" },
          ].map((i) => (
            <div key={i.label} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <i.icon className="h-6 w-6" />
              <span className="font-bold uppercase tracking-wider text-sm sm:text-base">{i.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Equipment photos */}
      <section className="container mx-auto px-4 py-14 lg:py-16">
        <div className="max-w-2xl mb-8">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Equipment photos</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">Heating and cooling equipment</h2>
          <p className="mt-3 text-muted-foreground">Examples of heating and cooling equipment.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { img: projectBoilerAfter, alt: "Boiler equipment" },
            { img: jobMiniSplit, alt: "Ductless HVAC equipment" },
            { img: jobWaterHeater, alt: "Water-heating equipment" },
            { img: projectBurnerService, alt: "Heating equipment" },
            { img: projectGasBoiler, alt: "Boiler equipment" },
          ].map((job, index) => (
            <article key={index} className="bg-card border border-border rounded-lg overflow-hidden">
              <img src={job.img} alt={job.alt} width={768} height={432} loading="lazy" decoding="async" className="w-full h-48 object-cover" />
            </article>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Our Services</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">HVAC services for Westchester homes and businesses</h2>
          <p className="mt-3 text-muted-foreground">From emergency repairs to full system installations, Bravo Mechanical handles every part of your heating, cooling, and ventilation needs.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_SERVICE_LINKS.map((s) => (
            <div key={s.path} className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
              <Link to={s.path} className="text-accent font-semibold text-sm hover:underline">Learn more →</Link>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/services" className="text-accent font-semibold hover:underline">View all 12 services →</Link>
        </div>
      </section>



      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-extrabold mb-3">Services We're Known For in Westchester County</h2>
            <ul className="space-y-2 text-sm">
              {["AC repair and emergency no-cool calls", "Boiler and furnace heating repairs", "Heat pump and mini-split installations", "HVAC maintenance plans and tune-ups", "Commercial HVAC service contracts"].map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-extrabold mb-3">Repair vs Replace: How we help you decide</h2>
            <p className="text-muted-foreground text-sm">Repair-versus-replacement planning starts with the system condition, the problem found, and the property’s needs.</p>
            <Link to="/contact" className="inline-block mt-4 text-accent font-semibold hover:underline">Get a repair vs replace assessment →</Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Quick answers for homeowners, buyers, and AI assistants</h2>
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="font-bold text-lg mb-1">Who is Bravo Mechanical?</h3>
              <p className="text-muted-foreground">{SITE.legalName} provides heating, cooling, repair, installation, maintenance, and indoor-air-quality support for homes and light-commercial properties in {SITE.area}.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">What services does Bravo Mechanical provide?</h3>
              <p className="text-muted-foreground">The company provides AC repair and installation, boiler and furnace repair/installation, heat pump and mini-split installation, emergency HVAC service, maintenance plans, commercial HVAC, and indoor air quality solutions.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Where does Bravo Mechanical work?</h3>
              <p className="text-muted-foreground">Bravo Mechanical serves {SITE.area}. See the published service-area pages for local service information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Why Bravo Mechanical</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Honest work. Straight answers. Done right.</h2>
            <ul className="space-y-5">
              {[
                { icon: Clock, title: "Service requests", text: "Tell us about the heating or cooling concern you need help with." },
                { icon: Award, title: "Quality workmanship", text: "Clean installs, careful diagnostics, and equipment we'd put in our own homes." },
                { icon: MapPin, title: "Westchester service area", text: `Serving ${SITE.area}.` },
              ].map((b) => (
                <li key={b.title} className="flex gap-4">
                  <div className="h-10 w-10 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold">{b.title}</div>
                    <div className="text-sm text-muted-foreground">{b.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src={jobBoilerAfter} alt="Boiler equipment" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobMitsubishi} alt="Ductless HVAC equipment" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobWaterHeater} alt="Water-heating equipment" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobOilTank} alt="Heating equipment" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
          </div>
        </div>
      </section>

      {/* Residential & Commercial */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Residential HVAC", img: jobBoiler, text: "Heating and cooling for single-family homes, condos, and multi-family properties across Westchester County.", points: ["Furnace & boiler service", "Central AC and ductless mini-splits", "Heat pumps & thermostats", "Air quality & humidity control"] },
            { title: "Commercial HVAC", img: jobRadiator, text: "Reliable HVAC service for offices, retail, restaurants, and light-industrial facilities.", points: ["Rooftop units", "Service contracts", "Preventive maintenance", "Emergency response"], servicePath: "/services/commercial-hvac-westchester-county-ny" },
          ].map((c) => (
            <div key={c.title} className="bg-card border border-border rounded-lg overflow-hidden">
              <img src={c.img} alt={c.title} width={960} height={540} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{c.text}</p>
                <ul className="space-y-2 mb-5">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{p}</li>
                  ))}
                </ul>
                {c.servicePath && (
                  <Link to={c.servicePath} className="inline-block mb-3 text-accent font-semibold hover:underline">
                    Explore Commercial HVAC services →
                  </Link>
                )}
              <Button asChild variant="outline" className="font-semibold"><Link to="/contact" onClick={() => trackRequestServiceClick("home_services")}>Request Service</Link></Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-2xl mb-10">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Our Process</div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Simple, straightforward, no surprises</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", t: "Contact", d: "Call or request an estimate online." },
              { n: "02", t: "Inspect", d: "We assess the work and explain options." },
              { n: "03", t: "Quote", d: "Clear, written pricing — no surprises." },
              { n: "04", t: "Complete", d: "Quality work done on time, cleaned up after." },
            ].map((s) => (
              <div key={s.n} className="bg-card border border-border rounded-lg p-6">
                <div className="text-accent font-extrabold text-2xl mb-3">{s.n}</div>
                <div className="font-bold text-lg mb-1">{s.t}</div>
                <div className="text-sm text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment gallery */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Equipment photos</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">Heating and cooling equipment</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { src: jobBoilerBefore, alt: "Heating equipment" },
            { src: jobBoilerAfter, alt: "Boiler equipment" },
            { src: jobMitsubishi, alt: "Ductless HVAC equipment" },
            { src: jobBoiler, alt: "Heating equipment" },
            { src: jobWaterHeater, alt: "Water-heating equipment" },
            { src: jobOilTank, alt: "Heating equipment" },
            { src: jobRadiator, alt: "Commercial HVAC equipment" },
            { src: jobMiniSplit, alt: "Heat-pump equipment" },
            { src: heroTechnician, alt: "Outdoor HVAC equipment" },
            { src: jobExteriorWhite, alt: "HVAC equipment" },
          ].map((p, i) => (
            <img key={i} src={p.src} alt={p.alt} width={600} height={600} loading="lazy" decoding="async" className="aspect-square w-full object-cover rounded border border-border" />
          ))}
        </div>
        </div>
      </section>

      {/* FAQ — answer-first, fact-rich blocks tuned for AI search citation */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">HVAC questions Westchester homeowners ask</h2>
          <p className="text-muted-foreground mb-8">Direct answers about service, coverage, and how to contact the team in Westchester County, NY.</p>
          <Accordion type="single" collapsible className="w-full">
            {homepageFaqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default Index;
