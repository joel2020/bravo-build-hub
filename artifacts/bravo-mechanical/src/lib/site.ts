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
  social: {
    facebook: "https://www.facebook.com/p/Bravo-Mechanical-LLC-61576283462607/",
    google: "https://www.google.com/maps/place/Bravo+Mechanical+LLC/data=!4m2!3m1!1s0x0:0x51712bb23caf72a8",
  },
  // Effective date of the latest legal-page revision. Update both when policies change.
  legalLastUpdated: "May 3, 2026",
};

// The 6 "money pages" featured on the homepage and in the footer. These must
// deep-link to the high-intent service pages — linking them all to /services
// starves the pages that actually convert of internal link equity.
export const FEATURED_SERVICE_LINKS = [
  { title: "AC Repair", path: "/services/ac-repair-westchester-county-ny", description: "AC diagnostics and repair for common cooling concerns in Westchester County." },
  { title: "AC Installation", path: "/services/ac-installation-westchester-county-ny", description: "Central AC and ductless cooling installation for Westchester properties." },
  { title: "Boiler Repair", path: "/services/boiler-repair-westchester-county-ny", description: "Steam and hot-water boiler repair for no-heat, leak, and cycling concerns." },
  { title: "Boiler Installation", path: "/services/boiler-installation-westchester-county-ny", description: "Boiler replacement planning and installation for Westchester homes and properties." },
  { title: "Heat Pump Installation", path: "/services/heat-pump-installation-westchester-county-ny", description: "Heat-pump installation for year-round heating and cooling needs." },
  { title: "Emergency HVAC", path: "/services/emergency-hvac-repair-westchester-county-ny", description: "Urgent heating and cooling service requests with safety-first next steps." },
];

export const SERVICES = [
  { slug: "hvac-installation", title: "HVAC Installation", description: "Installation planning for furnaces, AC systems, heat pumps, and ductwork." },
  { slug: "hvac-repair", title: "HVAC Repair", description: "Diagnostics and repair for heating and cooling systems." },
  { slug: "preventive-maintenance", title: "Preventive Maintenance", description: "Seasonal maintenance support for heating and cooling systems." },
  { slug: "indoor-air-quality", title: "Indoor Air Quality", description: "Filtration, humidity, and air-quality support for indoor comfort." },
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
