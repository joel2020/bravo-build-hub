import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import jobBoilerBefore from "@/assets/job-boiler-before.avif";
import jobBoilerAfter from "@/assets/job-boiler-after.avif";
import jobMitsubishi from "@/assets/job-mitsubishi-install.webp";
import jobWaterHeater from "@/assets/job-water-heater.webp";
import jobMiniSplit from "@/assets/job-mini-split-exterior.webp";
import jobGasFurnace from "@/assets/job-gas-furnace.avif";
import jobRadiator from "@/assets/job-radiator-repair.webp";
import jobExteriorWhite from "@/assets/job-exterior-white-house.webp";
import projectBoilerAfter from "@/assets/project-boiler-after.webp";
import projectBurnerService from "@/assets/project-burner-service.avif";
import projectGasBoiler from "@/assets/project-gas-boiler.avif";

// Baseline gallery of real completed jobs. New photos flagged "Show on
// website" in the CRM appear above these automatically.
type FeaturedJob = {
  src: string;
  width: number;
  height: number;
  caption: string;
  tag: string;
  town?: string;
  problem?: string;
  solution?: string;
  result?: string;
  servicePath?: string;
};

const FEATURED_JOBS: FeaturedJob[] = [
  {
    src: projectBoilerAfter,
    width: 447,
    height: 640,
    caption: "Gas boiler replacement",
    tag: "Boiler Installation",
    town: "Yonkers",
    problem: "Aging steam boiler with uneven heat and leaks.",
    solution: "Installed a Weil-McLain boiler with corrected near-boiler piping.",
    result: "More even heat and improved boiler performance.",
    servicePath: "/services/boiler-installation-westchester-county-ny",
  },
  {
    src: jobMiniSplit,
    width: 765,
    height: 1020,
    caption: "Mitsubishi mini-split",
    tag: "Mini-Split Installation",
    town: "White Plains",
    problem: "Second floor stayed hot each summer.",
    solution: "Added a two-zone ductless heat pump system.",
    result: "More consistent second-floor comfort.",
    servicePath: "/services/mini-split-installation-westchester-county-ny",
  },
  {
    src: jobWaterHeater,
    width: 765,
    height: 1020,
    caption: "Water heater replacement",
    tag: "Water Heater Installation",
    town: "New Rochelle",
    problem: "Old tank leaking and recovering slowly.",
    solution: "Replaced with a high-recovery AO Smith unit.",
    result: "More reliable hot water recovery for daily use.",
    servicePath: "/services/water-heater-installation-westchester-county-ny",
  },
  {
    src: projectBurnerService,
    width: 447,
    height: 640,
    caption: "Oil burner service",
    tag: "Boiler Repair",
    town: "Mount Vernon",
    problem: "Hard starts and soot buildup.",
    solution: "Performed full burner cleaning, nozzle swap, and combustion test.",
    result: "Improved burner operation at startup.",
    servicePath: "/services/boiler-repair-westchester-county-ny",
  },
  {
    src: projectGasBoiler,
    width: 447,
    height: 640,
    caption: "Gas boiler maintenance",
    tag: "Boiler Repair",
    town: "Scarsdale",
    problem: "Short cycling and pressure fluctuation.",
    solution: "Serviced controls, adjusted expansion tank, and tuned combustion.",
    result: "More stable heat performance after service.",
    servicePath: "/services/boiler-repair-westchester-county-ny",
  },
  { src: jobBoilerAfter, width: 1440, height: 1920, caption: "High-efficiency gas boiler replacement — Westchester County", tag: "Boiler" },
  { src: jobBoilerBefore, width: 1440, height: 1920, caption: "The 25-year-old boiler it replaced (before)", tag: "Boiler" },
  { src: jobMitsubishi, width: 765, height: 1020, caption: "Mitsubishi ductless mini-split installation", tag: "Mini-Split" },
  { src: jobGasFurnace, width: 1086, height: 1448, caption: "95%+ AFUE gas furnace installation", tag: "Furnace" },
  { src: jobRadiator, width: 574, height: 1020, caption: "Hydronic radiator system service", tag: "Boiler" },
  { src: jobExteriorWhite, width: 765, height: 1020, caption: "Clean exterior line-set routing on a mini-split retrofit", tag: "Mini-Split" },
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
              <img src={p.public_url!} alt={p.public_caption || "Completed HVAC job by Bravo Mechanical"} width={1200} height={900} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              {p.public_caption && <figcaption className="p-3 text-sm font-semibold">{p.public_caption}</figcaption>}
            </figure>
          ))}
          {FEATURED_JOBS.map((p) => (
            <figure key={p.caption} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={p.src} alt={p.caption} width={p.width} height={p.height} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{p.town ? `${p.town} • ${p.caption}` : p.caption}</span>
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">{p.tag}</span>
                </div>
                {p.problem && <p className="text-sm"><strong>Problem:</strong> {p.problem}</p>}
                {p.solution && <p className="text-sm"><strong>Solution:</strong> {p.solution}</p>}
                {p.result && <p className="text-sm text-muted-foreground"><strong>Result:</strong> {p.result}</p>}
                {p.servicePath && (
                  <Link to={p.servicePath} className="inline-block text-sm font-semibold text-accent hover:underline">
                    View {p.tag} service →
                  </Link>
                )}
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
