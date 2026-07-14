import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import jobBoilerBefore from "@/assets/job-boiler-before.jpeg";
import jobBoilerAfter from "@/assets/job-boiler-after.jpeg";
import jobMitsubishi from "@/assets/job-mitsubishi-install.webp";
import jobWaterHeater from "@/assets/job-water-heater.webp";
import jobMiniSplit from "@/assets/job-mini-split-exterior.webp";
import jobGasFurnace from "@/assets/job-gas-furnace.jpg";
import jobRadiator from "@/assets/job-radiator-repair.webp";
import jobExteriorWhite from "@/assets/job-exterior-white-house.webp";

// Baseline gallery of real completed jobs. New photos flagged "Show on
// website" in the CRM appear above these automatically.
const FEATURED_JOBS = [
  { src: jobBoilerAfter, caption: "High-efficiency gas boiler replacement — Westchester County", tag: "Boiler" },
  { src: jobBoilerBefore, caption: "The 25-year-old boiler it replaced (before)", tag: "Boiler" },
  { src: jobMitsubishi, caption: "Mitsubishi ductless mini-split installation", tag: "Mini-Split" },
  { src: jobMiniSplit, caption: "Cold-climate heat pump condenser install", tag: "Heat Pump" },
  { src: jobGasFurnace, caption: "95%+ AFUE gas furnace installation", tag: "Furnace" },
  { src: jobWaterHeater, caption: "Water heater replacement with code-compliant piping", tag: "Water Heater" },
  { src: jobRadiator, caption: "Hydronic radiator system service", tag: "Boiler" },
  { src: jobExteriorWhite, caption: "Clean exterior line-set routing on a mini-split retrofit", tag: "Mini-Split" },
];

type CrmPhoto = { id: string; public_url: string | null; public_caption: string | null; created_at: string };

const Projects = () => {
  const [crmPhotos, setCrmPhotos] = useState<CrmPhoto[]>([]);

  useEffect(() => {
    // RLS only exposes photos explicitly published from the CRM.
    supabase
      .from("job_photos")
      .select("id, public_url, public_caption, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => setCrmPhotos((data as CrmPhoto[] | null)?.filter((p) => p.public_url) ?? []));
  }, []);

  useSeo({
    title: "Recent HVAC Projects in Westchester County, NY | Bravo Mechanical",
    description: "Real photos from recent Bravo Mechanical jobs across Westchester County: boiler replacements, mini-split installs, furnaces, heat pumps, and water heaters — before and after.",
    canonical: `${SITE.siteUrl}/projects`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE.siteUrl}/projects` },
        ],
      },
    ],
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Our Work"
        title="Recent projects across Westchester County"
        subtitle="Real jobs by our own technicians — no stock photos. Boilers, furnaces, mini-splits, heat pumps, and water heaters, installed clean and to code."
      />

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {crmPhotos.map((p) => (
            <figure key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={p.public_url!} alt={p.public_caption || "Completed HVAC job by Bravo Mechanical"} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              {p.public_caption && <figcaption className="p-3 text-sm font-semibold">{p.public_caption}</figcaption>}
            </figure>
          ))}
          {FEATURED_JOBS.map((p) => (
            <figure key={p.caption} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={p.src} alt={p.caption} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="flex items-start justify-between gap-2 p-3">
                <span className="text-sm font-semibold">{p.caption}</span>
                <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">{p.tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-accent/30 bg-accent/10 p-6 text-center">
          <h2 className="text-xl font-extrabold mb-1">Want your project here next?</h2>
          <p className="text-sm text-muted-foreground mb-4">Free written estimate first — the price is fixed before any work begins.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/book" className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90">Book Online</Link>
            <a href={SITE.phoneHref} className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-bold hover:border-accent">Call {SITE.phone}</a>
          </div>
        </div>
      </section>

      <CTABand />
    </Layout>
  );
};

export default Projects;
