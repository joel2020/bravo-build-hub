import { Phone, Mail, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { RebateEstimator } from "@/components/RebateEstimator";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick } from "@/lib/analytics";

const Contact = () => {
  useSeo({
    title: "Contact Bravo Mechanical | HVAC Contractor Westchester County, NY",
    description: "Request HVAC service in Westchester County, NY. Contact Bravo Mechanical for AC repair, furnace and boiler service, heat pump installation, and emergency HVAC support.",
    canonical: `${SITE.siteUrl}/contact`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Bravo Mechanical",
      url: `${SITE.siteUrl}/contact`,
      mainEntity: {
        "@type": "HVACBusiness",
        name: SITE.legalName,
        telephone: SITE.phone,
        email: SITE.email,
        areaServed: "Westchester County, NY",
      },
    },
  });

  return (
    <Layout>
    <PageHero
      eyebrow="Contact"
      title="Get in touch with Bravo Mechanical"
      subtitle="Call us, email us, or request an estimate online. We respond fast and we'll be straight with you."
    />

    <section className="container mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Phone</div>
              <a href={SITE.phoneHref} onClick={() => trackCallClick("contact_primary")} className="font-bold text-lg hover:text-accent">{SITE.phone}</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Email</div>
              <a href={SITE.emailHref} className="font-semibold hover:text-accent break-all">{SITE.email}</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Service Area</div>
              <div className="font-semibold">Westchester County, NY</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Hours</div>
              <ul className="text-sm space-y-0.5 mt-1">
                {SITE.hours.map((h) => (
                  <li key={h.day}><span className="font-semibold">{h.day}:</span> {h.time}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Emergency HVAC service</div>
              <p className="text-sm text-muted-foreground">No heat or no cooling? Call us directly at <a href={SITE.phoneHref} onClick={() => trackCallClick("contact_emergency")} className="font-semibold text-accent hover:underline">{SITE.phone}</a> for fastest response.</p>
            </div>
          </div>
        </div>

        <a href={SITE.social.google} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] border border-border rounded-lg overflow-hidden hover:border-accent transition-colors">
          <iframe
            title="Bravo Mechanical Google Business Profile Map"
            src="https://www.google.com/maps?q=Bravo+Mechanical+LLC+Westchester+County+NY&output=embed"
            loading="lazy"
            className="h-full w-full"
          />
        </a>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-2xl font-extrabold mb-2">Request an estimate</h2>
        <p className="text-muted-foreground mb-6">Tell us a bit about what you need and we'll get back to you quickly.</p>
        <LeadForm />
        <div className="mt-8">
          <RebateEstimator />
        </div>
      </div>
    </section>
  </Layout>
  );
};

export default Contact;
