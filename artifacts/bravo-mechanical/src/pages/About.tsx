import { CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";
import jobBoilerAfter from "@/assets/job-boiler-after.avif";
import jobMiniSplit from "@/assets/job-mini-split-exterior.webp";
import jobWaterHeater from "@/assets/job-water-heater.webp";

const serviceFocus = [
  "AC repair, AC installation, and no-cool troubleshooting",
  "Boiler repair, boiler replacement, and hydronic heating service",
  "Furnace repair, furnace installation, and seasonal heating tune-ups",
  "Heat pump and ductless mini-split installation for older homes and additions",
  "Preventive maintenance, indoor air quality, and light commercial HVAC support",
];

const customerExpectations = [
  "Clear communication before work begins",
  "Practical repair-versus-replace guidance",
  "Written estimates for approved project work",
  "Respectful work inside homes and businesses",
  "Local HVAC service across Westchester County",
];

const About = () => {
  useSeo({
    title: "About Bravo Mechanical | HVAC in Westchester NY",
    description: "Bravo Mechanical LLC provides HVAC repair, installation, and maintenance for homes and light-commercial properties in Westchester County, NY.",
    canonical: `${SITE.siteUrl}/about`,
  });

  return (
    <Layout>
      <PageHero
        eyebrow="About Bravo Mechanical"
        title="Local HVAC service built around clear answers and clean work"
        subtitle={`${SITE.legalName} serves Westchester County homeowners, property managers, and light-commercial customers with heating, cooling, repair, installation, and maintenance support.`}
        hideRightSlot
      />

      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold mb-3">Who we are</h2>
            <p className="text-muted-foreground leading-relaxed">
              {SITE.legalName} is a Westchester County HVAC company focused on practical diagnostics and straightforward recommendations. Customers call us when they need help with no-heat calls, AC problems, aging boilers, furnace issues, heat pump upgrades, ductless mini-splits, water heaters, and ongoing maintenance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-accent">HVAC</div>
              <div className="text-xs text-muted-foreground mt-1">Repair and installation</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-accent">Homes</div>
              <div className="text-xs text-muted-foreground mt-1">Residential support</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-accent">Local</div>
              <div className="text-xs text-muted-foreground mt-1">Light-commercial support</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-3">Why local experience matters</h2>
            <p className="text-muted-foreground leading-relaxed">
              Westchester homes are not all built the same. Many properties still rely on older steam or hot-water boiler systems, retrofit ductwork, finished basements, additions, and mixed heating/cooling setups. A good HVAC recommendation has to fit the building, the comfort problem, and the homeowner’s budget — not just the equipment catalog.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-3">What we work on</h2>
            <ul className="space-y-3">
              {serviceFocus.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-3">What customers can expect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our approach is simple: listen to the problem, inspect the system, explain what we found, and give clear next steps. When repair makes sense, we say so. When replacement should be considered, we explain why and provide options.
            </p>
            <ul className="space-y-3">
              {customerExpectations.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <img src={jobBoilerAfter} alt="Completed boiler installation in Westchester County by Bravo Mechanical" width={900} height={675} className="aspect-[4/3] w-full rounded-lg border border-border object-cover" loading="lazy" decoding="async" />
          <div className="grid grid-cols-2 gap-4">
            <img src={jobMiniSplit} alt="Ductless mini-split outdoor unit installed at a Westchester County home" width={600} height={600} className="aspect-square w-full rounded-lg border border-border object-cover" loading="lazy" decoding="async" />
            <img src={jobWaterHeater} alt="Water heater installation completed by Bravo Mechanical" width={600} height={600} className="aspect-square w-full rounded-lg border border-border object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Service area:</strong> {SITE.legalName} serves {SITE.area}. See published service-area pages for local details.
          </div>
        </div>
      </section>

      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold mb-3">Clear next steps</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tell us what your system is doing and we’ll help you understand the next step for repair, maintenance, or replacement planning.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold mb-3">Need HVAC help?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Call {SITE.phone} or request service online. For urgent no-heat, no-cooling, or equipment safety concerns, calling directly is the fastest way to reach the team.
            </p>
          </div>
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default About;
