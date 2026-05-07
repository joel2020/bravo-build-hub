export const SITE = {
  name: "Bravo Mechanical",
  legalName: "Bravo Mechanical LLC",
  // Canonical origin — must match sitemap.xml, robots.txt, llms.txt, and index.html JSON-LD.
  // No "www" subdomain. If you change this, update generate-sitemap.mjs and inject-head-metadata.mjs too.
  siteUrl: "https://bravomechanicalny.com",
  tagline: "Reliable HVAC Service You Can Count On",
  phone: "(914) 361-9142",
  phoneHref: "tel:+19143619142",
  email: "info@bravomechanicalny.com",
  emailHref: "mailto:info@bravomechanicalny.com",
  area: "Westchester County, NY",
  // Keep this count aligned with the verified public Google profile and src/lib/googleReviews.ts.
  rating: { score: 5.0, count: 7, source: "Google" },
  social: {
    facebook: "https://www.facebook.com/p/Bravo-Mechanical-LLC-61576283462607/",
    google: "https://www.google.com/maps/place/Bravo+Mechanical+LLC/data=!4m2!3m1!1s0x0:0x51712bb23caf72a8",
  },
  hours: [
    { day: "Mon – Sun", time: "Open 24 hours" },
  ],
  // Intentionally empty per business owner's instruction (no public HVAC license # available).
  // Do not auto-populate — must come directly from the business owner if/when issued.
  // If/when populated, the LocalBusiness JSON-LD in scripts/inject-head-metadata.mjs will
  // surface these automatically (no other change required).
  licenseNumbers: [] as string[],
  // Effective date of the latest legal-page revision. Update both when policies change.
  legalLastUpdated: "May 3, 2026",
};

export const SERVICES = [
  { slug: "hvac-installation", title: "HVAC Installation", description: "New furnace, AC, heat pump, and ductwork installation sized and engineered for your space." },
  { slug: "hvac-repair", title: "HVAC Repair", description: "Fast diagnostics and repair for heating and cooling systems — including same-day and emergency service." },
  { slug: "preventive-maintenance", title: "Preventive Maintenance", description: "Seasonal tune-ups and service plans that extend equipment life and prevent breakdowns." },
  { slug: "indoor-air-quality", title: "Indoor Air Quality", description: "Filtration, humidifiers, dehumidifiers, and air purifiers for healthier indoor environments." },
  { slug: "residential", title: "Residential HVAC", description: "Whole-home heating and cooling solutions for single-family homes, condos, and multi-units." },
  { slug: "commercial", title: "Commercial HVAC", description: "Reliable HVAC service for offices, retail, restaurants, and light-industrial buildings." },
];

export const TOWNS = [
  "Yonkers", "White Plains", "New Rochelle", "Mount Vernon", "Scarsdale",
  "Rye", "Harrison", "Mamaroneck", "Larchmont", "Bronxville",
  "Tuckahoe", "Eastchester", "Tarrytown", "Sleepy Hollow", "Ossining",
  "Peekskill", "Mount Kisco", "Chappaqua", "Pleasantville", "Pound Ridge",
  "Bedford", "Katonah", "Armonk", "Hastings-on-Hudson", "Dobbs Ferry",
  "Irvington", "Briarcliff Manor", "Croton-on-Hudson", "Yorktown", "Somers",
];
