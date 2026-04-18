import { Link } from "react-router-dom";
import { Phone, Wrench, Snowflake, Flame, Wind, ShieldCheck, Clock, MapPin, Award, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layout } from "@/components/Layout";
import { CTABand } from "@/components/CTABand";
import { RebateEstimator } from "@/components/RebateEstimator";
import { SITE, SERVICES } from "@/lib/site";
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

const Index = () => {
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
              Reliable HVAC Service You Can Count On
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Bravo Mechanical delivers dependable heating, cooling, and ventilation service for homes and businesses across Westchester County, NY.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link to="/contact">Request an Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold border-foreground/20">
                <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Licensed & insured</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Free estimates</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Local techs</span>
            </div>
            <a href={SITE.social.google} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 bg-white dark:bg-card border border-border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">5.0</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">on Google</span>
            </a>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border shadow-lg">
            <img
              src={heroTechnician}
              alt="Bravo Mechanical HVAC technician servicing an outdoor AC condenser unit at a Westchester County home"
              width={1280}
              height={960}
              className="h-full w-full object-cover"
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

      {/* Services */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Our Services</div>
          <h2 className="text-3xl md:text-4xl font-extrabold">HVAC services for Westchester homes and businesses</h2>
          <p className="mt-3 text-muted-foreground">From emergency repairs to full system installations, Bravo Mechanical handles every part of your heating, cooling, and ventilation needs.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div key={s.slug} className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
              <Link to="/services" className="text-accent font-semibold text-sm hover:underline">Learn more →</Link>
            </div>
          ))}
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
                { icon: Clock, title: "Responsive service", text: "Same-day appointments and 24/7 emergency response when you need it." },
                { icon: Award, title: "Quality workmanship", text: "Clean installs, careful diagnostics, and equipment we'd put in our own homes." },
                { icon: MapPin, title: "Local to Westchester", text: "We live and work here — fast arrival times across the county." },
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
            <img src={jobBoilerAfter} alt="New Weil-McLain gas boiler installed with clean copper piping" loading="lazy" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobMitsubishi} alt="Mitsubishi ductless mini-split exterior unit install" loading="lazy" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobWaterHeater} alt="AO Smith water heater installation" loading="lazy" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
            <img src={jobOilTank} alt="Roth oil tank piping and gauge work" loading="lazy" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />
          </div>
        </div>
      </section>

      {/* Residential & Commercial */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Residential HVAC", img: jobMitsubishi, text: "Heating and cooling for single-family homes, condos, and multi-family properties across Westchester County.", points: ["Furnace & boiler service", "Central AC and ductless mini-splits", "Heat pumps & thermostats", "Air quality & humidity control"] },
            { title: "Commercial HVAC", img: jobRadiator, text: "Reliable HVAC service for offices, retail, restaurants, and light-industrial facilities.", points: ["Rooftop units", "Service contracts", "Preventive maintenance", "Emergency response"] },
          ].map((c) => (
            <div key={c.title} className="bg-card border border-border rounded-lg overflow-hidden">
              <img src={c.img} alt={c.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{c.text}</p>
                <ul className="space-y-2 mb-5">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{p}</li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="font-semibold"><Link to="/contact">Request Service</Link></Button>
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
              <img src={s.card.img} alt={s.card.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">{s.card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.card.desc}</p>
                <div className="text-xs font-semibold text-accent mt-auto">{s.card.best}</div>
                <div className="text-sm text-accent font-semibold mt-3">Learn more →</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <RebateEstimator />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Programs covered: NYSERDA Clean Heat, NYS Comfort Home, federal Inflation Reduction Act (25C) tax credits, and Con Edison utility rebates.
        </p>
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
                <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
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
            <img key={i} src={p.src} alt={p.alt} loading="lazy" className="aspect-square w-full object-cover rounded border border-border" />
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
            {[
              { q: "Showed up on time, diagnosed the problem fast, and had our AC running the same day. Professional from start to finish.", a: "Sarah M., Scarsdale" },
              { q: "Bravo installed a new furnace for us last fall. Clean work, fair price, and the system runs great.", a: "Mike R., White Plains" },
              { q: "Reliable for our restaurant — they keep our rooftop units running and respond quickly when we need them.", a: "Anthony D., Yonkers" },
            ].map((t, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-1 mb-3 text-accent">
                  {Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm mb-4">"{t.q}"</p>
                <div className="text-sm font-semibold">{t.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What areas does Bravo Mechanical serve?", a: "We serve all of Westchester County, NY — from Yonkers and New Rochelle north through Tarrytown, White Plains, Mount Kisco, Bedford, Yorktown, and surrounding towns." },
              { q: "Do you offer free estimates?", a: "Yes. Estimates for installations and project work are free. Call us or request one online." },
              { q: "Do you provide emergency HVAC service?", a: "Yes — we respond to heating and cooling emergencies. Call our main line and we'll get a tech to you as quickly as possible." },
              { q: "Are you licensed and insured?", a: "Yes, Bravo Mechanical is a fully licensed and insured HVAC contractor." },
              { q: "Do you service both residential and commercial properties?", a: "Yes. We work with homeowners, property managers, and commercial customers across Westchester County." },
            ].map((f, i) => (
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
