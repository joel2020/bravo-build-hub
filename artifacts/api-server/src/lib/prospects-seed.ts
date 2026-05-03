/**
 * Curated, high-quality link-prospect seed list for Bravo Mechanical.
 * Focus: Westchester County, NY directories, chambers, regional press,
 * trade associations, and major local-business citation sources. These
 * are all legitimate sites where a real Westchester HVAC contractor would
 * have a profile, listing, sponsorship, or earned mention.
 *
 * Citation directories (the first few items) are the highest-priority
 * "must claim" listings. The rest are outreach prospects.
 */

export interface SeedProspect {
  id: string;
  category:
    | "Citation directory"
    | "Westchester chamber"
    | "Westchester press"
    | "HVAC trade association"
    | "Local home-improvement directory"
    | "NY clean-energy program"
    | "Westchester community";
  name: string;
  url: string;
  notes?: string;
}

export const PROSPECT_SEED: SeedProspect[] = [
  // ===== Citation directories (must-claim) =====
  {
    id: "cit-google-business",
    category: "Citation directory",
    name: "Google Business Profile",
    url: "https://www.google.com/business/",
    notes: "Highest-priority. Verify NAP, photos, hours, services, and Q&A.",
  },
  {
    id: "cit-yelp",
    category: "Citation directory",
    name: "Yelp for Business",
    url: "https://biz.yelp.com/",
    notes: "Claim listing, add photos, respond to all reviews.",
  },
  {
    id: "cit-bbb",
    category: "Citation directory",
    name: "Better Business Bureau (BBB)",
    url: "https://www.bbb.org/get-accredited",
    notes: "Apply for BBB accreditation (paid) for trust signal.",
  },
  {
    id: "cit-angi",
    category: "Citation directory",
    name: "Angi (Angie's List)",
    url: "https://pro.angi.com/",
    notes: "Free profile + paid leads option. Strong HVAC vertical.",
  },
  {
    id: "cit-houzz",
    category: "Citation directory",
    name: "Houzz Pro",
    url: "https://pro.houzz.com/",
    notes: "Strong for renovation/replacement HVAC photos.",
  },
  {
    id: "cit-homeadvisor",
    category: "Citation directory",
    name: "HomeAdvisor",
    url: "https://www.homeadvisor.com/inc/spa-pro/",
    notes: "Owned by Angi; same parent. Optional dual listing.",
  },
  {
    id: "cit-thumbtack",
    category: "Citation directory",
    name: "Thumbtack",
    url: "https://www.thumbtack.com/pro/",
    notes: "Pay-per-lead; useful for emergency/repair calls.",
  },
  {
    id: "cit-bing-places",
    category: "Citation directory",
    name: "Bing Places for Business",
    url: "https://www.bingplaces.com/",
    notes: "Free; powers Bing + Copilot map results.",
  },
  {
    id: "cit-apple-maps",
    category: "Citation directory",
    name: "Apple Business Connect",
    url: "https://businessconnect.apple.com/",
    notes: "Free; powers Apple Maps and Siri/Apple Intelligence.",
  },
  {
    id: "cit-yellowpages",
    category: "Citation directory",
    name: "YellowPages.com",
    url: "https://www.yellowpages.com/",
    notes: "Free basic listing; legacy NAP citation.",
  },
  {
    id: "cit-foursquare",
    category: "Citation directory",
    name: "Foursquare for Business",
    url: "https://business.foursquare.com/",
    notes: "Powers many third-party map/directory services.",
  },
  {
    id: "cit-mapquest",
    category: "Citation directory",
    name: "MapQuest",
    url: "https://listings.mapquest.com/",
    notes: "Free citation source.",
  },
  {
    id: "cit-manta",
    category: "Citation directory",
    name: "Manta",
    url: "https://www.manta.com/",
    notes: "Free B2B directory; classic NAP citation.",
  },
  {
    id: "cit-hotfrog",
    category: "Citation directory",
    name: "Hotfrog",
    url: "https://www.hotfrog.com/",
  },
  {
    id: "cit-brownbook",
    category: "Citation directory",
    name: "Brownbook.net",
    url: "https://www.brownbook.net/",
  },
  {
    id: "cit-chamberofcommerce",
    category: "Citation directory",
    name: "ChamberofCommerce.com",
    url: "https://www.chamberofcommerce.com/",
  },
  {
    id: "cit-superpages",
    category: "Citation directory",
    name: "Superpages",
    url: "https://www.superpages.com/",
  },
  {
    id: "cit-merchantcircle",
    category: "Citation directory",
    name: "MerchantCircle",
    url: "https://www.merchantcircle.com/",
  },
  {
    id: "cit-cylex",
    category: "Citation directory",
    name: "Cylex USA",
    url: "https://www.cylex.us.com/",
  },
  {
    id: "cit-tupalo",
    category: "Citation directory",
    name: "Tupalo",
    url: "https://tupalo.com/",
  },

  // ===== Westchester chambers of commerce =====
  {
    id: "ch-westchester-county",
    category: "Westchester chamber",
    name: "Business Council of Westchester",
    url: "https://thebcw.org/",
    notes: "Premier county-wide business chamber; member directory link.",
  },
  {
    id: "ch-yonkers",
    category: "Westchester chamber",
    name: "Yonkers Chamber of Commerce",
    url: "https://www.yonkerschamber.com/",
  },
  {
    id: "ch-white-plains",
    category: "Westchester chamber",
    name: "White Plains Chamber of Commerce",
    url: "https://wpchamber.com/",
  },
  {
    id: "ch-new-rochelle",
    category: "Westchester chamber",
    name: "New Rochelle Chamber of Commerce",
    url: "https://www.newrochellechamber.org/",
  },
  {
    id: "ch-mount-vernon",
    category: "Westchester chamber",
    name: "Mount Vernon Chamber of Commerce",
    url: "https://mountvernonchamber.org/",
  },
  {
    id: "ch-bronxville",
    category: "Westchester chamber",
    name: "Bronxville Chamber of Commerce",
    url: "https://www.bronxvillechamber.com/",
  },
  {
    id: "ch-tarrytown-sleepy-hollow",
    category: "Westchester chamber",
    name: "Sleepy Hollow / Tarrytown Chamber",
    url: "https://www.sleepyhollowtarrytownchamber.com/",
  },
  {
    id: "ch-mount-kisco",
    category: "Westchester chamber",
    name: "Mount Kisco Chamber of Commerce",
    url: "https://www.mountkiscochamber.com/",
  },
  {
    id: "ch-katonah",
    category: "Westchester chamber",
    name: "Katonah Chamber of Commerce",
    url: "https://www.katonahchamber.org/",
  },
  {
    id: "ch-ossining",
    category: "Westchester chamber",
    name: "Ossining Chamber of Commerce",
    url: "https://www.ossiningchamber.org/",
  },
  {
    id: "ch-peekskill",
    category: "Westchester chamber",
    name: "Peekskill Chamber of Commerce",
    url: "https://www.peekskillchamber.com/",
  },
  {
    id: "ch-pleasantville",
    category: "Westchester chamber",
    name: "Pleasantville Chamber of Commerce",
    url: "https://www.pleasantvillechamber.com/",
  },
  {
    id: "ch-rye",
    category: "Westchester chamber",
    name: "Rye Chamber of Commerce",
    url: "https://www.ryechamberofcommerce.com/",
  },
  {
    id: "ch-mamaroneck",
    category: "Westchester chamber",
    name: "Mamaroneck Chamber of Commerce",
    url: "https://www.mamaroneckchamberofcommerce.org/",
  },
  {
    id: "ch-larchmont",
    category: "Westchester chamber",
    name: "Larchmont Chamber of Commerce",
    url: "https://www.larchmontchamber.org/",
  },
  {
    id: "ch-armonk",
    category: "Westchester chamber",
    name: "Armonk Chamber of Commerce",
    url: "https://www.armonkchamberofcommerce.org/",
  },
  {
    id: "ch-yorktown",
    category: "Westchester chamber",
    name: "Yorktown Chamber of Commerce",
    url: "https://www.yorktownchamber.org/",
  },
  {
    id: "ch-rivertowns",
    category: "Westchester chamber",
    name: "Rivertowns Chamber of Commerce",
    url: "https://www.rivertownschamber.com/",
  },

  // ===== Westchester press / local journalism =====
  {
    id: "pr-westchester-magazine",
    category: "Westchester press",
    name: "Westchester Magazine",
    url: "https://westchestermagazine.com/",
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
  },
  {
    id: "pr-examiner-news",
    category: "Westchester press",
    name: "The Examiner News (Northern Westchester)",
    url: "https://www.theexaminernews.com/",
  },
  {
    id: "pr-westmore-news",
    category: "Westchester press",
    name: "Westmore News (Port Chester / Rye Brook)",
    url: "https://westmorenews.com/",
  },
  {
    id: "pr-rising-westchester",
    category: "Westchester press",
    name: "The Rising — Westchester",
    url: "https://therising.co/",
  },
  {
    id: "pr-patch-yonkers",
    category: "Westchester press",
    name: "Patch — Yonkers",
    url: "https://patch.com/new-york/yonkers",
  },
  {
    id: "pr-patch-white-plains",
    category: "Westchester press",
    name: "Patch — White Plains",
    url: "https://patch.com/new-york/whiteplains",
  },
  {
    id: "pr-patch-new-rochelle",
    category: "Westchester press",
    name: "Patch — New Rochelle",
    url: "https://patch.com/new-york/newrochelle",
  },
  {
    id: "pr-patch-tarrytown",
    category: "Westchester press",
    name: "Patch — Tarrytown",
    url: "https://patch.com/new-york/tarrytown",
  },

  // ===== HVAC trade associations =====
  {
    id: "tr-acca",
    category: "HVAC trade association",
    name: "Air Conditioning Contractors of America (ACCA)",
    url: "https://www.acca.org/",
    notes: "National HVAC contractor association; member directory link.",
  },
  {
    id: "tr-ashrae",
    category: "HVAC trade association",
    name: "ASHRAE",
    url: "https://www.ashrae.org/",
    notes: "Standards body; chapter membership earns a profile link.",
  },
  {
    id: "tr-phcc-ny",
    category: "HVAC trade association",
    name: "PHCC New York State",
    url: "https://www.phccny.org/",
  },
  {
    id: "tr-mcaa",
    category: "HVAC trade association",
    name: "Mechanical Contractors Association of America (MCAA)",
    url: "https://www.mcaa.org/",
  },
  {
    id: "tr-nate",
    category: "HVAC trade association",
    name: "NATE — North American Technician Excellence",
    url: "https://www.natex.org/",
    notes: "Get techs NATE-certified, then claim contractor profile link.",
  },
  {
    id: "tr-bpi",
    category: "HVAC trade association",
    name: "Building Performance Institute (BPI)",
    url: "https://www.bpi.org/",
    notes: "Energy-audit certification; useful for whole-home heat-pump work.",
  },

  // ===== NY clean-energy programs =====
  {
    id: "ny-cleanheat",
    category: "NY clean-energy program",
    name: "NYS Clean Heat Contractor Network",
    url: "https://cleanheat.ny.gov/",
    notes:
      "Apply to be a NYS Clean Heat participating contractor — gets you on the official heat-pump installer locator.",
  },
  {
    id: "ny-nyserda-cn",
    category: "NY clean-energy program",
    name: "NYSERDA Comfort Home / Contractor Network",
    url: "https://www.nyserda.ny.gov/All-Programs/Comfort-Home-Program",
    notes: "NYSERDA participating contractor listing.",
  },
  {
    id: "ny-coned-marketplace",
    category: "NY clean-energy program",
    name: "Con Edison Marketplace",
    url: "https://coned.energysavingsproducts.com/",
    notes: "Manufacturer-rebate marketplace; relevant brand pages can link out.",
  },
  {
    id: "ny-energystar-locator",
    category: "NY clean-energy program",
    name: "ENERGY STAR Find a Contractor",
    url: "https://www.energystar.gov/findacontractor",
  },
  {
    id: "ny-ase-doe",
    category: "NY clean-energy program",
    name: "Alliance to Save Energy / DOE Better Buildings",
    url: "https://www.ase.org/",
  },

  // ===== Local home-improvement / community directories =====
  {
    id: "loc-westchester-mag-resources",
    category: "Local home-improvement directory",
    name: "Westchester Mag Home-Improvement Directory",
    url: "https://westchestermagazine.com/home/",
  },
  {
    id: "loc-ct-local-newsletter",
    category: "Local home-improvement directory",
    name: "Local Westchester newsletter HVAC ad",
    url: "https://newsbreak.com/",
    notes: "NewsBreak runs hyperlocal Westchester feeds; sponsored content option.",
  },
  {
    id: "loc-nextdoor",
    category: "Westchester community",
    name: "Nextdoor for Business",
    url: "https://business.nextdoor.com/local",
    notes:
      "Claim a free Nextdoor business profile in Westchester neighborhoods; high-trust local recommendations.",
  },
  {
    id: "loc-alignable",
    category: "Westchester community",
    name: "Alignable",
    url: "https://www.alignable.com/",
    notes: "Local-business networking; profile + recommendations earn citations.",
  },
  {
    id: "loc-citysearch",
    category: "Local home-improvement directory",
    name: "Citysearch",
    url: "https://www.citysearch.com/",
  },
  {
    id: "loc-localnewsbreak",
    category: "Local home-improvement directory",
    name: "Local.com",
    url: "https://www.local.com/",
  },
];
