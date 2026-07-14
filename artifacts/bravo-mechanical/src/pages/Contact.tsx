import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick } from "@/lib/analytics";

const trustBullets = [
  "Serving Westchester County, NY",
  "AC, furnace, boiler, heat pump, and mini-split service",
  "Residential and light commercial HVAC",
  "Written estimates for approved project work",
  "Emergency HVAC support available by phone",
];

const Contact = () => {
  useSeo({
    title: "Contact Bravo Mechanical | HVAC Contractor Westchester County, NY",
    description: "Request HVAC service in Westchester County, NY. Contact Bravo Mechanical for AC repair, furnace and boiler service, heat pump installation, mini-splits, maintenance, and emergency HVAC support.",
    canonical: `${SITE.siteUrl}/contact`,
    jsonLd: [
      {
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
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE.siteUrl}/contact` },
        ],
      },
    ],
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Contact Bravo Mechanical"
        title="Request HVAC service in Westchester County"
        subtitle="Call for urgent heating or cooling issues, or send a service request for repairs, replacements, maintenance, and installation estimates."
      />

      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
        {/* On mobile the form must come first — it's the primary conversion
            element and shouldn't sit below the hours/map blocks. */}
        <div className="order-2 lg:order-none lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Call for fastest response</div>
                <a href={SITE.phoneHref} onClick={() => trackCallClick("contact_primary")} className="font-bold text-lg hover:text-accent">{SITE.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Text us — fastest for photos</div>
                <a href={SITE.smsHref} className="font-bold text-lg hover:text-accent">{SITE.smsPhone}</a>
                <div className="text-sm text-muted-foreground">Snap a photo of the unit or the problem and text it — we'll reply fast.</div>
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
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Address</div>
                <div className="font-semibold">{SITE.address.full}</div>
                <div className="text-sm text-muted-foreground">Serving all of Westchester County, NY</div>
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
                <p className="text-sm text-muted-foreground">
                  No heat, no cooling, water around equipment, burning smell, or system shutdown? Call <a href={SITE.phoneHref} onClick={() => trackCallClick("contact_emergency")} className="font-semibold text-accent hover:underline">{SITE.phone}</a>. Emergency response depends on technician availability, weather, call volume, and location, but phone calls are the fastest way to reach us for urgent service.
                </p>
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

        <div className="order-1 lg:order-none lg:col-span-2">
          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-bold">Prefer to skip the phone tag?</div>
              <div className="text-sm text-muted-foreground">Pick a day and time window online — we confirm by text.</div>
            </div>
            <Link to="/book" className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90 shrink-0">Book Online →</Link>
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Request service or an estimate</h2>
          <p className="text-muted-foreground mb-4">
            Tell us what is happening with your heating or cooling system and we will follow up with the next available service window. After you submit the form, our team reviews your request, confirms the property location, asks any needed follow-up questions, and helps schedule the appropriate service or estimate visit.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {trustBullets.map((item) => (
              <div key={item} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <LeadForm />
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
