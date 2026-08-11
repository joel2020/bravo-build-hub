export const SITE = {
  name: "Bravo Mechanical",
  legalName: "Bravo Mechanical LLC",
  // Canonical origin — must match sitemap.xml, robots.txt, llms.txt, and index.html JSON-LD.
  // The canonical origin uses www. If it changes, update route-data.mjs and
  // inject-head-metadata.mjs too; the root vercel.json redirects the apex host.
  siteUrl: "https://www.bravomechanicalny.com",
  tagline: "Reliable HVAC Service You Can Count On",
  phone: "(914) 361-9142",
  phoneHref: "tel:+19143619142",
  // Public-facing call + text number. Per the owner (2026-07-14), all
  // displayed calls and texts on the marketing site use the single business
  // line (914) 361-9142. NOTE: the Twilio line that the CRM polls for inbound
  // texts and sends auto-replies from is still (914) 888-2384 — customer texts
  // to 361 reach the owner's phone directly, not the CRM inbox.
  smsPhone: "(914) 361-9142",
  smsHref: "sms:+19143619142",
  email: "info@bravomechanicalny.com",
  emailHref: "mailto:info@bravomechanicalny.com",
  area: "Westchester County, NY",
  // Published business address (confirmed by the owner 2026-07-14; matches Yelp).
  address: {
    street: "1 Fowler Avenue",
    city: "Yonkers",
    state: "NY",
    zip: "10701",
    full: "1 Fowler Avenue, Yonkers, NY 10701",
  },
  // Keep this count aligned with the verified public Google profile and src/lib/googleReviews.ts.
  rating: { score: 5.0, count: 7, source: "Google" },
  social: {
    facebook: "https://www.facebook.com/p/Bravo-Mechanical-LLC-61576283462607/",
    google: "https://www.google.com/maps/place/Bravo+Mechanical+LLC/data=!4m2!3m1!1s0x0:0x51712bb23caf72a8",
  },
  hours: [
    { day: "Mon – Sun", time: "Open 24 hours" },
  ],
  // Provided directly by the business owner on 2026-07-14.
  licenseNumbers: ["8822"] as string[],
  // Owner-stated (2026-07-14): the team's combined field experience.
  experienceYears: 30,
  experienceLine: "Our team brings 30+ years of combined HVAC experience across Westchester County.",
  // Effective date of the latest legal-page revision. Update both when policies change.
  legalLastUpdated: "May 3, 2026",
};

// The 6 "money pages" featured on the homepage and in the footer. These must
// deep-link to the high-intent service pages — linking them all to /services
// starves the pages that actually convert of internal link equity.
export const FEATURED_SERVICE_LINKS = [
  { title: "AC Repair", path: "/services/ac-repair-westchester-county-ny", description: "No cool air? Same-day AC diagnostics and repair across Westchester, priced in writing before the fix." },
  { title: "AC Installation", path: "/services/ac-installation-westchester-county-ny", description: "Central AC and ductless cooling installed with honest Manual J sizing and SEER2 equipment." },
  { title: "Boiler Repair", path: "/services/boiler-repair-westchester-county-ny", description: "Steam and hot-water boiler repair — short cycling, leaks, and no-heat calls, 24/7." },
  { title: "Boiler Installation", path: "/services/boiler-installation-westchester-county-ny", description: "High-efficiency boiler replacement with near-boiler piping done right and a written fixed price first." },
  { title: "Heat Pump Installation", path: "/services/heat-pump-installation-westchester-county-ny", description: "Cold-climate heat pumps sized and installed right for year-round Westchester comfort." },
  { title: "24/7 Emergency HVAC", path: "/services/emergency-hvac-repair-westchester-county-ny", description: "No heat, no cooling, or a leaking boiler — licensed techs answering around the clock." },
];

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
  "Ardsley", "Hartsdale", "Pelham", "Port Chester",
];
