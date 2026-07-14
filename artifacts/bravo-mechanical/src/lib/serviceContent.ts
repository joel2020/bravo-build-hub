// Detailed per-service content used by /services/:serviceSlug/:citySlug combo pages.
// Slugs MUST match SERVICES in src/lib/site.ts.

export type ServiceContent = {
  slug: string;
  title: string;
  shortTitle: string; // for breadcrumbs / compact UI
  h1: (city: string) => string;
  metaTitle: (city: string) => string;
  metaDescription: (city: string) => string;
  intro: (city: string) => string;
  scope: string[]; // "What's included"
  signals: string[]; // "Why Bravo"
  faqs: (city: string) => { q: string; a: string }[];
};

export const SERVICE_CONTENT: Record<string, ServiceContent> = {
  "hvac-installation": {
    slug: "hvac-installation",
    title: "HVAC Installation",
    shortTitle: "Installation",
    h1: (c) => `HVAC Installation in ${c}, NY`,
    metaTitle: (c) => `HVAC Installation ${c}, NY — Furnace, AC & Heat Pump | Bravo Mechanical`,
    metaDescription: (c) =>
      `Professional HVAC installation in ${c}, NY. Furnaces, central AC, heat pumps, ductless mini-splits, and ductwork — sized right, installed clean, code-compliant. Free quotes.`,
    intro: (c) =>
      `When it's time to replace or upgrade your heating or cooling system in ${c}, the install matters more than the brand on the box. Bravo Mechanical sizes every system with a real load calculation, coordinates permit requirements when needed and installs to manufacturer specifications with commissioning checks.`,
    scope: [
      "Gas furnaces and high-efficiency boilers",
      "Central air conditioning systems",
      "Cold-climate heat pumps for year-round comfort",
      "Ductless mini-split systems",
      "Ductwork design, replacement, and zoning",
      "Smart thermostat setup and integration",
    ],
    signals: [
      "Manufacturer-trained installers — not subcontractors",
      "Manual J load calculations on every install",
      "Permits pulled and inspections coordinated",
      "Clean job sites and protected floors",
      "Written fixed pricing before any work begins",
    ],
    faqs: (c) => [
      {
        q: `How much does a new HVAC system cost in ${c}?`,
        a: `Pricing in ${c} depends on system type (furnace, AC, heat pump, ductless), the size of your home, and whether ductwork or electrical upgrades are needed. We give a free written quote after an in-home assessment — no high-pressure sales calls.`,
      },
      {
        q: `How long does installation take?`,
        a: `Most furnace or AC swaps in ${c} take one day. Full system replacements with ductwork or heat pump conversions can take 2–4 days. We give you a clear timeline up front.`,
      },
      {
        q: `Do you pull permits?`,
        a: `When project scope requires a permit, we coordinate with the ${c} building department and schedule required inspections.`,
      },
    ],
  },

  "hvac-repair": {
    slug: "hvac-repair",
    title: "HVAC Repair",
    shortTitle: "Repair",
    h1: (c) => `HVAC Repair in ${c}, NY`,
    metaTitle: (c) => `HVAC Repair ${c}, NY — Same-Day Heating & AC Repair | Bravo Mechanical`,
    metaDescription: (c) =>
      `Fast HVAC repair in ${c}, NY. No-heat, no-cool, refrigerant leaks, blower failures — prompt appointment windows and after-hours support when available. Licensed Westchester techs.`,
    intro: (c) =>
      `When your heat or AC goes out in ${c}, you need a tech on site fast — not a callback in three days. Bravo Mechanical responds quickly and schedules the next available Westchester technician based on urgency and availability. We diagnose clearly, quote in writing before we touch a wrench, and get the system running right the first time.`,
    scope: [
      "No-heat and no-cool emergency calls",
      "Refrigerant leak detection and repair",
      "Blower motor and capacitor replacement",
      "Ignitor, flame sensor, and burner service",
      "Thermostat and control board issues",
      "Condensate leaks and drain line clearing",
    ],
    signals: [
      "Same-day appointments when available",
      "After-hours emergency support when available in ${c}",
      "Flat, written pricing before work begins",
      "Repairs on any make or model",
      "Honest 'repair vs. replace' guidance — no upsell",
    ],
    faqs: (c) => [
      {
        q: `Do you offer same-day HVAC repair in ${c}?`,
        a: `We offer same-day scheduling when open slots are available. For urgent after-hours no-heat or no-cool issues, call and we'll schedule the next available technician.`,
      },
      {
        q: `What does an HVAC repair cost in ${c}?`,
        a: `We charge a flat diagnostic fee, then quote the repair in writing before doing the work. No surprise charges. Most common repairs (capacitors, ignitors, thermostats) are resolved in a single visit.`,
      },
      {
        q: `Will you work on my brand of equipment?`,
        a: `Yes. Our techs are trained on every major brand — Carrier, Trane, Lennox, Goodman, Mitsubishi, Daikin, Bosch, and more. Bring us your make and model and we'll handle it.`,
      },
      {
        q: `When is it time to replace instead of repair?`,
        a: `If your system is 12–15+ years old, repair quotes exceed 30% of replacement cost, or you're losing efficiency every season, replacement usually wins. We'll give you both options in writing — no pressure.`,
      },
    ],
  },

  "preventive-maintenance": {
    slug: "preventive-maintenance",
    title: "Preventive Maintenance",
    shortTitle: "Maintenance",
    h1: (c) => `HVAC Maintenance & Tune-Ups in ${c}, NY`,
    metaTitle: (c) => `HVAC Maintenance ${c}, NY — Tune-Ups & Service Plans | Bravo Mechanical`,
    metaDescription: (c) =>
      `Seasonal HVAC tune-ups and maintenance plans in ${c}, NY. Spring AC and fall heating service that prevents breakdowns, lowers bills, and extends equipment life.`,
    intro: (c) =>
      `Most HVAC breakdowns in ${c} are preventable. A 60-minute tune-up before each season catches the small issues — a weak capacitor, a clogged drain, a low refrigerant charge — before they become a no-heat call in January or a no-cool call in July. Bravo Mechanical's maintenance plans are scheduled automatically and include priority service when you do need a repair.`,
    scope: [
      "Spring AC tune-ups and refrigerant checks",
      "Fall heating tune-ups and combustion analysis",
      "Filter replacement and coil cleaning",
      "Thermostat calibration and battery checks",
      "Safety inspection (CO, gas leaks, electrical)",
      "Annual service plan agreements",
    ],
    signals: [
      "Flat-rate plans — no per-visit surprises",
      "Priority scheduling for plan members",
      "Discounts on parts and repairs",
      "Multi-point checklist on every visit",
      "Reminder system — we book it, you don't have to",
    ],
    faqs: (c) => [
      {
        q: `How often should I service my HVAC system in ${c}?`,
        a: `Twice a year is the sweet spot — once in spring before AC season, once in fall before heating. ${c} winters and humid summers put real stress on equipment, and twice-yearly service usually pays for itself in lower bills and avoided repairs.`,
      },
      {
        q: `What's included in a tune-up?`,
        a: `A multi-point inspection: refrigerant charge, electrical connections, capacitor health, blower performance, drain line, thermostat operation, and a combustion safety check on heating systems. You get a written report after every visit.`,
      },
      {
        q: `Do maintenance plans really save money?`,
        a: `Yes — for most ${c} homeowners. A well-maintained system often runs more consistently, may reduce avoidable breakdowns, and supports long-term equipment condition. Plan details vary by agreement.`,
      },
      {
        q: `Will maintenance keep my warranty valid?`,
        a: `Many manufacturer warranties require documented maintenance. We provide service records for your files.`,
      },
    ],
  },

  "indoor-air-quality": {
    slug: "indoor-air-quality",
    title: "Indoor Air Quality",
    shortTitle: "Air Quality",
    h1: (c) => `Indoor Air Quality Services in ${c}, NY`,
    metaTitle: (c) => `Indoor Air Quality ${c}, NY — Filtration, Purifiers, Humidifiers | Bravo Mechanical`,
    metaDescription: (c) =>
      `Improve your indoor air in ${c}, NY. Whole-home air purifiers, HEPA filtration, humidifiers, dehumidifiers, and ventilation upgrades. Healthier, more comfortable homes.`,
    intro: (c) =>
      `Indoor air in ${c} can be 2–5x more polluted than the air outside — dust, pollen, pet dander, mold spores, and dry winter air all take a toll on comfort and health. Bravo Mechanical designs and installs whole-home air-quality solutions that work with your existing HVAC system: filtration, humidity control, purification, and ventilation, all sized for your home.`,
    scope: [
      "Whole-home air purifiers (UV, ionization, PCO)",
      "HEPA and high-MERV filtration upgrades",
      "Whole-house humidifiers (winter dryness)",
      "Whole-house dehumidifiers (basement humidity)",
      "Fresh-air ventilation (ERV / HRV) systems",
      "Duct cleaning coordination",
    ],
    signals: [
      "We assess your actual air quality, not just sell upgrades",
      "Solutions sized for your home — not one-size-fits-all",
      "Allergy and asthma-friendly recommendations",
      "Quiet, low-maintenance equipment",
      "Integration with your existing HVAC system",
    ],
    faqs: (c) => [
      {
        q: `Do I really need an air purifier in ${c}?`,
        a: `If anyone in your home has allergies, asthma, pets, or sensitivity to dust and pollen — yes, it's a real comfort upgrade. ${c}'s mix of older housing stock, basements, and seasonal pollen makes whole-home filtration especially worthwhile.`,
      },
      {
        q: `What's better — a humidifier or a dehumidifier?`,
        a: `Most ${c} homes need both, just in different seasons. A whole-house humidifier helps with dry winter air (static, cracked skin, respiratory issues). A dehumidifier handles humid summers and damp basements. We assess and recommend what your home actually needs.`,
      },
      {
        q: `Do air purifiers really work?`,
        a: `Yes, when properly sized and installed. We avoid gimmicky add-ons and stick to proven technologies — high-MERV media filtration, true HEPA, UV-C sterilization, and ventilation. We'll explain what each does and what it won't do.`,
      },
      {
        q: `Can you clean my ductwork?`,
        a: `We coordinate professional duct cleaning when it's actually needed — usually after major renovations, water damage, or visible mold. For most homes, a high-quality filter and regular maintenance is more cost-effective than cleaning.`,
      },
    ],
  },

  residential: {
    slug: "residential",
    title: "Residential HVAC",
    shortTitle: "Residential",
    h1: (c) => `Residential HVAC Services in ${c}, NY`,
    metaTitle: (c) => `Residential HVAC ${c}, NY — Whole-Home Heating & Cooling | Bravo Mechanical`,
    metaDescription: (c) =>
      `Residential HVAC service in ${c}, NY. Whole-home heating, cooling, and air-quality solutions for single-family homes, condos, and multi-units. Trusted local techs.`,
    intro: (c) =>
      `Homes in ${c} are not all the same — pre-war colonials, mid-century capes, modern new construction, and condos all need different HVAC approaches. Bravo Mechanical specializes in residential systems for Westchester housing stock. Whether you're adding cooling to a steam-heated home, converting to a heat pump, or replacing an aging furnace, we engineer the solution around your actual house.`,
    scope: [
      "Full system replacements (furnace, AC, heat pump)",
      "Add-on cooling for older homes (high-velocity, ductless)",
      "Zoning systems for multi-floor comfort",
      "Energy-efficient upgrades and high-efficiency installs",
      "Annual maintenance plans",
      "Fast residential repair service",
    ],
    signals: [
      "Experience with Westchester's older housing stock",
      "Solutions for steam, hydronic, forced-air, and ductless homes",
      "Honest sizing — no oversold systems",
      "Clean, respectful in-home work",
      "Trusted by ${c} homeowners",
    ],
    faqs: (c) => [
      {
        q: `My ${c} home doesn't have ducts. Can I add central AC?`,
        a: `Yes — for older ${c} homes without ductwork, we typically recommend either ductless mini-splits (one outdoor unit, multiple indoor heads) or high-velocity small-duct systems that fit through walls and ceilings without major construction. We'll assess your home and explain the trade-offs.`,
      },
      {
        q: `Should I switch from oil or gas to a heat pump?`,
        a: `For many ${c} homes, modern cold-climate heat pumps make sense — they heat and cool in one system and cut fuel deliveries out entirely. But it depends on your insulation, electrical service, and current fuel costs. We give a straight answer either way.`,
      },
      {
        q: `How long do residential HVAC systems last?`,
        a: `Furnaces typically last 15–20 years, central AC 12–15, heat pumps 12–15, and boilers 20–30. ${c}'s humid summers and cold winters are tough on equipment — annual maintenance is what gets you to the upper end of those ranges.`,
      },
      {
        q: `Do you work on condos and multi-units in ${c}?`,
        a: `Yes. We handle condo and multi-family residential work, including coordinating with building management when needed.`,
      },
    ],
  },

  commercial: {
    slug: "commercial",
    title: "Commercial HVAC",
    shortTitle: "Commercial",
    h1: (c) => `Commercial HVAC Services in ${c}, NY`,
    metaTitle: (c) => `Commercial HVAC ${c}, NY — Service Contracts & Repair | Bravo Mechanical`,
    metaDescription: (c) =>
      `Commercial HVAC service in ${c}, NY. Rooftop units, split systems, service contracts, and emergency response for offices, retail, restaurants, and light industrial.`,
    intro: (c) =>
      `For ${c} businesses, HVAC downtime costs revenue. Bravo Mechanical provides commercial HVAC service — preventive maintenance contracts, rooftop unit work, emergency response, and full installations — for offices, retail, restaurants, medical, and light-industrial properties throughout Westchester. We work around your business hours when needed and document everything for your facility records.`,
    scope: [
      "Rooftop unit (RTU) service and replacement",
      "Split and packaged commercial systems",
      "Restaurant kitchen ventilation and make-up air",
      "Service and maintenance contracts (PM agreements)",
      "After-hours and weekend service",
      "Multi-site and multi-unit coordination",
    ],
    signals: [
      "Predictable PM contracts — no surprise budgeting",
      "Priority emergency response for contract customers",
      "Detailed service records for facility management",
      "Experience with retail, office, restaurant, medical",
      "Local Westchester scheduling and on-site service",
    ],
    faqs: (c) => [
      {
        q: `Do you offer commercial HVAC service contracts in ${c}?`,
        a: `Yes — preventive maintenance agreements are a common commercial option. Quarterly or bi-annual visits, priority scheduling, and service documentation are available based on plan terms.`,
      },
      {
        q: `Can you respond after hours for emergency commercial calls?`,
        a: `Yes. Service-contract customers receive priority scheduling. We also take after-hours calls from non-contract ${c} businesses when capacity allows.`,
      },
      {
        q: `What size commercial properties do you service?`,
        a: `From single-tenant retail and small offices up to mid-size commercial buildings with multiple RTUs. For very large industrial sites we'll tell you honestly if we're the right fit.`,
      },
      {
        q: `Do you handle restaurant ventilation?`,
        a: `Yes — including kitchen exhaust, make-up air units, and rooftop equipment. We understand the code and inspection requirements for ${c} food-service operations.`,
      },
    ],
  },
};

export const getServiceContent = (slug?: string) =>
  slug ? SERVICE_CONTENT[slug] : undefined;
