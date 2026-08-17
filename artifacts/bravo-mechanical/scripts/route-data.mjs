// Shared route + metadata catalog used by build-time SEO scripts.
// Read from TS source via lightweight regex parsing so we never need a TS runtime
// or to duplicate slug/content data. If you add a new route type, update both
// generate-sitemap.mjs and inject-head-metadata.mjs.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

export const SITE_URL = "https://www.bravomechanicalny.com";
export const SITE_NAME = "Bravo Mechanical";
export const SITE_LEGAL = "Bravo Mechanical LLC";
export const SITE_PHONE = "(914) 361-9142";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Curated homepage FAQ — kept in sync with public/llms.txt. Surfaced as
// FAQPage schema in dist/public/index.html so Google AI Overviews and
// LLM crawlers (which often skip JS-rendered FAQ blocks) can cite us
// directly without rendering the React tree.
export const HOMEPAGE_FAQS = [
  {
    q: "What is Bravo Mechanical?",
    a: "Bravo Mechanical LLC provides HVAC repair, installation, emergency dispatch, and maintenance for homes and light-commercial properties in Westchester County, NY.",
  },
  {
    q: "What areas does Bravo Mechanical serve?",
    a: "Bravo Mechanical serves Westchester County, NY. See the published service-area pages for local service information.",
  },
  {
    q: "How do I request urgent HVAC help?",
    a: "For urgent heating or cooling concerns, call (914) 361-9142 to request the next available response window. For a gas smell or immediate safety hazard, contact the appropriate emergency utility or service first.",
  },
  {
    q: "Should I repair or replace an HVAC system?",
    a: "Repair-versus-replacement planning depends on the system condition, the problem found, and the property’s needs. Request service to discuss the next practical step.",
  },
  {
    q: "Does Bravo Mechanical service both residential and commercial properties?",
    a: "Bravo Mechanical supports homes, property managers, and light-commercial customers in Westchester County, NY.",
  },
  {
    q: "How do I contact Bravo Mechanical?",
    a: "Call (914) 361-9142, email info@bravomechanicalny.com, or request service at https://www.bravomechanicalny.com/contact.",
  },
];

// ---- HowTo schema for step-by-step blog posts --------------------------
// Hand-curated for posts that genuinely follow a numbered procedure.
// Each entry triggers a HowTo JSON-LD block alongside BlogPosting on
// /blog/<slug> — eligible for Google rich results and AI Overview
// step-by-step extraction. Keep step names <60 chars.
export const BLOG_HOWTOS = {
  "why-is-my-ac-bill-so-high-westchester": {
    name: "How to Lower a High Summer AC Bill",
    description: "Six homeowner steps to cut cooling costs before calling for an efficiency check in Westchester.",
    totalTime: "PT30M",
    steps: [
      { name: "Replace the air filter", text: "Install a fresh, properly sized pleated filter. A clogged filter chokes airflow and is the cheapest efficiency loss to fix." },
      { name: "Wash the outdoor condenser coil", text: "Power off at the disconnect, then gently rinse pollen, grass, and salt off the outdoor unit with a garden hose." },
      { name: "Clear space around the outdoor unit", text: "Keep at least two feet of clearance on all sides so the system can reject heat efficiently." },
      { name: "Raise and schedule the thermostat", text: "Set 76 to 78 degrees when home and a few degrees higher when away. A smart thermostat automates this without daily effort." },
      { name: "Block midday sun", text: "Close blinds on west- and south-facing windows during peak sun to reduce the cooling load." },
      { name: "Clear blocked vents and returns", text: "Make sure furniture and rugs are not covering supply registers or return grilles so air can circulate freely." },
    ],
  },
  "what-size-central-ac-westchester": {
    name: "How to Size a Central Air Conditioner for Your Home",
    description: "Six steps to right-size a central AC for a Westchester home and avoid the cost of oversizing.",
    totalTime: "PT20M",
    steps: [
      { name: "Estimate tonnage from square footage", text: "Use roughly one ton of cooling per 500 to 600 sq ft as a starting point to set budget and expectations." },
      { name: "Do not reuse the old size by default", text: "Many existing Westchester systems were oversized years ago. Replacing like-for-like repeats the mistake." },
      { name: "Account for home changes", text: "Added insulation, new windows, or a finished attic or basement all change the cooling load." },
      { name: "Get a Manual J load calculation", text: "Have a licensed contractor run a Manual J that accounts for insulation, windows, ceiling height, and sun exposure." },
      { name: "Match the indoor coil to the outdoor unit", text: "A correctly sized condenser paired with a mismatched coil will not deliver rated capacity or efficiency." },
      { name: "Confirm the ductwork can carry the airflow", text: "Even a perfectly sized unit underperforms on undersized or leaky ducts, so verify duct capacity before installing." },
    ],
  },
  "furnace-not-igniting-mount-vernon": {
    name: "How to Troubleshoot a Furnace That Won't Ignite",
    description: "Seven safe checks a Westchester homeowner can perform before calling for furnace repair.",
    totalTime: "PT15M",
    steps: [
      { name: "Check the thermostat batteries", text: "If the thermostat screen is dim, blank, or shows 'low batt,' replace the AA batteries — the most common cause of a no-heat call." },
      { name: "Confirm the furnace switch is on", text: "Most furnaces have a wall switch that looks like a light switch (often red) near the unit or at the top of the basement stairs. Make sure it is in the ON position." },
      { name: "Check the breaker", text: "Look for a tripped 15A or 20A breaker labeled 'furnace' or 'boiler' and reset it once. If it trips again, stop and call a technician." },
      { name: "Inspect the air filter", text: "A clogged filter restricts airflow and can trip the high-limit safety, locking out ignition. Replace any filter that has been in for more than three months." },
      { name: "Check the condensate drain", text: "On 90%+ AFUE high-efficiency furnaces, water pooling near the unit usually means the condensate trap or pump has failed and the safety switch tripped. Clear or pump out the condensate line." },
      { name: "Reset the unit", text: "Turn the wall switch off for 60 seconds, then back on. Modern furnaces require a hard reset after three failed ignition attempts." },
      { name: "Verify gas service", text: "Check that gas appliances like the stove are working. If gas is out, call the utility (Con Edison). If gas is on but the furnace will not fire, the gas valve solenoid or igniter has likely failed — call a licensed HVAC contractor." },
    ],
  },
  "ac-tune-up-checklist-new-rochelle": {
    name: "How to Perform an Annual AC Tune-Up",
    description: "An 18-point spring tune-up procedure that protects central AC equipment in coastal Westchester homes.",
    totalTime: "PT90M",
    steps: [
      { name: "Wash the outdoor condenser coil", text: "Use low-pressure water and a no-rinse coil cleaner to remove pollen, debris, and salt deposits from the outdoor unit." },
      { name: "Straighten bent condenser fins", text: "Use a fin comb to straighten any bent aluminum fins so airflow across the coil is restored." },
      { name: "Tighten electrical connections", text: "Power off at the disconnect, then check and tighten every electrical lug at the contactor and capacitor terminals." },
      { name: "Test the run capacitor", text: "Measure capacitance with a multimeter and replace any capacitor reading more than 5% below its rated microfarads." },
      { name: "Check refrigerant charge", text: "Connect manifold gauges and verify charge using superheat (fixed-orifice systems) or subcool (TXV systems) — adjust only if the system is undercharged and a leak has been ruled out." },
      { name: "Replace the indoor air filter", text: "Install a properly sized pleated filter — MERV 8 to 11 is the right balance for most Westchester homes." },
      { name: "Inspect the evaporator coil", text: "Pull the access panel and check the indoor coil for biological growth or restricted airflow. Clean with no-rinse evaporator coil cleaner if needed." },
      { name: "Flush the condensate drain", text: "Pour a vinegar-and-water solution down the condensate line and verify it drains freely. Test the float switch by lifting the float and confirming the system shuts off." },
      { name: "Verify supply and return temperature split", text: "After 15 minutes of cooling, the temperature split between return and supply air should be 18 to 22 degrees Fahrenheit. Anything outside this range indicates an airflow or charge issue." },
    ],
  },
  "fall-furnace-tune-up-hartsdale": {
    name: "How to Prepare a Furnace for Winter",
    description: "A step-by-step fall tune-up procedure for gas furnaces in Westchester County homes.",
    totalTime: "PT60M",
    steps: [
      { name: "Replace the furnace filter", text: "Install a fresh, properly sized pleated filter before the heating season starts to protect the blower and heat exchanger." },
      { name: "Inspect and clean the burners", text: "Brush dust and debris off the burners and inspect the flame pattern — flames should be steady and blue, not yellow or lifting." },
      { name: "Test the flame sensor", text: "Pull and clean the flame sensor with fine steel wool. A dirty flame sensor is the #1 cause of mid-cycle furnace shutdowns." },
      { name: "Check the inducer motor and venting", text: "Listen for grinding or rattling and inspect the venting for blockages, corrosion, or condensate buildup." },
      { name: "Verify safety switch operation", text: "Test the high-limit switch, rollout switches, and pressure switches by simulating fault conditions and confirming the furnace shuts down safely." },
      { name: "Measure combustion efficiency", text: "Use a combustion analyzer to check CO levels, O2, and stack temperature. CO in the flue should be under 100 ppm air-free; CO in the supply air should be 0." },
      { name: "Check the thermostat and cycle the furnace", text: "Run a complete heat cycle from cold start, verify proper ignition sequence, and confirm the thermostat reaches setpoint." },
    ],
  },
  "spring-hvac-checklist-harrison": {
    name: "How to Get Your HVAC System Ready for Spring",
    description: "Spring HVAC startup steps for Harrison, NY homeowners.",
    totalTime: "PT45M",
    steps: [
      { name: "Replace the air filter", text: "Install a fresh pleated filter before switching from heat to cool to avoid carrying winter dust into the cooling coil." },
      { name: "Clear debris from the outdoor condenser", text: "Remove leaves, twigs, mulch, and any tarp or cover from the outdoor unit. Maintain at least two feet of clearance on all sides." },
      { name: "Turn on power at the AC disconnect", text: "If you switched off the outdoor disconnect for winter, restore power at least 24 hours before running the system to allow the compressor crankcase heater to warm the oil." },
      { name: "Run a cooling cycle and check temperature split", text: "Set the thermostat to cool, run for 15 minutes, and confirm a 18 to 22 degree Fahrenheit temperature split between return and supply registers." },
      { name: "Test the condensate drain and float switch", text: "Pour water into the drain pan and confirm it drains freely. Lift the float switch and confirm the system shuts off." },
      { name: "Schedule a professional tune-up", text: "Book a licensed HVAC technician for a full refrigerant, electrical, and combustion check before the first heat wave — lead times stretch quickly in May and June." },
    ],
  },
  "winter-furnace-prep-westchester": {
    name: "How to Prepare a Westchester Home Furnace for Winter",
    description: "Pre-season furnace preparation steps for Westchester County homeowners.",
    totalTime: "PT30M",
    steps: [
      { name: "Replace the furnace filter", text: "Install a fresh pleated filter before the first cold snap to ensure proper airflow." },
      { name: "Test the thermostat", text: "Run the furnace through a full heat cycle and confirm it reaches setpoint within a reasonable time." },
      { name: "Inspect vents and registers", text: "Walk every room, open all supply registers, and confirm return grilles are not blocked by furniture or rugs." },
      { name: "Test the carbon monoxide detector", text: "Press the test button on every CO detector and replace batteries. CO detectors expire — confirm yours is under seven years old." },
      { name: "Clear the area around the furnace", text: "Maintain at least three feet of clearance on all sides. Move stored items, paint, and flammable materials away from the unit." },
      { name: "Schedule a fall tune-up", text: "Book a professional combustion-and-safety check before the first hard freeze to catch issues that homeowners cannot see." },
    ],
  },
  "smart-thermostat-installation-larchmont": {
    name: "How to Install a Smart Thermostat",
    description: "Step-by-step smart thermostat installation for a Westchester home.",
    totalTime: "PT45M",
    steps: [
      { name: "Turn off power at the breaker", text: "Switch off the breaker for the furnace or air handler before removing the existing thermostat. Verify with a non-contact voltage tester." },
      { name: "Photograph the existing wiring", text: "Remove the old thermostat faceplate and take a clear photo of every wire and the terminal it lands on." },
      { name: "Confirm a C-wire is present", text: "Most smart thermostats require a constant 24V common (C) wire. If none is present, install a C-wire adapter at the air handler before mounting the new thermostat." },
      { name: "Mount the new thermostat baseplate", text: "Level the baseplate, mark the holes, drill, and anchor the baseplate to the wall." },
      { name: "Reconnect the wires", text: "Land each wire on the matching terminal of the new thermostat using the photo as reference." },
      { name: "Restore power and configure", text: "Turn the breaker back on, follow the on-screen setup wizard, connect to Wi-Fi, and run a heat and cool test cycle to confirm operation." },
    ],
  },
};

// ---- FAQ extraction (for prerendered FAQPage schema) -------------------
// Mirrors the FAQ data declared in src/lib so AI/LLM crawlers that don't
// execute JS still see structured Q&A. If the source-of-truth FAQ shapes
// in cities.ts / serviceContent.ts / highIntentServices.ts change, the
// regexes below may need to be updated.

function extractTemplateFaqs(body, cityVar) {
  const re = /\{\s*q:\s*`([^`]+)`,\s*a:\s*`([^`]+)`\s*,?\s*\}/g;
  const out = [];
  let m;
  while ((m = re.exec(body)) !== null) out.push({ q: m[1], a: m[2] });
  const token = "${" + cityVar + "}";
  return (city) =>
    out.map((f) => ({
      q: f.q.split(token).join(city),
      a: f.a.split(token).join(city),
    }));
}

function extractStringFaqs(body) {
  const re = /\{\s*q:\s*"((?:[^"\\]|\\.)*)",\s*a:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\}/g;
  const out = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    out.push({
      q: m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
      a: m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
    });
  }
  return out;
}

// City pages share a single baseFaqs(name) template in cities.ts.
async function loadCityFaqsBuilder() {
  const txt = await readSource("lib/cities.ts");
  const m = txt.match(/const\s+baseFaqs\s*=\s*\([^)]*\)\s*=>\s*\[([\s\S]*?)\];/);
  if (!m) return () => [];
  return extractTemplateFaqs(m[1], "name");
}

// Service-city combo pages: each service has `faqs: (c) => [ ... ],`.
async function loadServiceCityFaqBuildersBySlug() {
  const txt = await readSource("lib/serviceContent.ts");
  const map = new Map();
  // Walk each top-level service block.
  const slugRe = /^\s*"([a-z][a-z0-9-]*)":\s*\{([\s\S]*?)\n  \},/gm;
  let m;
  while ((m = slugRe.exec(txt)) !== null) {
    const slug = m[1];
    const block = m[2];
    const faqMatch = block.match(/faqs:\s*\(c\)\s*=>\s*\[([\s\S]*?)\],/);
    if (!faqMatch) continue;
    map.set(slug, extractTemplateFaqs(faqMatch[1], "c"));
  }
  return map;
}

// High-intent service pages: faqs is a static array of double-quoted strings.
async function loadHighIntentFaqsBySlug() {
  const txt = await readSource("lib/highIntentServices.ts");
  const map = new Map();
  // Match each `mk({ ... slug: "x" ... faqs: [ ... ] ... })` block.
  const blockRe = /slug:\s*"([a-z0-9-]+)"[\s\S]*?faqs:\s*\[([\s\S]*?)\],/g;
  let m;
  while ((m = blockRe.exec(txt)) !== null) {
    map.set(m[1], extractStringFaqs(m[2]));
  }
  return map;
}

// Static (non-templated) routes with hand-tuned titles/descriptions.
// Mirrors useSeo() calls in the corresponding page components.
export const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0",
    alternates: { en: "/", es: "/es" },
    title: "HVAC Contractor Westchester County, NY | Bravo Mechanical",
    description: "HVAC repair, installation, emergency service requests, and maintenance for homes and light-commercial properties in Westchester County, NY." },
  { path: "/about", changefreq: "monthly", priority: "0.7",
    title: "About Bravo Mechanical | Local HVAC in Westchester County, NY",
    description: "Bravo Mechanical LLC provides HVAC repair, installation, and maintenance for homes and light-commercial properties in Westchester County, NY." },
  { path: "/services", changefreq: "monthly", priority: "0.9",
    title: "HVAC Services in Westchester County, NY | Bravo Mechanical",
    description: "Full HVAC services in Westchester County: AC repair and installation, boiler service, furnace repair, heat pumps, mini-splits, and indoor air quality." },
  { path: "/service-areas", changefreq: "monthly", priority: "0.8",
    title: "Westchester County HVAC Service Areas | Bravo Mechanical",
    description: "Local HVAC service for cities and towns across Westchester County, NY — Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale and more." },
  { path: "/reviews", changefreq: "monthly", priority: "0.7",
    title: "Customer Reviews | Bravo Mechanical HVAC Westchester County",
    description: "Customer review information for Bravo Mechanical LLC in Westchester County, NY." },
  { path: "/blog", changefreq: "weekly", priority: "0.8",
    title: "HVAC Blog & Guides | Bravo Mechanical Westchester County",
    description: "Practical HVAC guides for Westchester homeowners — boiler costs, heat pump advice, AC troubleshooting, and seasonal maintenance tips." },
  { path: "/contact", changefreq: "monthly", priority: "0.8",
    alternates: { en: "/contact", es: "/es/contacto" },
    title: "Contact Bravo Mechanical HVAC | Westchester County, NY",
    description: "Request HVAC service in Westchester County, NY. Call (914) 361-9142 or send a message to Bravo Mechanical." },
  { path: "/book", changefreq: "monthly", priority: "0.85",
    alternates: { en: "/book", es: "/es/reservar" },
    title: "Book HVAC Service Online | Bravo Mechanical Westchester",
    description: "Pick a day and time window and book your Westchester HVAC visit online — repairs, installs, tune-ups, and estimates. We confirm by text. No phone call needed." },
  { path: "/financing", changefreq: "monthly", priority: "0.7",
    title: "HVAC Financing in Westchester County, NY | Bravo Mechanical",
    description: "Contact Bravo Mechanical to discuss HVAC service options for your Westchester County property." },
  { path: "/maintenance-plans", changefreq: "monthly", priority: "0.7",
    title: "HVAC Maintenance Plans in Westchester County, NY | Bravo Mechanical",
    description: "HVAC maintenance information for Westchester homes and rentals, including seasonal tune-up options." },
  { path: "/projects", changefreq: "weekly", priority: "0.7",
    title: "Recent HVAC Projects in Westchester County, NY | Bravo Mechanical",
    description: "Real photos from recent Bravo Mechanical jobs across Westchester County: boiler replacements, mini-split installs, furnaces, heat pumps, and water heaters — before and after." },
  { path: "/es", changefreq: "monthly", priority: "0.8", lang: "es",
    alternates: { en: "/", es: "/es" },
    title: "Aire Acondicionado y Calefacción en Westchester, NY | Bravo Mechanical — Hablamos Español",
    description: "Reparación e instalación de aire acondicionado, calderas y calefacción en el condado de Westchester, NY. Hablamos español. Llame al (914) 361-9142." },
  { path: "/es/contacto", changefreq: "monthly", priority: "0.7", lang: "es",
    alternates: { en: "/contact", es: "/es/contacto" },
    title: "Contacto en Español | Bravo Mechanical — HVAC en Westchester, NY",
    description: "Pida servicio de aire acondicionado o calefacción en español. Bravo Mechanical atiende todo el condado de Westchester, NY. Llame al (914) 361-9142 o envíe el formulario." },
  { path: "/es/reservar", changefreq: "monthly", priority: "0.7", lang: "es",
    alternates: { en: "/book", es: "/es/reservar" },
    title: "Reservar Cita de HVAC en Línea | Bravo Mechanical Westchester — En Español",
    description: "Elija día y horario y reserve su visita de aire acondicionado o calefacción en Westchester, NY — en español. Le confirmamos por mensaje de texto. Sin llamadas." },
  { path: "/es/emergencia", changefreq: "weekly", priority: "0.75", lang: "es",
    alternates: { en: "/services/emergency-hvac-repair-westchester-county-ny", es: "/es/emergencia" },
    title: "Emergencias de Calefacción y Aire en Westchester, NY | Bravo Mechanical",
    description: "Solicitudes de servicio de emergencia de HVAC en el condado de Westchester, NY — en español. Llame al (914) 361-9142." },
  { path: "/company-facts", changefreq: "monthly", priority: "0.5",
    title: "Company Facts | Bravo Mechanical LLC",
    description: "Company facts for Bravo Mechanical LLC: contact information, Westchester County service area, and HVAC services for homes and light-commercial properties." },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.4",
    title: "Privacy Policy | Bravo Mechanical",
    description: "How Bravo Mechanical LLC collects, uses, and protects your information." },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.4",
    title: "Terms and Conditions | Bravo Mechanical",
    description: "Terms governing use of the Bravo Mechanical website and services." },
];

// Equipment guide pages (src/lib/nySystems.ts). Each guide canonicals to its
// matching money page. They are prerendered for users but sitemap generation
// excludes them so every submitted URL self-canonicalizes.
export const EQUIPMENT_GUIDES = [
  { slug: "gas-boilers", title: "Gas Boilers for Westchester Homes — Buyer's Guide | Bravo Mechanical",
    description: "High-efficiency gas boiler guide for Westchester County, NY: system types, AFUE ratings, brands, and what fits older hydronic homes.",
    canonical: "/services/boiler-installation-westchester-county-ny" },
  { slug: "mini-splits", title: "Ductless Mini-Splits for Westchester Homes — Buyer's Guide | Bravo Mechanical",
    description: "Ductless mini-split guide for Westchester County, NY: cold-climate performance, zoning, brands, and installation advice.",
    canonical: "/services/mini-split-installation-westchester-county-ny" },
  { slug: "heat-pumps", title: "Heat Pumps for Westchester Homes — Buyer's Guide | Bravo Mechanical",
    description: "Air-source heat pump guide for Westchester County, NY: cold-climate ratings, sizing, and what installation really costs.",
    canonical: "/services/heat-pump-installation-westchester-county-ny" },
  { slug: "central-ac", title: "Central Air Conditioning for Westchester Homes — Buyer's Guide | Bravo Mechanical",
    description: "Central AC guide for Westchester County, NY: SEER2 ratings, Manual J sizing, brands, and what installation really costs.",
    canonical: "/services/ac-installation-westchester-county-ny" },
  { slug: "gas-furnaces", title: "Gas Furnaces for Westchester Homes — Buyer's Guide | Bravo Mechanical",
    description: "High-efficiency gas furnace guide for Westchester County, NY: AFUE ratings, venting, brands, and sizing done right.",
    canonical: "/services/furnace-installation-westchester-county-ny" },
  { slug: "water-heaters", title: "Water Heaters for Westchester Homes — Buyer's Guide | Bravo Mechanical",
    description: "Water heater guide for Westchester County, NY: tank vs. tankless vs. heat-pump water heaters, recovery rates, and replacement costs.",
    canonical: "/services/water-heater-installation-westchester-county-ny" },
];

// Routes never to expose in sitemap or prerender.
export const EXCLUDED_PATHS = new Set(["/auth", "/admin/comments", "/admin/crm"]);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function readSource(rel) {
  return readFile(path.join(SRC, rel), "utf8");
}

// ---- Cities ------------------------------------------------------------
export async function loadCities() {
  const txt = await readSource("lib/cities.ts");
  const dataStart = txt.indexOf("const CITY_DATA");
  const dataEnd = txt.indexOf("export const CITIES", dataStart);
  const cityData = dataStart >= 0 && dataEnd > dataStart ? txt.slice(dataStart, dataEnd) : txt;
  const cities = [];
  const matches = [...cityData.matchAll(/^\s{2}"([A-Za-z][A-Za-z .'-]+)":\s*{/gm)];
  const readString = (block, field) => block.match(new RegExp(`${field}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]?.replace(/\\"/g, '"') || "";
  const readArray = (block, field) => {
    const body = block.match(new RegExp(`${field}:\\s*\\[([\\s\\S]*?)\\]`))?.[1] || "";
    return [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((item) => item[1].replace(/\\"/g, '"'));
  };

  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1];
    const block = cityData.slice(matches[i].index, matches[i + 1]?.index ?? cityData.length);
    cities.push({
      name,
      slug: slugify(name),
      zips: readArray(block, "zips"),
      neighborhoods: readArray(block, "neighborhoods"),
      region: readString(block, "region"),
      intro: readString(block, "intro"),
      housing: readString(block, "housing"),
      climateNote: readString(block, "climateNote"),
    });
  }
  return cities;
}

function clipAtWord(value, maxLength) {
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : clipped.length).trim()}…`;
}

export function fitSeoTitle(value, maxLength = 65) {
  const compact = value
    .replace(" | Bravo Mechanical LLC", " | Bravo Mechanical")
    .replace(" | Bravo Mechanical Blog", " | Bravo Mechanical");
  if (compact.length <= maxLength) return compact;

  const brand = " | Bravo Mechanical";
  const topic = compact.split(" | ")[0].replace(/\s+—\s+Hablamos Español$/i, "");
  return `${clipAtWord(topic, maxLength - brand.length)}${brand}`;
}

export function fitMetaDescription(value, maxLength = 160) {
  return clipAtWord(value, maxLength);
}

// ---- Top cities --------------------------------------------------------
export async function loadTopCitySlugs() {
  const txt = await readSource("lib/serviceCityCombos.ts");
  const arrMatch = txt.match(/TOP_CITY_SLUGS\s*=\s*\[([\s\S]*?)\]/);
  if (!arrMatch) return [];
  return [...arrMatch[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

// ---- Service-content slugs (for combo pages) ---------------------------
export async function loadServiceContentSlugs() {
  const txt = await readSource("lib/serviceContent.ts");
  const slugs = [];
  for (const m of txt.matchAll(/^\s*"([a-z][a-z0-9-]*)":\s*\{/gm)) {
    if (!slugs.includes(m[1])) slugs.push(m[1]);
  }
  return slugs;
}

// Returns { slug, title, metaTitle(name), metaDescription(name) }
export async function loadServiceContent() {
  const txt = await readSource("lib/serviceContent.ts");
  const services = [];
  // Find each top-level service entry block.
  const slugRe = /^\s*"([a-z][a-z0-9-]*)":\s*\{[\s\S]*?slug:\s*"([a-z0-9-]+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?metaTitle:\s*\(c\)\s*=>\s*`([^`]+)`,[\s\S]*?metaDescription:\s*\(c\)\s*=>\s*`([^`]+)`/gm;
  let m;
  while ((m = slugRe.exec(txt)) !== null) {
    const [, , slug, title, metaTitleTpl, metaDescTpl] = m;
    services.push({
      slug,
      title,
      metaTitle: (city) => metaTitleTpl.replace(/\$\{c\}/g, city),
      metaDescription: (city) => metaDescTpl.replace(/\$\{c\}/g, city),
    });
  }
  return services;
}

// ---- High-intent service pages -----------------------------------------
export async function loadHighIntentServices() {
  const txt = await readSource("lib/highIntentServices.ts");
  const services = [];
  // Each `mk({ slug: "...", ..., seoTitle: "...", metaDescription: "..." })`
  // or first two literal entries, parsed via a forgiving regex.
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]*?seoTitle:\s*"([^"]+)"[\s\S]*?metaDescription:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    services.push({ slug: m[1], seoTitle: m[2], metaDescription: m[3] });
  }
  return services;
}

// ---- Blog posts (markdown frontmatter) ---------------------------------
export async function loadBlogPosts() {
  const dir = path.join(SRC, "content", "blog");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const posts = [];
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), "utf8");
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) continue;
    const data = {};
    for (const line of match[1].split("\n")) {
      const lm = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (!lm) continue;
      let v = lm[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      data[lm[1]] = v;
    }
    const slug = data.slug || f.replace(/\.md$/, "");
    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || "1970-01-01",
      excerpt: data.excerpt || "",
      city: data.city || "",
      // Full markdown body (after frontmatter) — prerendered into the static
      // HTML so crawlers that don't execute JS see the whole article.
      body: raw.slice(match[0].length).trim(),
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

// ---- Build the full URL catalog ----------------------------------------
export async function buildAllRoutes() {
  const [cities, topCities, serviceSlugs, hiServices, posts, cityFaqs, serviceCityFaqs, hiServiceFaqs, priorityAnswers] =
    await Promise.all([
      loadCities(),
      loadTopCitySlugs(),
      loadServiceContentSlugs(),
      loadHighIntentServices(),
      loadBlogPosts(),
      loadCityFaqsBuilder(),
      loadServiceCityFaqBuildersBySlug(),
      loadHighIntentFaqsBySlug(),
      readSource("content/priorityServiceAnswers.json").then(JSON.parse),
    ]);

  const services = await loadServiceContent();
  const cityByslug = new Map(cities.map((c) => [c.slug, c]));

  const routes = [];

  for (const r of STATIC_ROUTES) {
    const enriched = { ...r, type: "static" };
    if (r.path === "/") enriched.faqs = HOMEPAGE_FAQS;
    routes.push(enriched);
  }

  // City pages
  for (const c of cities) {
    routes.push({
      path: `/service-areas/${c.slug}`,
      changefreq: "monthly",
      priority: topCities.includes(c.slug) ? "0.85" : "0.7",
      title: `HVAC ${c.name}, NY — Heating, Cooling & Repair | ${SITE_NAME}`,
      description: `Local HVAC service in ${c.name}, NY. Heating, cooling, repair, and installation for Westchester County properties. Call ${SITE_PHONE}.`,
      type: "city",
      city: c,
      faqs: cityFaqs(c.name),
    });
  }

  // Equipment guide pages (canonical to their money page where one exists)
  for (const g of EQUIPMENT_GUIDES) {
    routes.push({
      path: `/services/${g.slug}`,
      changefreq: "monthly",
      priority: "0.6",
      title: g.title,
      description: g.description,
      type: "guide",
      canonical: g.canonical ? `${SITE_URL}${g.canonical}` : undefined,
    });
  }

  // High-intent service pages
  for (const s of hiServices) {
    routes.push({
      path: `/services/${s.slug}`,
      changefreq: "monthly",
      priority: "0.9",
      title: s.seoTitle,
      description: s.metaDescription,
      type: "service",
      service: s,
      faqs: hiServiceFaqs.get(s.slug) || [],
      priorityAnswer: priorityAnswers[s.slug],
    });
  }

  // Service-city combo pages
  for (const citySlug of topCities) {
    const c = cityByslug.get(citySlug);
    if (!c) continue;
    for (const sSlug of serviceSlugs) {
      const sc = services.find((s) => s.slug === sSlug);
      if (!sc) continue;
      const faqBuilder = serviceCityFaqs.get(sSlug);
      routes.push({
        path: `/services/${sSlug}/${citySlug}`,
        changefreq: "monthly",
        priority: "0.85",
        title: sc.metaTitle(c.name),
        description: sc.metaDescription(c.name),
        type: "service-city",
        city: c,
        service: sc,
        faqs: faqBuilder ? faqBuilder(c.name) : [],
      });
    }
  }

  // Blog posts
  for (const p of posts) {
    routes.push({
      path: `/blog/${p.slug}`,
      changefreq: "monthly",
      priority: "0.7",
      lastmod: p.date,
      title: `${p.title} | ${SITE_NAME} Blog`,
      description: p.excerpt,
      type: "blog",
      post: p,
      howto: BLOG_HOWTOS[p.slug] || null,
    });
  }

  // Dedupe by path (last wins).
  const byPath = new Map();
  for (const r of routes) {
    if (EXCLUDED_PATHS.has(r.path)) continue;
    byPath.set(r.path, r);
  }
  return [...byPath.values()].map((route) => ({
    ...route,
    title: fitSeoTitle(route.title),
    description: fitMetaDescription(route.description),
  }));
}
