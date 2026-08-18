import { Link } from "react-router-dom";
import { Phone, CheckCircle2, FileText, CalendarClock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";

const STEPS = [
  { icon: FileText, title: "Get your written estimate", text: "Every project starts with a free written quote — equipment options, scope, and total price before any work begins." },
  { icon: CalendarClock, title: "Tell us your budget reality", text: "If paying in full doesn't fit right now, say so. We'll walk you through payment options and third-party financing programs available for qualified homeowners." },
  { icon: CheckCircle2, title: "Pick the path that fits", text: "Ask which payment and financing options are currently available for your project. Financing approval and terms are determined by the provider." },
  { icon: ShieldCheck, title: "We start the work", text: "Once you approve, we order equipment and schedule the install. The written price is locked before work begins — no surprises when the job is done." },
];

const FAQS = [
  { q: "Do you offer financing for HVAC replacement?", a: "Yes — financing for qualified homeowners is available through third-party lending partners for larger projects like boiler, furnace, AC, and heat pump replacements. Ask when you request your estimate and we'll walk you through the current options and terms." },
  { q: "How much does a new system cost in Westchester?", a: "Typical installed ranges: gas furnace $4,500–$9,000, gas boiler $7,000–$14,000, central AC $6,000–$12,000, cold-climate heat pump or whole-home ductless $12,000–$25,000 — depending on home size, ductwork, fuel type, and equipment tier. Your written estimate fixes the number before work starts." },
  { q: "What payment methods do you accept?", a: "Cash, check, Zelle, and major credit cards — plus third-party financing for qualifying projects. No payment is due until the work is agreed in writing." },
];

const Financing = () => {
  useSeo({
    title: "HVAC Financing in Westchester County, NY | Bravo Mechanical",
    description: "Spread the cost of a new boiler, furnace, AC, or heat pump. Financing options for qualified Westchester homeowners. Free written estimate first.",
    canonical: `${SITE.siteUrl}/financing`,
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
        eyebrow="Financing"
        title="A $12,000 Boiler Shouldn't Require $12,000 Today"
        subtitle="Financing options for qualified Westchester homeowners on heating and cooling replacements — with the written price fixed before any work begins."
      />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-lg p-6">
              <s.icon className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground max-w-3xl">
          Financing is provided by third-party lenders, subject to credit approval; terms, rates, and availability vary by program and applicant. We'll go over the current options during your estimate — no obligation either way.
        </p>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Financing questions, answered</h2>
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
              <Link to="/contact">Get My Free Written Estimate</Link>
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

export default Financing;
