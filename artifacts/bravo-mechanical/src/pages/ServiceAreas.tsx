import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { CITIES } from "@/lib/cities";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { APPROVED_SERVICE_AREAS } from "@/lib/localPageModel";

const REGION_ORDER = [
  "Lower Westchester",
  "Sound Shore",
  "Rivertowns",
  "Central Westchester",
  "Northern Westchester",
] as const;

const ServiceAreas = () => {
  useSeo({
    title: "HVAC Service Areas | Westchester County, NY | Bravo Mechanical",
    description: `See Bravo Mechanical's ${APPROVED_SERVICE_AREAS.length} listed Westchester County service areas, including White Plains, Yonkers, New Rochelle, Scarsdale, and Rye.`,
    canonical: `${SITE.siteUrl}/service-areas`,
  });

  const grouped = REGION_ORDER.map((region) => ({
    region,
    cities: CITIES.filter((c) => c.region === region),
  })).filter((g) => g.cities.length > 0);

  return (
    <Layout>
      <PageHero
        eyebrow="Service Areas"
        title={`HVAC Service in ${APPROVED_SERVICE_AREAS.length} Westchester Communities`}
        subtitle="Bravo Mechanical accepts residential and light-commercial HVAC requests in the communities listed below. Call to confirm availability for your address."
      />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Communities we serve in Westchester County</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">The published service-area list includes 34 communities from the Hudson River to the Sound and from lower to northern Westchester. Select a community for local service details.</p>

        <div className="space-y-10">
          {grouped.map((g) => (
            <div key={g.region}>
              <h3 className="text-lg font-extrabold mb-4 text-accent uppercase tracking-wider text-sm">{g.region}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {g.cities.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/service-areas/${c.slug}`}
                    className="flex items-center gap-2 p-3 bg-card border border-border rounded-md hover:border-accent hover:bg-accent/5 transition-colors group"
                  >
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-semibold text-sm group-hover:text-accent">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Don't see your community?</h2>
          <p className="text-muted-foreground mb-6">Our published service area is the 34 communities listed above. Call before scheduling if you need us to confirm availability for another address.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"><Link to="/contact">Request an Estimate</Link></Button>
            <Button asChild variant="outline" className="font-semibold"><a href={SITE.phoneHref}>Call {SITE.phone}</a></Button>
          </div>
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default ServiceAreas;
