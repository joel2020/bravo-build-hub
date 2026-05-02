import { Link } from "react-router-dom";
import { Phone, Siren, Clock, ShieldCheck, Wrench, Flame, Snowflake, CheckCircle2, MessageSquare } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE, TOWNS } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { LeadForm } from "@/components/LeadForm";
import { trackEmergencyCtaClick } from "@/lib/analytics";

const SITE_URL = "https://bravomechanicalny.com";

const symptoms = [
  { icon: Flame, title: "No Heat / Furnace Won't Start", text: "Pilot out, ignition failure, blower not kicking on, or thermostat unresponsive." },
  { icon: Snowflake, title: "Frozen or Burst Pipes Risk", text: "Indoor temps dropping fast — we prioritize jobs that risk pipe damage." },
  { icon: Wrench, title: "Boiler Leaking or Short-Cycling", text: "Water around the unit, banging sounds, or system turning on/off rapidly." },
  { icon: Siren, title: "Carbon Monoxide / Gas Smell", text: "Leave the building and call 911 first, then call us to diagnose and replace." },
];

const steps = [
  "Call or text — we answer 24/7, including nights, weekends, and holidays.",
  "Triage over the phone so you know what to expect on cost and timing.",
  "Licensed tech dispatched with common parts on the truck.",
  "Diagnosis, written estimate, and repair — most no-heat calls fixed same visit.",
];

const faqs = [
  {
    q: "How fast can you get to my house for emergency furnace repair?",
    a: "Most Westchester County calls are reached within 60–120 minutes during cold-weather events. Closer towns like Yonkers, Mount Vernon, New Rochelle, and White Plains are typically faster.",
  },
  {
    q: "Do you charge extra for nights, weekends, or holidays?",
    a: "We do have an after-hours dispatch fee that we disclose upfront before we roll the truck. No surprise charges — you'll know the number before we arrive.",
  },
  {
    q: "My furnace won't ignite — what should I check first?",
    a: "Confirm the thermostat is set to Heat and batteries are good, the furnace switch (looks like a light switch) is on, the gas valve is open, and the filter isn't clogged. If those are fine and it still won't fire, call us.",
  },
  {
    q: "Do you service boilers, furnaces, and heat pumps?",
    a: "Yes — gas and oil furnaces, hot-water and steam boilers, heat pumps, and ductless mini-splits. We carry common ignition, control, and pump parts on the truck.",
  },
  {
    q: "What towns do you cover for emergency HVAC?",
    a: "All of Westchester County, NY — including Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale, Rye, Harrison, Mamaroneck, Larchmont, Bronxville, Tarrytown, Ossining, Chappaqua, and surrounding areas.",
  },
  {
    q: "Should I replace or repair an older furnace that keeps failing?",
    a: "If your unit is 15+ years old and the repair is more than ~30% of replacement cost, replacement usually wins on reliability and efficiency. We'll give you both numbers so you can decide.",
  },
];

const EmergencyHVAC = () => {
  const smsHref = `sms:${SITE.phoneHref.replace("tel:", "")}`;
  const canonical = `${SITE_URL}/emergency-hvac-westchester`;

  useSeo({
    title: "Emergency HVAC & No Heat Repair in Westchester, NY | 24/7",
    description:
      "24/7 emergency furnace repair and no-heat service across Westchester County, NY. Licensed techs, fast dispatch, upfront pricing. Call (914) 361-9142.",
    canonical,
    type: "website",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "EmergencyService",
        name: `${SITE.name} — 24/7 Emergency HVAC`,
        url: canonical,
        telephone: SITE.phone,
        areaServed: TOWNS.map((t) => ({ "@type": "City", name: `${t}, NY` })),
        availableService: [
          { "@type": "Service", name: "Emergency Furnace Repair" },
          { "@type": "Service", name: "No Heat Repair" },
          { "@type": "Service", name: "Emergency Boiler Repair" },
          { "@type": "Service", name: "Emergency Heat Pump Repair" },
        ],
        hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
          { "@type": "ListItem", position: 2, name: "Emergency HVAC Westchester", item: canonical },
        ],
      },
    ],
  });

  return (
    <Layout>
      {/* Emergency Hero */}
      <section className="bg-destructive text-destructive-foreground border-b-4 border-accent">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <div className="inline-flex items-center gap-2 bg-destructive-foreground/10 border border-destructive-foreground/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <Siren className="h-3.5 w-3.5" /> 24/7 Emergency Dispatch
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl leading-tight">
            No Heat? Emergency Furnace Repair in Westchester, NY
          </h1>
          <p className="mt-4 text-lg text-destructive-foreground/90 max-w-2xl">
            Same-day, after-hours, weekend, and holiday service. Licensed, insured, and answering the phone right now.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <a href={SITE.phoneHref} onClick={() => trackEmergencyCtaClick("emergency_hero_call")}>
                <Phone className="h-4 w-4 mr-2" /> Call {SITE.phone}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-destructive-foreground text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive font-bold">
              <a href={smsHref}>
                <MessageSquare className="h-4 w-4 mr-2" /> Text Us Now
              </a>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-destructive-foreground/85">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> 24/7/365</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Licensed & Insured</span>
            <span className="inline-flex items-center gap-1.5"><Wrench className="h-4 w-4" /> Most no-heat calls fixed same visit</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Request emergency HVAC dispatch</h2>
          <p className="text-muted-foreground mb-6">Send your details and our team will follow up quickly.</p>
          <LeadForm source="contact_form" defaultService="Emergency HVAC repair" urgency="emergency" defaultMessage="Urgent no-heat or no-cool issue." />
        </div>
      </section>

      {/* Symptoms */}
      <section className="container mx-auto px-4 py-14 lg:py-20">
        <div className="max-w-2xl mb-10">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">When to call us</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Common HVAC emergencies we handle</h2>
          <p className="mt-3 text-muted-foreground">If you're seeing any of these, don't wait — small issues become burst pipes and replacements fast in Westchester winters.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {symptoms.map((s) => (
            <div key={s.title} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-md bg-destructive/10 text-destructive p-2.5">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{s.title}</h3>
                  <p className="text-muted-foreground mt-1.5">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <div className="max-w-2xl mb-10">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">What to expect</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">How an emergency call works</h2>
          </div>
          <ol className="grid md:grid-cols-2 gap-4">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-4 rounded-lg bg-card border border-border p-5">
                <div className="shrink-0 h-9 w-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">{i + 1}</div>
                <p className="text-foreground pt-1.5">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="container mx-auto px-4 py-14 lg:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">Why Westchester calls Bravo</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Local, licensed, and on the road tonight</h2>
            <p className="mt-4 text-muted-foreground">We're based in Westchester County and our techs live here too. That means real local response times — not a national call center routing your job somewhere across the state.</p>
            <ul className="mt-6 space-y-3">
              {[
                "Upfront pricing — no surprise after-hours fees",
                "Trucks stocked with common ignition, control, and pump parts",
                "Gas, oil, boilers, furnaces, heat pumps, mini-splits",
                "Repair-or-replace honest recommendation",
                "Fully licensed and insured in NY",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-bold text-foreground text-lg mb-4">Towns we cover for emergency service</h3>
            <div className="flex flex-wrap gap-2">
              {TOWNS.map((t) => (
                <span key={t} className="text-xs bg-secondary text-foreground px-2.5 py-1 rounded-full border border-border">{t}</span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Don't see your town? Call us — we cover all of Westchester County.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <div className="max-w-2xl mb-8">
            <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Emergency HVAC questions</h2>
          </div>
          <Accordion type="single" collapsible className="bg-card rounded-lg border border-border divide-y divide-border">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="px-5">
                <AccordionTrigger className="text-left font-bold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-destructive text-destructive-foreground">
        <div className="container mx-auto px-4 py-14 lg:py-20 text-center">
          <Siren className="h-10 w-10 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Heat out? Don't wait.</h2>
          <p className="text-destructive-foreground/85 max-w-2xl mx-auto mb-8">Pipes can freeze in hours. Call now and we'll get a licensed tech rolling.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <a href={SITE.phoneHref} onClick={() => trackEmergencyCtaClick("emergency_footer_call")}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-destructive-foreground text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive font-bold">
              <a href={smsHref}><MessageSquare className="h-4 w-4 mr-2" />Text Us</a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-destructive-foreground/80">
            Need a non-emergency estimate? <Link to="/contact" className="underline">Contact us here</Link>.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default EmergencyHVAC;
