import { Link } from "react-router-dom";
import { Phone, CheckCircle2, FileText, CalendarClock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";

const STEPS = [
  { icon: FileText, title: "Request a project-specific scope", text: "Equipment, labor, electrical, venting, controls, permits, and site conditions can change the project. Start with a written scope for the property." },
  { icon: CalendarClock, title: "Ask about current payment options", text: "Payment and financing availability can change. Confirm the options currently offered for the specific project before planning around them." },
  { icon: CheckCircle2, title: "Review written terms", text: "If third-party financing is available, review the provider, approval requirements, rate, fees, payment schedule, and expiration date in the lender's current documents." },
  { icon: ShieldCheck, title: "Approve the documented path", text: "Authorize work only after the scope, project price, payment terms, responsibilities, and schedule are documented and acceptable." },
];

const FAQS = [
  { q: "Is financing currently available?", a: "Current financing availability and terms are confirmed for each project. Bravo Mechanical does not publish a lender, rate, payment amount, or approval promise before current written program details are available." },
  { q: "How is a replacement price determined?", a: "The price depends on the building load, equipment configuration, distribution, electrical work, venting, controls, access, permits, and commissioning scope. Request a project-specific written proposal." },
  { q: "What payment methods are accepted?", a: "Confirm the currently accepted payment methods and payment schedule in the written proposal before authorizing work. Availability can change and may differ by project." },
];

const Financing = () => {
  useSeo({
    title: "HVAC Financing in Westchester County, NY | Bravo Mechanical",
    description: "Ask Bravo Mechanical about current HVAC payment and financing availability, then review project-specific scope, pricing, and written provider terms.",
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
        title="Review the Project Before Choosing a Payment Path"
        subtitle="Current payment and financing availability is confirmed per project. Review the written scope, price, provider, approval requirements, rates, fees, and schedule before deciding."
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
          No financing provider, rate, term, or approval outcome is promised on this page. If a current third-party program is offered for your project, the lender's written disclosures control eligibility, rates, fees, and repayment terms.
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
              <Link to="/contact">Request Project Options</Link>
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
