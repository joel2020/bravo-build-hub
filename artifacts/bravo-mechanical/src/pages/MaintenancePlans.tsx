import { Link } from "react-router-dom";
import { Phone, CheckCircle2, CalendarClock, Wrench, BadgePercent, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";

const INCLUDED = [
  { icon: CalendarClock, title: "Current availability", text: "Ask whether a maintenance plan or one-time maintenance visit is currently offered for your property type and equipment." },
  { icon: Bell, title: "Visit frequency and scope", text: "Confirm the number of visits, included equipment, inspection and cleaning tasks, records provided, exclusions, and renewal terms." },
  { icon: BadgePercent, title: "Scheduling and repair terms", text: "Ask whether scheduling priority, repair discounts, diagnostic charges, after-hours rates, or other benefits apply. Treat only the written plan terms as authoritative." },
  { icon: Wrench, title: "Warranty documentation", text: "Manufacturer warranty requirements vary by product and contract. Review the applicable warranty and confirm which maintenance records the service visit will provide." },
];

const FAQS = [
  { q: "What does a maintenance plan cost?", a: "Plan availability, visit frequency, included tasks, scheduling terms, and pricing are confirmed in writing before enrollment. The scope can vary by equipment count, system type, access, and property type." },
  { q: "What's included in a maintenance visit?", a: "The written scope should identify the equipment covered, inspection and cleaning tasks, measurements, records, exclusions, and any work that requires separate approval." },
  { q: "Are rental or multifamily properties eligible?", a: "Eligibility and scope are confirmed for the specific property. Provide the equipment count, access requirements, responsible contact, and any tenant-notice constraints when requesting options." },
  { q: "Does maintenance affect a warranty?", a: "Warranty terms differ by manufacturer, model, installer agreement, and claim. Review the applicable documents and keep the service records they require; this page does not interpret or guarantee warranty coverage." },
];

const MaintenancePlans = () => {
  useSeo({
    title: "HVAC Maintenance Plans in Westchester County, NY | Bravo Mechanical",
    description: "HVAC maintenance options for Westchester homes and rentals, with project-specific visit scope, scheduling, and written service records.",
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
        title="Maintenance Options Built Around Your Equipment"
        subtitle="Ask about current plan or one-time visit availability, then review the written visit scope, scheduling terms, records, exclusions, and pricing before enrolling."
      />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8">What to confirm before enrolling</h2>
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
            One condo mini-split and a three-family building with separate boilers require different scopes. Share the equipment and property details so availability, responsibilities, and written terms can be confirmed for the actual systems.
          </p>
        </div>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Maintenance questions, answered</h2>
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
              <Link to="/contact">Request Maintenance Options</Link>
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
