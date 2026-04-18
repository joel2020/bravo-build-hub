import { CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";

const About = () => (
  <Layout>
    <PageHero
      eyebrow="About Us"
      title="A local HVAC contractor built on quality and trust"
      subtitle="Bravo Mechanical is a Westchester County HVAC contractor focused on dependable service, clear communication, and workmanship our customers can rely on."
    />

    <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold mb-3">Our Story</h2>
          <p className="text-muted-foreground">Bravo Mechanical was built on a simple idea: HVAC service should be straightforward. Show up on time, explain the problem clearly, do quality work, and stand behind it. That's how we've earned our reputation across Westchester County.</p>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold mb-3">Our Mission</h2>
          <p className="text-muted-foreground">Keep homes and businesses comfortable year-round with reliable heating, cooling, and ventilation service — backed by honest pricing and responsive support.</p>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold mb-3">What sets us apart</h2>
          <ul className="space-y-3">
            {[
              "Local to Westchester — fast response times across the county",
              "Licensed and insured HVAC technicians",
              "Clear, written estimates before work begins",
              "Quality installations and clean job sites",
              "Service for both residential and commercial customers",
            ].map((p) => (
              <li key={p} className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" /><span>{p}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="aspect-[4/3] rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-sm">Field/team photo placeholder</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs">Job site photo</div>
          <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs">Equipment photo</div>
        </div>
      </div>
    </section>

    <section className="bg-secondary border-y border-border">
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold mb-3">Licensing & Certifications</h2>
        <p className="text-muted-foreground max-w-2xl">Bravo Mechanical is a licensed and insured HVAC contractor. License numbers and certification details available on request.</p>
      </div>
    </section>

    <CTABand />
  </Layout>
);

export default About;
