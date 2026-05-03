/**
 * Curated dofollow-only link-prospect seed list for Bravo Mechanical.
 *
 * IMPORTANT: every entry below is a category of site that historically
 * gives an editorial/dofollow outbound link in member directories,
 * profile pages, or article bylines. Generic citation directories that
 * are known to use rel="nofollow" on outbound links (Yelp, BBB, Angi,
 * Houzz, HomeAdvisor, Thumbtack, YellowPages, Manta, Hotfrog, etc.) are
 * intentionally excluded from this list so the agent only pursues
 * dofollow opportunities. Those directories are still worth claiming
 * for NAP/citations but should be done manually outside this agent.
 */

export interface SeedProspect {
  id: string;
  category:
    | "Westchester chamber"
    | "Westchester press"
    | "HVAC trade association"
    | "NY clean-energy program"
    | "Westchester community";
  name: string;
  url: string;
  /** Optional contact page; agent will try this first when discovering an email. */
  contactUrl?: string;
  notes?: string;
}

export const PROSPECT_SEED: SeedProspect[] = [
  // ===== Westchester chambers of commerce (typically dofollow member directory links) =====
  {
    id: "ch-westchester-county",
    category: "Westchester chamber",
    name: "Business Council of Westchester",
    url: "https://thebcw.org/",
    contactUrl: "https://thebcw.org/contact/",
    notes: "Premier county-wide business chamber; dofollow member directory link.",
  },
  {
    id: "ch-yonkers",
    category: "Westchester chamber",
    name: "Yonkers Chamber of Commerce",
    url: "https://www.yonkerschamber.com/",
    contactUrl: "https://www.yonkerschamber.com/contact",
  },
  {
    id: "ch-white-plains",
    category: "Westchester chamber",
    name: "White Plains Chamber of Commerce",
    url: "https://wpchamber.com/",
    contactUrl: "https://wpchamber.com/contact-us/",
  },
  {
    id: "ch-new-rochelle",
    category: "Westchester chamber",
    name: "New Rochelle Chamber of Commerce",
    url: "https://www.newrochellechamber.org/",
    contactUrl: "https://www.newrochellechamber.org/contact-us",
  },
  {
    id: "ch-mount-vernon",
    category: "Westchester chamber",
    name: "Mount Vernon Chamber of Commerce",
    url: "https://mountvernonchamber.org/",
    contactUrl: "https://mountvernonchamber.org/contact/",
  },
  {
    id: "ch-bronxville",
    category: "Westchester chamber",
    name: "Bronxville Chamber of Commerce",
    url: "https://www.bronxvillechamber.com/",
    contactUrl: "https://www.bronxvillechamber.com/contact",
  },
  {
    id: "ch-tarrytown-sleepy-hollow",
    category: "Westchester chamber",
    name: "Sleepy Hollow / Tarrytown Chamber",
    url: "https://www.sleepyhollowtarrytownchamber.com/",
    contactUrl: "https://www.sleepyhollowtarrytownchamber.com/contact",
  },
  {
    id: "ch-mount-kisco",
    category: "Westchester chamber",
    name: "Mount Kisco Chamber of Commerce",
    url: "https://www.mountkiscochamber.com/",
    contactUrl: "https://www.mountkiscochamber.com/contact-us",
  },
  {
    id: "ch-katonah",
    category: "Westchester chamber",
    name: "Katonah Chamber of Commerce",
    url: "https://www.katonahchamber.org/",
    contactUrl: "https://www.katonahchamber.org/contact-us/",
  },
  {
    id: "ch-ossining",
    category: "Westchester chamber",
    name: "Ossining Chamber of Commerce",
    url: "https://www.ossiningchamber.org/",
    contactUrl: "https://www.ossiningchamber.org/contact",
  },
  {
    id: "ch-peekskill",
    category: "Westchester chamber",
    name: "Peekskill Chamber of Commerce",
    url: "https://www.peekskillchamber.com/",
    contactUrl: "https://www.peekskillchamber.com/contact",
  },
  {
    id: "ch-pleasantville",
    category: "Westchester chamber",
    name: "Pleasantville Chamber of Commerce",
    url: "https://www.pleasantvillechamber.com/",
    contactUrl: "https://www.pleasantvillechamber.com/contact",
  },
  {
    id: "ch-rye",
    category: "Westchester chamber",
    name: "Rye Chamber of Commerce",
    url: "https://www.ryechamberofcommerce.com/",
    contactUrl: "https://www.ryechamberofcommerce.com/contact",
  },
  {
    id: "ch-mamaroneck",
    category: "Westchester chamber",
    name: "Mamaroneck Chamber of Commerce",
    url: "https://www.mamaroneckchamberofcommerce.org/",
    contactUrl: "https://www.mamaroneckchamberofcommerce.org/contact",
  },
  {
    id: "ch-larchmont",
    category: "Westchester chamber",
    name: "Larchmont Chamber of Commerce",
    url: "https://www.larchmontchamber.org/",
    contactUrl: "https://www.larchmontchamber.org/contact",
  },
  {
    id: "ch-armonk",
    category: "Westchester chamber",
    name: "Armonk Chamber of Commerce",
    url: "https://www.armonkchamberofcommerce.org/",
    contactUrl: "https://www.armonkchamberofcommerce.org/contact",
  },
  {
    id: "ch-yorktown",
    category: "Westchester chamber",
    name: "Yorktown Chamber of Commerce",
    url: "https://www.yorktownchamber.org/",
    contactUrl: "https://www.yorktownchamber.org/contact-us",
  },
  {
    id: "ch-rivertowns",
    category: "Westchester chamber",
    name: "Rivertowns Chamber of Commerce",
    url: "https://www.rivertownschamber.com/",
    contactUrl: "https://www.rivertownschamber.com/contact",
  },

  // ===== Westchester press / local journalism (dofollow article bylines) =====
  {
    id: "pr-westchester-magazine",
    category: "Westchester press",
    name: "Westchester Magazine",
    url: "https://westchestermagazine.com/",
    contactUrl: "https://westchestermagazine.com/contact-us/",
    notes: "Pitch a 'Best of Westchester HVAC' or 'how to prep your home for winter' tip column.",
  },
  {
    id: "pr-lohud",
    category: "Westchester press",
    name: "lohud.com (Journal News)",
    url: "https://www.lohud.com/",
    notes: "Westchester-region daily; pitch as expert source for seasonal home stories.",
  },
  {
    id: "pr-river-journal",
    category: "Westchester press",
    name: "River Journal Online",
    url: "https://riverjournalonline.com/",
    contactUrl: "https://riverjournalonline.com/contact-us/",
  },
  {
    id: "pr-examiner-news",
    category: "Westchester press",
    name: "The Examiner News (Northern Westchester)",
    url: "https://www.theexaminernews.com/",
    contactUrl: "https://www.theexaminernews.com/contact-us/",
  },
  {
    id: "pr-westmore-news",
    category: "Westchester press",
    name: "Westmore News (Port Chester / Rye Brook)",
    url: "https://westmorenews.com/",
    contactUrl: "https://westmorenews.com/contact-us/",
  },
  {
    id: "pr-rising-westchester",
    category: "Westchester press",
    name: "The Rising — Westchester",
    url: "https://therising.co/",
    contactUrl: "https://therising.co/contact",
  },

  // ===== HVAC trade associations (dofollow contractor directory links) =====
  {
    id: "tr-acca",
    category: "HVAC trade association",
    name: "Air Conditioning Contractors of America (ACCA)",
    url: "https://www.acca.org/",
    contactUrl: "https://www.acca.org/about/contact",
    notes: "National HVAC contractor association; dofollow member directory link.",
  },
  {
    id: "tr-ashrae",
    category: "HVAC trade association",
    name: "ASHRAE",
    url: "https://www.ashrae.org/",
    contactUrl: "https://www.ashrae.org/about/contact-us",
    notes: "Standards body; chapter membership earns a profile link.",
  },
  {
    id: "tr-phcc-ny",
    category: "HVAC trade association",
    name: "PHCC New York State",
    url: "https://www.phccny.org/",
    contactUrl: "https://www.phccny.org/contact",
  },
  {
    id: "tr-mcaa",
    category: "HVAC trade association",
    name: "Mechanical Contractors Association of America (MCAA)",
    url: "https://www.mcaa.org/",
    contactUrl: "https://www.mcaa.org/contact-us/",
  },
  {
    id: "tr-nate",
    category: "HVAC trade association",
    name: "NATE — North American Technician Excellence",
    url: "https://www.natex.org/",
    contactUrl: "https://www.natex.org/contact-nate/",
    notes: "Get techs NATE-certified, then claim contractor profile link.",
  },
  {
    id: "tr-bpi",
    category: "HVAC trade association",
    name: "Building Performance Institute (BPI)",
    url: "https://www.bpi.org/",
    contactUrl: "https://www.bpi.org/contact",
    notes: "Energy-audit certification; useful for whole-home heat-pump work.",
  },

  // ===== NY clean-energy programs (dofollow contractor locator listings) =====
  {
    id: "ny-cleanheat",
    category: "NY clean-energy program",
    name: "NYS Clean Heat Contractor Network",
    url: "https://cleanheat.ny.gov/",
    contactUrl: "https://cleanheat.ny.gov/contact",
    notes:
      "Apply to be a NYS Clean Heat participating contractor — dofollow listing on the official heat-pump installer locator.",
  },
  {
    id: "ny-nyserda-cn",
    category: "NY clean-energy program",
    name: "NYSERDA Comfort Home / Contractor Network",
    url: "https://www.nyserda.ny.gov/All-Programs/Comfort-Home-Program",
    contactUrl: "https://www.nyserda.ny.gov/About/Contact-Us",
    notes: "NYSERDA participating contractor listing.",
  },
  {
    id: "ny-energystar-locator",
    category: "NY clean-energy program",
    name: "ENERGY STAR Find a Contractor",
    url: "https://www.energystar.gov/findacontractor",
    contactUrl: "https://www.energystar.gov/about/contact_us",
  },
  {
    id: "ny-ase",
    category: "NY clean-energy program",
    name: "Alliance to Save Energy",
    url: "https://www.ase.org/",
    contactUrl: "https://www.ase.org/contact",
  },

  // ===== Westchester community / business orgs (dofollow profiles) =====
  {
    id: "loc-westchester-mag-resources",
    category: "Westchester community",
    name: "Westchester Mag Home-Improvement Resources",
    url: "https://westchestermagazine.com/home/",
    contactUrl: "https://westchestermagazine.com/contact-us/",
  },
];
