import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { TOWNS, SITE } from "@/lib/site";

const ServiceAreas = () => (
  <Layout>
    <PageHero
      eyebrow="Service Areas"
      title="HVAC Service Throughout Westchester County, NY"
      subtitle="Bravo Mechanical serves residential and commercial customers in every town across Westchester County. Local technicians, fast response, dependable work."
    />

    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl font-extrabold mb-2">Towns we serve in Westchester County</h2>
      <p className="text-muted-foreground mb-8 max-w-2xl">From the Hudson River to the Long Island Sound — and from Yonkers up through Yorktown — we cover the full county.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {TOWNS.map((town) => (
          <div key={town} className="flex items-center gap-2 p-3 bg-card border border-border rounded-md">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span className="font-semibold text-sm">{town}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-secondary border-y border-border">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
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

export default ServiceAreas;
