import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { CITIES } from "@/lib/cities";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";

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
    description: "See all Westchester County service areas for Bravo Mechanical HVAC services, including White Plains, Yonkers, New Rochelle, Scarsdale, Rye, and more.",
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
        title="HVAC Service Throughout Westchester County, NY"
        subtitle="Bravo Mechanical serves residential and commercial customers in every town across Westchester County. Local technicians, fast response, dependable work."
      />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Towns we serve in Westchester County</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">From the Hudson River to the Long Island Sound — and from Yonkers up through Yorktown — we cover the full county. Click any town for local service details.</p>

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
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Don't see your town?</h2>
          <p className="text-muted-foreground mb-6">We cover all of Westchester County, NY. If you're not sure whether we service your address, just give us a call — we'll confirm right away.</p>
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
