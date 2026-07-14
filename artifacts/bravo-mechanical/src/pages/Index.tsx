
import { Link } from "react-router-dom";
import { Phone, Wrench, Snowflake, Flame, Wind, ShieldCheck, Clock, MapPin, Award, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layout } from "@/components/Layout";
import { CTABand } from "@/components/CTABand";
import { useSeo } from "@/lib/seo";

import { SITE, FEATURED_SERVICE_LINKS } from "@/lib/site";
import { NY_SYSTEMS } from "@/lib/nySystems";
import { getFeaturedGoogleReviews } from "@/lib/googleReviews";
import { trackRequestServiceClick } from "@/lib/analytics";
import heroTechnician from "@/assets/hero-technician.webp";
import jobMitsubishi from "@/assets/job-mitsubishi-install.webp";
import jobBoiler from "@/assets/job-boiler-install.webp";
import jobWaterHeater from "@/assets/job-water-heater.webp";
import jobOilTank from "@/assets/job-oil-tank.webp";
import jobRadiator from "@/assets/job-radiator-repair.webp";
import jobMiniSplit from "@/assets/job-mini-split-exterior.webp";
import jobExteriorWhite from "@/assets/job-exterior-white-house.webp";
import jobBoilerBefore from "@/assets/job-boiler-before.jpeg";
import jobBoilerAfter from "@/assets/job-boiler-after.jpeg";
import projectBoilerBefore from "@/assets/project-boiler-before.png";
import projectBoilerAfter from "@/assets/project-boiler-after.png";
import projectBurnerService from "@/assets/project-burner-service.png";
import projectBeckettBurner from "@/assets/project-beckett-burner.png";
import projectGasBoiler from "@/assets/project-gas-boiler.png";

const Index = () => {
  const featuredReviews = getFeaturedGoogleReviews(3);

  const homepageFaqs = [
    {
      q: "What is Bravo Mechanical?",
      a: "Bravo Mechanical LLC is a licensed and insured HVAC contractor based in Westchester County, NY. The company installs, repairs, and maintains furnaces, boilers, central air conditioning, heat pumps, and ductless mini-splits for homes and light-commercial properties across 30 Westchester towns, with 24/7 emergency dispatch and a 5.0-star Google rating.",
    },
    {
      q: "What areas does Bravo Mechanical serve?",
      a: "Bravo Mechanical serves all of Westchester County, NY, including Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale, Bronxville, Rye, Harrison, Mamaroneck, Larchmont, Tarrytown, Sleepy Hollow, Ossining, Peekskill, Mount Kisco, Chappaqua, Bedford, Katonah, Armonk, Hastings-on-Hudson, Dobbs Ferry, Irvington, Briarcliff Manor, Croton-on-Hudson, Yorktown, and Somers — 30 municipalities in total.",
    },
    {
      q: "Does Bravo Mechanical offer 24/7 emergency HVAC service?",
      a: "Yes. Bravo Mechanical offers 24/7 emergency HVAC dispatch in Westchester County, NY for no-heat, no-cool, and gas-leak situations. Call (914) 361-9142 to request emergency service. Response times depend on weather, call volume, technician availability, and location.",
    },
    {
      q: "How much does a new furnace, boiler, or AC system cost in Westchester County, NY?",
      a: "Installed HVAC pricing in Westchester County typically ranges from about $4,500 to $9,000 for a standard high-efficiency gas furnace, $7,000 to $14,000 for a gas boiler replacement, $6,000 to $12,000 for a central AC system, and $12,000 to $25,000 for a cold-climate heat pump or whole-home ductless mini-split system, depending on home size, ductwork condition, fuel type, and equipment tier. Bravo Mechanical provides a free written estimate before any installation begins.",
    },
    {
      q: "Should I repair or replace an HVAC system?",
      a: "A common rule of thumb used by Bravo Mechanical is the 50% rule: if the repair cost exceeds 50% of replacement cost, or if the system is older than 12 to 15 years and breaking down repeatedly, replacement is usually more cost-effective. ENERGY STAR guidance recommends replacing furnaces older than 15 years and central AC older than 10 years for meaningful efficiency gains.",
    },
    {
      q: "What HVAC brands does Bravo Mechanical install?",
      a: "Bravo Mechanical is a brand-agnostic HVAC contractor and installs Carrier, Trane, Rheem, Mitsubishi, Daikin, Bosch, Navien, Bradford White, AO Smith, Weil-McLain, and other major manufacturers. Recommendations are based on home size, ductwork, fuel type, and budget — not on a single-brand contract.",
    },
    {
      q: "Is Bravo Mechanical licensed and insured?",
      a: "Yes. Bravo Mechanical LLC is a fully licensed and insured HVAC contractor authorized to perform heating, cooling, and gas-fired equipment work in Westchester County, NY. Proof of insurance is provided on request.",
    },
    {
      q: "Does Bravo Mechanical service both residential and commercial properties?",
      a: "Yes. Bravo Mechanical works with single-family homeowners, multi-family property managers, and light-commercial customers (offices, retail, restaurants, mixed-use buildings) across Westchester County, NY.",
    },
    {
      q: "How do I contact Bravo Mechanical?",
      a: "Call Bravo Mechanical at (914) 361-9142, email info@bravomechanicalny.com, or request an estimate at https://bravomechanicalny.com/contact. The company is open 24 hours a day, 7 days a week for emergency dispatch.",
    },
  ];

  useSeo({
    title: "HVAC Contractor Westchester County, NY | Bravo Mechanical",
    description: "Bravo Mechanical is a 5-star, licensed and insured HVAC contractor in Westchester County, NY for AC repair, AC installation, furnace and boiler repair, heat pumps, and 24/7 emergency service across 30 towns.",
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
                <Link to="/contact" onClick={() => trackRequestServiceClick("home_hero")}>Get a Free Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold border-foreground/20">
                <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
              </Button>
            </div>
            {/* Real trust strip: live Google rating + license + free-estimate price anchor. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={SITE.social.google}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="font-extrabold text-foreground">{SITE.rating.score.toFixed(1)}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Rated {SITE.rating.score.toFixed(1)} on {SITE.rating.source}
                </span>
              </a>
              <span className="hidden sm:inline text-border">|</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Licensed &amp; insured in NY
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                30+ yrs combined experience
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Free written estimates
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

      {/* Recent Westchester HVAC Work */}
      <section className="container mx-auto px-4 py-14 lg:py-16">
        <div className="max-w-2xl mb-8">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Project Proof</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">Recent Westchester HVAC Work</h2>
          <p className="mt-3 text-muted-foreground">Real field jobs completed by our team. Each project includes the issue found, what we fixed, and the outcome for the homeowner.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { img: projectBoilerAfter, alt: "Gas boiler replacement project in Westchester", town: "Yonkers", system: "Gas boiler replacement", problem: "Aging steam boiler with uneven heat and leaks.", solution: "Installed a Weil-McLain boiler with corrected near-boiler piping.", result: "More even heat and improved boiler performance." },
            { img: jobMiniSplit, alt: "Mini-split installation project in Westchester", town: "White Plains", system: "Mitsubishi mini-split", problem: "Second floor stayed hot each summer.", solution: "Added a two-zone ductless heat pump system.", result: "More consistent second-floor comfort." },
            { img: jobWaterHeater, alt: "Water heater replacement project in Westchester", town: "New Rochelle", system: "Water heater replacement", problem: "Old tank leaking and recovering slowly.", solution: "Replaced with a high-recovery AO Smith unit.", result: "More reliable hot water recovery for daily use." },
            { img: projectBurnerService, alt: "Oil burner service project in Westchester", town: "Mount Vernon", system: "Oil burner service", problem: "Hard starts and soot buildup.", solution: "Performed full burner cleaning, nozzle swap, and combustion test.", result: "Improved burner operation at startup." },
            { img: projectGasBoiler, alt: "Gas boiler maintenance project in Westchester", town: "Scarsdale", system: "Gas boiler maintenance", problem: "Short cycling and pressure fluctuation.", solution: "Serviced controls, adjusted expansion tank, and tuned combustion.", result: "More stable heat performance after service." },
          ].map((job) => (
            <article key={`${job.town}-${job.system}`} className="bg-card border border-border rounded-lg overflow-hidden">
              <img src={job.img} alt={job.alt} width={768} height={432} loading="lazy" decoding="async" className="w-full h-48 object-cover" />
              <div className="p-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{job.town} • {job.system}</div>
                <p className="text-sm"><strong>Problem:</strong> {job.problem}</p>
                <p className="text-sm"><strong>Solution:</strong> {job.solution}</p>
                <p className="text-sm text-muted-foreground"><strong>Result:</strong> {job.result}</p>
              </div>
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
            <p className="text-muted-foreground text-sm">We compare current repair cost, equipment age, projected efficiency gains, and reliability risk. You get a written recommendation with both repair and replacement options so you can choose the smartest long-term value.</p>
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
              <p className="text-muted-foreground">Bravo Mechanical is a licensed HVAC contractor serving Westchester County, NY with residential and commercial heating, cooling, ventilation, and indoor air quality services.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">What services does Bravo Mechanical provide?</h3>
              <p className="text-muted-foreground">The company provides AC repair and installation, boiler and furnace repair/installation, heat pump and mini-split installation, emergency HVAC service, maintenance plans, commercial HVAC, and indoor air quality solutions.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Where does Bravo Mechanical work?</h3>
              <p className="text-muted-foreground">Bravo Mechanical works throughout Westchester County including Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale, Rye, Harrison, and surrounding towns.</p>
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
                { icon: ShieldCheck, title: "Licensed & insured", text: "Fully licensed HVAC contractor with insured technicians." },
                { icon: Clock, title: "Responsive service", text: "Prompt scheduling with after-hours support when available." },
                { icon: Award, title: "Quality workmanship", text: "Clean installs, careful diagnostics, and equipment we'd put in our own homes." },
                { icon: MapPin, title: "Local to Westchester", text: "We live and work here, with service throughout Westchester County." },
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
            <img src={jobBoilerAfter} alt="New Weil-McLain gas boiler installed with clean copper piping" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobMitsubishi} alt="Mitsubishi ductless mini-split exterior unit install" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobWaterHeater} alt="AO Smith water heater installation" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobOilTank} alt="Roth oil tank piping and gauge work" width={900} height={1200} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
          </div>
        </div>
      </section>

      {/* Residential & Commercial */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Residential HVAC", img: jobBoiler, text: "Heating and cooling for single-family homes, condos, and multi-family properties across Westchester County.", points: ["Furnace & boiler service", "Central AC and ductless mini-splits", "Heat pumps & thermostats", "Air quality & humidity control"] },
            { title: "Commercial HVAC", img: jobRadiator, text: "Reliable HVAC service for offices, retail, restaurants, and light-industrial facilities.", points: ["Rooftop units", "Service contracts", "Preventive maintenance", "Emergency response"] },
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

      {/* Top NYS residential systems */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">NY Homeowner Guide</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">Top heating & AC installations for New York homes</h2>
          <p className="mt-3 text-muted-foreground">Westchester and the Hudson Valley see frigid winters and hot, humid summers. These are the systems we install most often — and what they're best suited for.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {NY_SYSTEMS.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-accent hover:shadow-md transition-all group"
            >
              <img src={s.card.img} alt={s.card.alt} width={960} height={600} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">{s.card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.card.desc}</p>
                <div className="text-xs font-semibold text-accent mt-auto">{s.card.best}</div>
                <div className="text-sm text-accent font-semibold mt-3">Learn more →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured work */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Featured Work</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">Recent installs and service jobs</h2>
        </div>

        {/* Before / After boiler replacement */}
        <div className="mb-10">
          <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Boiler replacement — before & after</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { src: jobBoilerBefore, label: "Before", alt: "Old gas boiler before replacement, with aged piping and wiring" },
              { src: jobBoilerAfter, label: "After", alt: "New Weil-McLain gas boiler installed with clean copper piping and updated venting" },
            ].map((p) => (
              <figure key={p.label} className="relative rounded-lg overflow-hidden border border-border">
                <img src={p.src} alt={p.alt} width={800} height={1000} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
                <figcaption className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">{p.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { src: jobMitsubishi, alt: "Mitsubishi ductless mini-split exterior unit install" },
            { src: jobBoiler, alt: "Roth oil tank and boiler installation" },
            { src: jobWaterHeater, alt: "AO Smith water heater installation" },
            { src: jobOilTank, alt: "Roth oil tank piping and gauge work" },
            { src: jobRadiator, alt: "Commercial radiator and copper piping repair" },
            { src: jobMiniSplit, alt: "Exterior heat pump install on residential home" },
            { src: heroTechnician, alt: "Outdoor AC condenser install on patio" },
            { src: jobExteriorWhite, alt: "Exterior service work on a white-sided home" },
          ].map((p, i) => (
            <img key={i} src={p.src} alt={p.alt} width={600} height={600} loading="lazy" decoding="async" className="aspect-square w-full object-cover rounded border border-border" />
          ))}
        </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="">
          <div className="max-w-2xl mb-10">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">What Customers Say</div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Trusted by Westchester homeowners and businesses</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredReviews.length > 0 ? (
              featuredReviews.map((review, i) => (
                <div key={`${review.reviewerName}-${i}`} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex gap-1 mb-3 text-accent">
                    {Array.from({ length: review.rating }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm mb-4">"{review.reviewText}"</p>
                  <div className="text-sm font-semibold">{review.reviewerName}</div>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Featured Google reviews will appear here once added to the verified reviews data file.</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/reviews" className="text-sm font-semibold text-accent hover:underline">Read all reviews →</Link>
            <a href={SITE.social.google} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent hover:underline">Leave a Google review →</a>
          </div>
        </div>
      </section>

      {/* FAQ — answer-first, fact-rich blocks tuned for AI search citation */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">HVAC questions Westchester homeowners ask</h2>
          <p className="text-muted-foreground mb-8">Direct, factual answers about pricing, brands, and emergency service in Westchester County, NY.</p>
          <Accordion type="single" collapsible className="w-full">
            {homepageFaqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="text-xs text-muted-foreground mt-6">
            Pricing ranges are typical Westchester County installed-equipment estimates and vary by home size, ductwork, fuel type, and equipment tier. Source: ENERGY STAR (energystar.gov).
          </p>
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default Index;
