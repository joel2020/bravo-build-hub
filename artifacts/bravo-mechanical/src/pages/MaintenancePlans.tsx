import { Link } from "react-router-dom";
import { Phone, CheckCircle2, CalendarClock, Wrench, BadgePercent, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";

const INCLUDED = [
  { icon: CalendarClock, title: "Two seasonal tune-ups a year", text: "A spring cooling tune-up and a fall heating tune-up — cleaning, safety checks, combustion analysis, airflow, drains, and controls, with a written condition report after each visit." },
  { icon: Bell, title: "Priority scheduling", text: "Plan members go to the front of the line — including during the January no-heat rush and the first 90°F week of summer, when everyone else waits days." },
  { icon: BadgePercent, title: "Preferred repair pricing", text: "Discounted repair labor for members, and no overtime premium on emergency calls. Small repairs found during tune-ups are often handled on the spot." },
  { icon: Wrench, title: "Equipment that lasts longer", text: "Maintained systems run more efficiently, fail less, and last years longer. Most manufacturer warranties also require documented annual maintenance — the plan keeps yours valid." },
];

const FAQS = [
  { q: "What does a maintenance plan cost?", a: "Plan pricing depends on how many systems you have (furnace, boiler, AC, heat pump, mini-splits) and property type. Call (914) 361-9142 or request a quote online — we'll price your exact setup in writing." },
  { q: "What's included in a tune-up visit?", a: "A full seasonal checklist: cleaning, filter review, electrical and safety checks, combustion analysis on gas equipment, refrigerant and airflow checks on cooling, condensate drains, and controls — finished with a written condition summary and photos of anything that needs attention." },
  { q: "Do plans cover rental or multifamily properties?", a: "Yes. Landlords are some of our best plan customers — scheduled maintenance prevents the middle-of-winter tenant no-heat call, and we keep per-unit service records for you." },
  { q: "Does maintenance really matter for warranties?", a: "Most manufacturers require proof of annual professional maintenance to honor parts warranties. Our plan visits produce dated service records that protect your claim." },
];

const MaintenancePlans = () => {
  useSeo({
    title: "HVAC Maintenance Plans in Westchester County, NY | Bravo Mechanical",
    description: "Annual HVAC service plans for Westchester homes and rentals: two seasonal tune-ups, priority scheduling, preferred repair pricing, and warranty-protecting service records.",
    canonical: `${SITE.siteUrl}/maintenance-plans`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Maintenance Plans"
        title="The Cheapest Repair Is the Breakdown That Never Happens"
        subtitle="An annual plan with two seasonal tune-ups, priority scheduling, and preferred repair pricing — for homes, rentals, and light commercial across Westchester County."
      />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8">What plan members get</h2>
        <div className="grid sm:grid-cols-2 gap-5 max-w-5xl">
          {INCLUDED.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-lg p-6">
              <s.icon className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-secondary border border-border rounded-lg p-6 max-w-5xl">
          <h3 className="font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-accent" /> Built around your equipment</h3>
          <p className="text-sm text-muted-foreground">
            One condo mini-split or a three-family building with separate boilers — plans are priced per system, in writing, before you commit. Tell us what you have and we'll quote it the same day.
          </p>
        </div>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Plan questions, answered</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-bold mb-2" data-faq-question>{f.q}</h3>
                <p className="text-sm text-muted-foreground" data-faq-answer>{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Link to="/contact">Get My Plan Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
            </Button>
          </div>
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default MaintenancePlans;
