// Shared route + metadata catalog used by build-time SEO scripts.
// Local landing records are read from the reviewed JSON source; selected legacy
// route metadata is still extracted from TypeScript until those modules migrate.
// If you add a new route type, update the sitemap and metadata injectors too.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APPROVED_SERVICE_AREAS,
  SERVICE_AREA_SUMMARY,
  getCityServiceDestinations,
} from "../src/lib/localPageModel.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

export const SITE_URL = "https://www.bravomechanicalny.com";
export const SITE_NAME = "Bravo Mechanical";
export const SITE_LEGAL = "Bravo Mechanical LLC";
export const SITE_PHONE = "(914) 361-9142";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// Curated homepage FAQ — kept in sync with public/llms.txt. Surfaced as
// FAQPage schema in dist/public/index.html so Google AI Overviews and
// LLM crawlers (which often skip JS-rendered FAQ blocks) can cite us
// directly without rendering the React tree.
export const HOMEPAGE_FAQS = [
  {
    q: "What areas does Bravo Mechanical serve?",
    a: `${SERVICE_AREA_SUMMARY} The published service-area directory lists ${APPROVED_SERVICE_AREAS.map(({ name }) => name).join(", ")}. Confirm availability for the specific address when requesting service.`,
  },
  {
    q: "What license number does Bravo Mechanical list?",
    a: "Bravo Mechanical lists HVAC license #8822. Customers should confirm the municipal credential and permit requirements that apply to their project before work begins.",
  },
  {
    q: "Does Bravo Mechanical offer 24/7 emergency HVAC service?",
    a: "Bravo Mechanical accepts 24/7 emergency heating and cooling service requests in Westchester County. Call (914) 361-9142 to discuss availability. If you smell gas or suspect a gas leak, leave the area immediately. Once safely away, call 911 or your gas utility before seeking HVAC service.",
  },
  {
    q: "How is an HVAC installation estimate prepared?",
    a: "Installation scope depends on building load, equipment type, ductwork or piping, fuel source, electrical requirements, venting, controls, and permits. Bravo Mechanical reviews the property and prepares project-specific options.",
  },
  {
    q: "What is Bravo Mechanical's current Google rating?",
    a: "Bravo Mechanical's public Google Business Profile shows a 5.0 out of 5 rating from 16 reviews as of August 17, 2026. Ratings and review counts can change.",
  },
  {
    q: "Should I repair or replace my HVAC system?",
    a: "A common rule of thumb is the 50% rule: if the repair cost exceeds 50% of replacement cost, or if the system is older than 12 to 15 years and breaking down repeatedly, replacement is usually more cost-effective. ENERGY STAR recommends replacing furnaces older than 15 years and central AC older than 10 years for meaningful efficiency gains.",
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
// High-intent service pages still declare their FAQ data in TypeScript. City
// and service-city routes load reviewed FAQ records directly from JSON below.

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

// High-intent service pages: faqs is a static array of double-quoted strings.
function loadHighIntentFaqsBySlug() {
  const txt = readSourceSync("lib/highIntentServices.ts");
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
    description: "Bravo Mechanical is a local HVAC contractor in Westchester County, NY for AC repair, AC installation, furnace repair, boiler repair, heat pumps, and maintenance plans." },
  { path: "/about", changefreq: "monthly", priority: "0.7",
    title: "About Bravo Mechanical | Local HVAC in Westchester County, NY",
    description: "Bravo Mechanical LLC is a licensed Westchester HVAC contractor focused on honest sizing, clear written quotes, and dependable installs." },
  { path: "/services", changefreq: "monthly", priority: "0.9",
    title: "HVAC Services in Westchester County, NY | Bravo Mechanical",
    description: "HVAC service options for listed Westchester communities: AC repair and installation, boiler service, furnace repair, heat pumps, mini-splits, and indoor air quality." },
  { path: "/service-areas", changefreq: "monthly", priority: "0.8",
    title: "Westchester County HVAC Service Areas | Bravo Mechanical",
    description: `Local HVAC service for ${APPROVED_SERVICE_AREAS.length} listed Westchester County communities, including Yonkers, White Plains, New Rochelle, Mount Vernon, and Scarsdale.` },
  { path: "/reviews", changefreq: "monthly", priority: "0.7",
    title: "Customer Reviews | Bravo Mechanical HVAC Westchester County",
    description: "Read recent customer reviews of Bravo Mechanical LLC, a 5.0-rated HVAC contractor serving Westchester County, NY." },
  { path: "/blog", changefreq: "weekly", priority: "0.8",
    title: "HVAC Blog & Guides | Bravo Mechanical Westchester County",
    description: "Practical HVAC guides for Westchester homeowners — boiler costs, heat pump advice, AC troubleshooting, and seasonal maintenance tips." },
  { path: "/contact", changefreq: "monthly", priority: "0.8",
    alternates: { en: "/contact", es: "/es/contacto" },
    title: "Contact Bravo Mechanical HVAC | Westchester County, NY",
    description: "Request an HVAC estimate or schedule service in Westchester County, NY. Call (914) 361-9142 or send a message online." },
  { path: "/book", changefreq: "monthly", priority: "0.85",
    alternates: { en: "/book", es: "/es/reservar" },
    title: "Book HVAC Service Online | Bravo Mechanical Westchester",
    description: "Pick a day and time window and book your Westchester HVAC visit online — repairs, installs, tune-ups, and estimates. We confirm by text. No phone call needed." },
  { path: "/financing", changefreq: "monthly", priority: "0.7",
    title: "HVAC Financing in Westchester County, NY | Bravo Mechanical",
    description: "Spread the cost of a new boiler, furnace, AC, or heat pump. Financing options for qualified Westchester homeowners; request project-specific terms." },
  { path: "/maintenance-plans", changefreq: "monthly", priority: "0.7",
    title: "HVAC Maintenance Plans in Westchester County, NY | Bravo Mechanical",
    description: "HVAC maintenance options for Westchester homes and rentals, with project-specific visit scope, scheduling, and written service records." },
  { path: "/projects", changefreq: "weekly", priority: "0.7",
    title: "Recent HVAC Projects in Westchester County, NY | Bravo Mechanical",
    description: "Real photos from recent Bravo Mechanical jobs across Westchester County: boiler replacements, mini-split installs, furnaces, heat pumps, and water heaters — before and after." },
  { path: "/es", changefreq: "monthly", priority: "0.8", lang: "es",
    alternates: { en: "/", es: "/es" },
    title: "Aire Acondicionado y Calefacción en Westchester, NY | Bravo Mechanical — Hablamos Español",
    description: "Reparación e instalación de aire acondicionado, calderas, calefacción y calentadores de agua en el condado de Westchester, NY. Hablamos español. Emergencias 24/7. Llame al (914) 361-9142." },
  { path: "/es/contacto", changefreq: "monthly", priority: "0.7", lang: "es",
    alternates: { en: "/contact", es: "/es/contacto" },
    title: "Contacto en Español | Bravo Mechanical — HVAC en Westchester, NY",
    description: `Pida servicio de aire acondicionado o calefacción en español en las ${APPROVED_SERVICE_AREAS.length} comunidades de Westchester enumeradas por Bravo Mechanical. Llame al (914) 361-9142.` },
  { path: "/es/reservar", changefreq: "monthly", priority: "0.7", lang: "es",
    alternates: { en: "/book", es: "/es/reservar" },
    title: "Reservar Cita de HVAC en Línea | Bravo Mechanical Westchester — En Español",
    description: "Elija día y horario y reserve su visita de aire acondicionado o calefacción en Westchester, NY — en español. Le confirmamos por mensaje de texto. Sin llamadas." },
  { path: "/es/emergencia", changefreq: "weekly", priority: "0.75", lang: "es",
    alternates: { en: "/services/emergency-hvac-repair-westchester-county-ny", es: "/es/emergencia" },
    title: "Emergencias de Calefacción y Aire 24/7 en Westchester, NY | Bravo Mechanical",
    description: "Servicio de emergencia de HVAC 24/7 en el condado de Westchester, NY — en español. Sin calefacción, sin aire, fugas de gas. Llame ahora al (914) 361-9142." },
  { path: "/company-facts", changefreq: "monthly", priority: "0.5",
    title: "Company Facts | Bravo Mechanical LLC",
    description: "Public reference page for Bravo Mechanical LLC — service areas, licensing notes, and how to verify our HVAC business in Westchester County, NY." },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.4",
    title: "Privacy Policy | Bravo Mechanical",
    description: "How Bravo Mechanical LLC collects, uses, and protects your information." },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.4",
    title: "Terms and Conditions | Bravo Mechanical",
    description: "Terms governing use of the Bravo Mechanical website and services." },
];

// Equipment guide pages (src/lib/nySystems.ts). These were previously missing
// from the sitemap AND competing with the matching money pages for the same
// queries. Each guide canonicals to its money page so the money page wins;
// water-heaters has no money page yet and stays self-canonical.
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

function readSourceSync(rel) {
  return readFileSync(path.join(SRC, rel), "utf8");
}

function loadLocalLandingPagesSync() {
  const raw = readFileSync(path.join(SRC, "content/localLandingPages.json"), "utf8");
  return JSON.parse(raw);
}

export async function loadLocalLandingPages() {
  return loadLocalLandingPagesSync();
}

function toRouteCity(content) {
  return {
    slug: content.slug,
    name: content.name,
    zips: content.zips,
    neighborhoods: content.neighborhoods,
    region: content.region,
    intro: content.answerFirst,
    housing: content.localContext[0] || "",
    climateNote: content.localContext[1] || "",
    content,
  };
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

// ---- High-intent service pages -----------------------------------------
const PRIORITY_SERVICE_CRAWLER_COPY = {
  "ac-repair-westchester-county-ny": {
    description: "AC repair in Westchester County for no-cool, airflow, icing, thermostat, and condenser problems. Request a diagnosis and written repair options.",
    directAnswer: "If an AC runs without cooling, check the thermostat, filter, vents, breaker once, outdoor unit, visible ice, and condensate pan. Leave it off if a breaker trips again, ice returns, water threatens the building, or the outdoor unit buzzes without starting.",
    symptoms: ["Warm air or weak airflow", "Ice on tubing or the indoor coil", "A breaker that trips again", "Water near the air handler", "Buzzing, clicking, or an outdoor fan that will not start"],
    process: ["Record the equipment make, model, symptoms, and error codes", "Complete electrical, airflow, and refrigerant-system diagnosis", "Review a written repair scope", "Verify operation after approved work"],
    guidance: "Repair or replacement depends on the failed component, repair history, refrigerant type, safety, parts availability, current performance, and the project-specific costs.",
  },
  "boiler-repair-westchester-county-ny": {
    description: "Boiler repair in Westchester County for no-heat, pressure, circulation, ignition, and control problems. Request safety-first diagnosis and written options.",
    directAnswer: "A boiler with no heat, repeated lockouts, pressure loss, leaking relief components, or unusual combustion symptoms should be diagnosed rather than repeatedly reset.",
    symptoms: ["No heat or uneven heat", "Pressure loss", "Water around the boiler", "Banging or kettling sounds", "Repeated ignition lockouts"],
    process: ["Identify the fuel and boiler type", "Check safety controls, combustion, circulation, and operating pressure", "Document the fault and proposed scope", "Verify safe operation after approved work"],
    guidance: "Repair is often practical for an isolated serviceable fault. Structural leaks, safety concerns, repeated failures, unavailable parts, and total repair cost can justify replacement planning.",
  },
  "heat-pump-installation-westchester-county-ny": {
    description: "Cold-climate heat pump installation in Westchester County, NY. Building load, distribution, electrical capacity, controls, and backup strategy shape the design.",
    directAnswer: "A Westchester heat-pump design should start with the building load and local design temperature, then match equipment capacity, distribution, electrical requirements, controls, and any backup heat strategy.",
    symptoms: ["Aging heating and cooling equipment", "Interest in electrification", "Uneven comfort", "Need for zoned heating and cooling", "Electrical or distribution constraints that require review"],
    process: ["Assess building load and existing systems", "Review ducted, ductless, hybrid, and electrical options", "Prepare a project-specific scope", "Install, commission, and explain controls"],
    guidance: "The right configuration depends on the property. Some buildings can use a heat pump as the primary system; others benefit from dual-fuel or auxiliary heat.",
  },
  "emergency-hvac-repair-westchester-county-ny": {
    description: "Request 24/7 emergency HVAC dispatch in Westchester County for urgent no-heat, no-cool, water, or equipment safety concerns. Availability varies.",
    directAnswer: "Call (914) 361-9142 for an urgent HVAC request. Dispatch timing depends on weather, call volume, location, and technician availability. For a suspected gas leak, active fire, smoke, or carbon-monoxide alarm, leave the building and call 911 or the gas utility from a safe location.",
    symptoms: ["No heat during freezing weather", "No cooling during extreme heat", "Water near HVAC equipment", "Repeated breaker trips", "Burning odors, smoke, sparks, gas odor, or a carbon-monoxide alarm"],
    process: ["Describe the address, equipment, symptoms, error codes, and hazards", "Confirm current dispatch availability", "Complete safety-first diagnosis when dispatched", "Review repair, stabilization, or replacement options"],
    guidance: "Do not operate switches or use a flame when gas is suspected. Do not keep resetting a breaker. Keep clear of water near electrical equipment.",
  },
};

function loadHighIntentServicesSync() {
  const txt = readSourceSync("lib/highIntentServices.ts");
  const services = [];
  // Each `mk({ slug: "...", ..., seoTitle: "...", metaDescription: "..." })`
  // or first two literal entries, parsed via a forgiving regex.
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]*?seoTitle:\s*"([^"]+)"[\s\S]*?metaDescription:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const crawlerCopy = PRIORITY_SERVICE_CRAWLER_COPY[m[1]];
    services.push({ slug: m[1], seoTitle: m[2], metaDescription: crawlerCopy?.description || m[3], crawlerCopy });
  }
  return services;
}

export async function loadHighIntentServices() {
  return loadHighIntentServicesSync();
}

function loadPriorityServiceOverridesSync() {
  return JSON.parse(readSourceSync("lib/priorityServiceOverrides.json"));
}

export async function loadPriorityServiceOverrides() {
  return loadPriorityServiceOverridesSync();
}

// ---- Blog posts (markdown frontmatter) ---------------------------------
const FULL_BODY_PRERENDER_SLUGS = new Set([
  "furnace-smells-like-burning-westchester",
  "why-is-my-ac-not-cooling-westchester",
  "boiler-repair-vs-replacement-westchester",
  "heat-pump-estimate-checklist-westchester",
  "merv-8-11-13-air-filter-westchester",
]);

function loadBlogPostsSync() {
  const dir = path.join(SRC, "content", "blog");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const posts = [];
  for (const f of files) {
    const raw = readFileSync(path.join(dir, f), "utf8");
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
      // Public blog images have stable, crawlable URLs in initial HTML and metadata.
      cover: /^\/images\/blog\/[a-z0-9-]+\.webp$/.test(data.cover || "") ? data.cover : null,
      coverSmall: /^\/images\/blog\/[a-z0-9-]+\.webp$/.test(data.coverSmall || "") ? data.coverSmall : null,
      coverAlt: data.coverAlt || data.title || slug,
      coverCaption: data.coverCaption || "",
      coverWidth: Number(data.coverWidth) || 1600,
      coverHeight: Number(data.coverHeight) || 900,
      // Full markdown body (after frontmatter) — prerendered into the static
      // HTML so crawlers that don't execute JS see the whole article.
      body: FULL_BODY_PRERENDER_SLUGS.has(slug) ? raw.slice(match[0].length).trim() : "",
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export async function loadBlogPosts() {
  return loadBlogPostsSync();
}

// ---- Build the full URL catalog ----------------------------------------
function assertApprovedServiceAreaInventory(dataset) {
  const approvedBySlug = new Map(APPROVED_SERVICE_AREAS.map((area) => [area.slug, area.name]));
  for (const [slug, name] of approvedBySlug) {
    const record = dataset.cities?.[slug];
    if (!record) throw new Error(`Missing approved service-area record: ${slug}`);
    if (record.name !== name) throw new Error(`Approved service-area ${slug} must use name ${name}`);
  }
  for (const slug of Object.keys(dataset.cities || {})) {
    if (!approvedBySlug.has(slug)) throw new Error(`Unapproved service-area record: ${slug}`);
  }
}

export function buildAllRoutesSync({ localDataset } = {}) {
  const dataset = localDataset ?? loadLocalLandingPagesSync();
  assertApprovedServiceAreaInventory(dataset);
  const hiServices = loadHighIntentServicesSync();
  const posts = loadBlogPostsSync();
  const hiServiceFaqs = loadHighIntentFaqsBySlug();
  const priorityOverrides = loadPriorityServiceOverridesSync();
  const cities = Object.values(dataset.cities);
  const serviceCities = Object.values(dataset.serviceCities);
  const topCities = new Set(serviceCities.map((page) => page.citySlug));

  const routes = [];

  for (const r of STATIC_ROUTES) {
    const enriched = { ...r, type: "static" };
    if (r.path === "/") enriched.faqs = HOMEPAGE_FAQS;
    routes.push(enriched);
  }

  // City pages
  for (const content of cities) {
    const city = toRouteCity(content);
    const serviceDestinations = getCityServiceDestinations(
      city,
      serviceCities.filter((page) => page.citySlug === city.slug),
    );
    routes.push({
      path: `/service-areas/${city.slug}`,
      changefreq: "monthly",
      priority: topCities.has(city.slug) ? "0.85" : "0.7",
      title: content.title,
      description: content.metaDescription,
      type: "city",
      city,
      faqs: content.faqItems,
      localContent: content,
      serviceDestinations,
    });
  }

  // High-intent service pages
  for (const s of hiServices) {
    const resolvedService = { ...s, ...(priorityOverrides[s.slug] || {}) };
    routes.push({
      path: `/services/${s.slug}`,
      changefreq: "monthly",
      priority: "0.9",
      title: resolvedService.seoTitle,
      description: resolvedService.metaDescription,
      type: "service",
      service: resolvedService,
      faqs: resolvedService.faqs || hiServiceFaqs.get(s.slug) || [],
    });
  }

  // Service-city combo pages
  for (const [key, content] of Object.entries(dataset.serviceCities)) {
    const cityContent = dataset.cities[content.citySlug];
    if (!cityContent) throw new Error(`Service-city ${key} references missing city: ${content.citySlug}`);
    routes.push({
      path: `/services/${content.serviceSlug}/${content.citySlug}`,
      changefreq: "monthly",
      priority: "0.85",
      title: content.metaTitle,
      description: content.metaDescription,
      type: "service-city",
      city: toRouteCity(cityContent),
      service: {
        slug: content.serviceSlug,
        title: content.serviceTitle,
        shortTitle: content.shortTitle,
      },
      faqs: content.faqItems,
      localContent: content,
    });
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

export async function buildAllRoutes() {
  return buildAllRoutesSync();
}
