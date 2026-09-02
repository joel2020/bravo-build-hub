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
      `HVAC installation planning in ${c}, NY for furnaces, air conditioning, heat pumps, ductless systems, and ductwork, with a property-specific written scope.`,
    intro: (c) =>
      `For an HVAC installation in ${c}, begin with the building's actual heating and cooling loads, existing distribution, electrical or fuel service, drainage, equipment location, and access. The written proposal should identify the selected equipment, sizing method, approved work, commissioning steps, exclusions, and who is responsible for checking current municipal requirements.`,
    scope: [
      "Gas furnaces and high-efficiency boilers",
      "Central air conditioning systems",
      "Cold-climate heat pumps for year-round comfort",
      "Ductless mini-split systems",
      "Ductwork design, replacement, and zoning",
      "Smart thermostat setup and integration",
    ],
    signals: [
      "Property characteristics documented before equipment selection",
      "Sizing method identified for the proposed system",
      "Airflow, controls, drainage, and startup tasks stated in writing",
      "Municipal and inspection responsibilities confirmed for the approved scope",
      "Project-specific pricing, exclusions, and change terms documented before work",
    ],
    faqs: (c) => [
      {
        q: `How much does a new HVAC system cost in ${c}?`,
        a: `Pricing in ${c} depends on system type (furnace, AC, heat pump, ductless), the size of the building, and whether ductwork or electrical upgrades are needed. Request a written, project-specific proposal after the property assessment.`,
      },
      {
        q: `How long does installation take?`,
        a: `The timeline depends on equipment availability, access, the amount of distribution or utility work, required approvals, inspections, and site conditions. Request a project schedule for the approved ${c} scope.`,
      },
      {
        q: `How are permit responsibilities handled?`,
        a: `Requirements and responsible parties depend on the exact work and current rules. The ${c} proposal should state who will verify, file, pay for, and close any required permits or inspections.`,
      },
    ],
  },

  "hvac-repair": {
    slug: "hvac-repair",
    title: "HVAC Repair",
    shortTitle: "Repair",
    h1: (c) => `HVAC Repair in ${c}, NY`,
    metaTitle: (c) => `HVAC Repair ${c}, NY — Heating & AC Service | Bravo Mechanical`,
    metaDescription: (c) =>
      `HVAC repair in ${c}, NY for no-heat, no-cool, airflow, control, drainage, boiler, furnace, heat-pump, and air-conditioning concerns.`,
    intro: (c) =>
      `When your heat or AC goes out in ${c}, Bravo Mechanical schedules the next available Westchester technician based on urgency and availability. We diagnose the issue, explain the scope, and quote approved work in writing.`,
    scope: [
      "No-heat and no-cool emergency calls",
      "Refrigerant leak detection and repair",
      "Blower motor and capacitor replacement",
      "Ignitor, flame sensor, and burner service",
      "Thermostat and control board issues",
      "Condensate leaks and drain line clearing",
    ],
    signals: [
      "Appointment timing based on urgency and availability",
      "Urgent requests triaged by current conditions and availability",
      "Written pricing before approved work begins",
      "Equipment-specific diagnosis and parts review",
      "Honest 'repair vs. replace' guidance — no upsell",
    ],
    faqs: (c) => [
      {
        q: `How do I request urgent HVAC repair in ${c}?`,
        a: `Call to request the next available technician. Timing depends on weather, call volume, location, and current technician availability.`,
      },
      {
        q: `What does an HVAC repair cost in ${c}?`,
        a: `Diagnostic and repair pricing depends on the equipment and fault. Bravo Mechanical provides the applicable charge and written repair scope before approved work begins.`,
      },
      {
        q: `Will you work on my equipment?`,
        a: `Provide the make, model, age, and symptoms when you call. Bravo Mechanical will confirm serviceability and parts considerations for the specific equipment.`,
      },
      {
        q: `When is it time to replace instead of repair?`,
        a: `Compare property-specific written options when failures repeat, a safety issue cannot be corrected reasonably, needed parts are unavailable, or the equipment no longer serves the building's requirements. Age or a universal cost percentage alone does not decide the result.`,
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
      `HVAC maintenance in ${c}, NY, with equipment-specific inspection scope, documented findings, and project-specific scheduling and plan terms.`,
    intro: (c) =>
      `Maintenance in ${c} can document current safety, airflow, drainage, electrical, and operating-condition issues, but it cannot guarantee future reliability or savings. Confirm the equipment covered, approved tasks, visit timing, records, exclusions, pricing, and any plan terms in writing.`,
    scope: [
      "Equipment and symptoms covered",
      "Applicable safety and electrical checks",
      "Airflow, filter, drain, coil, and control tasks",
      "Measurements and records provided",
      "Excluded work requiring separate approval",
      "Visit, pricing, and renewal terms if a plan is offered",
    ],
    signals: [
      "Current plan or one-time visit availability",
      "Written visit frequency and scope",
      "Scheduling and after-hours terms",
      "Repair pricing and authorization process",
      "Records and manufacturer-document requirements",
    ],
    faqs: (c) => [
      {
        q: `How often should I service my HVAC system in ${c}?`,
        a: `Frequency depends on the equipment, manufacturer guidance, usage, environment, and applicable warranty terms. Confirm the interval for each system in ${c}.`,
      },
      {
        q: `What's included in a tune-up?`,
        a: `The written scope should identify the equipment, inspection and cleaning tasks, measurements, records, exclusions, and any work that requires separate approval.`,
      },
      {
        q: `Do maintenance plans really save money?`,
        a: `Maintenance may identify conditions affecting operation, but savings and future reliability depend on equipment condition, controls, weather, usage, and building load. No specific outcome is guaranteed.`,
      },
      {
        q: `Will maintenance keep my warranty valid?`,
        a: `Warranty requirements differ by manufacturer, model, installer agreement, and claim. Review the applicable documents and confirm which records an approved service visit will provide.`,
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
      `Indoor-air-quality assessment in ${c}, NY for filtration, humidity, ventilation, and source-control options matched to the building and HVAC system.`,
    intro: (c) =>
      `Indoor-air-quality work in ${c} should begin with the specific pollutant, moisture, odor, or comfort concern and its likely source. EPA guidance prioritizes source control and clean-air ventilation; filtration can supplement those measures but cannot remove every pollutant. Any HVAC accessory also needs an equipment-compatibility and airflow review.`,
    scope: [
      "Documented pollutant, moisture, odor, or comfort concern",
      "Source-control and ventilation review",
      "Filter-efficiency and system-airflow compatibility",
      "Humidity measurement and moisture-source review",
      "Equipment-specific humidification or dehumidification options",
      "Operating limits and maintenance requirements for proposed devices",
    ],
    signals: [
      "Concern and likely source defined before equipment selection",
      "Source control, ventilation, and filtration considered separately",
      "No promise that one device removes every pollutant",
      "Ozone-generating products excluded from occupied-space recommendations",
      "Airflow and maintenance effects documented for the existing system",
    ],
    faqs: (c) => [
      {
        q: `Do I need an air cleaner in ${c}?`,
        a: `That depends on the identified concern and source. EPA states that source control and ventilation are primary strategies and that filtration can supplement them, but no air cleaner removes every indoor pollutant.`,
      },
      {
        q: `What's better — a humidifier or a dehumidifier?`,
        a: `Measure humidity and identify moisture sources first. A ${c} property may need neither device, one device, or different controls under different conditions; the HVAC system and building envelope affect the choice.`,
      },
      {
        q: `What can an air filter accomplish?`,
        a: `Performance depends on the pollutants addressed, filter efficiency, airflow through the device, runtime, fit, and maintenance. A filter is not a substitute for correcting a moisture, combustion, or other pollutant source.`,
      },
      {
        q: `Can you clean my ductwork?`,
        a: `First identify the material, source, affected duct section, and any moisture condition. Duct work, remediation, or cleaning should be separately scoped and should not be represented as a universal indoor-air-quality solution.`,
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
      `Residential HVAC service in ${c}, NY for property-specific heating, cooling, distribution, controls, and indoor-air-quality concerns.`,
    intro: (c) =>
      `Residential HVAC choices in ${c} depend on the actual building, equipment, distribution, loads, utilities, controls, and owner priorities. A site assessment can compare repair, replacement, zoning, ducted, ductless, and indoor-air-quality scopes without assuming one configuration fits every home.`,
    scope: [
      "Full system replacements (furnace, AC, heat pump)",
      "Add-on cooling for older homes (high-velocity, ductless)",
      "Zoning systems for multi-floor comfort",
      "Energy-efficient upgrades and high-efficiency installs",
      "Annual maintenance plans",
      "Residential repair scheduling subject to current availability",
    ],
    signals: [
      "Existing equipment and distribution documented before recommendations",
      "Solutions for steam, hydronic, forced-air, and ductless homes",
      "Honest sizing — no oversold systems",
      "Clean, respectful in-home work",
      "Written, property-specific scope before approved work",
    ],
    faqs: (c) => [
      {
        q: `My ${c} home doesn't have ducts. Can I add central AC?`,
        a: `Ductless, small-duct, or new conventional ductwork may be possible, depending on loads, routing, structure, electrical capacity, drainage, exterior placement, and current requirements. Compare a site-specific design before selecting a system.`,
      },
      {
        q: `Should I switch from oil or gas to a heat pump?`,
        a: `The answer depends on the building loads, distribution, electrical service, selected equipment performance, backup strategy, fuel arrangement, and owner goals. Model the proposed ${c} application rather than assuming a universal conversion result.`,
      },
      {
        q: `How long do residential HVAC systems last?`,
        a: `Service life varies with equipment, design, installation, operation, environment, maintenance history, and parts availability. Inspect the specific ${c} system and compare current condition rather than relying on a universal age range.`,
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
      `Commercial HVAC requests in ${c}, NY for rooftop, split, packaged, ventilation, repair, replacement, and maintenance scopes, subject to equipment and availability.`,
    intro: (c) =>
      `Commercial HVAC work in ${c} starts by identifying the equipment, spaces served, responsible contacts, access, operating constraints, records, and requested outcome. Confirm current serviceability, scheduling, included work, reporting, and any after-hours terms for the property in writing.`,
    scope: [
      "Rooftop unit (RTU) service and replacement",
      "Split and packaged commercial systems",
      "Restaurant kitchen ventilation and make-up air",
      "Service and maintenance contracts (PM agreements)",
      "After-hours or weekend scheduling when currently available and agreed",
      "Multi-site and multi-unit coordination",
    ],
    signals: [
      "Agreement-specific maintenance scope and pricing",
      "Urgent request handling subject to current capacity and written terms",
      "Requested service records identified before work",
      "Equipment and occupancy suitability confirmed during intake",
      "Access and shutdown coordination defined for the site",
    ],
    faqs: (c) => [
      {
        q: `Do you offer commercial HVAC service contracts in ${c}?`,
        a: `Maintenance-agreement availability, visit frequency, scheduling terms, included equipment, documentation, exclusions, and pricing must be confirmed in the current written plan for the property.`,
      },
      {
        q: `Can you respond after hours for emergency commercial calls?`,
        a: `Ask which scheduling terms apply to the current service agreement. Urgent and after-hours availability for ${c} businesses depends on current capacity and the written service terms.`,
      },
      {
        q: `What size commercial properties do you service?`,
        a: `Provide the property use, equipment inventory, capacities, access, controls, requested work, and operating constraints. Bravo Mechanical can then confirm whether the specific ${c} scope is serviceable.`,
      },
      {
        q: `Do you handle restaurant ventilation?`,
        a: `Describe the exhaust, make-up air, comfort equipment, controls, current approvals, and reported problem. Serviceability and any professional or municipal responsibilities must be confirmed for the exact ${c} scope.`,
      },
    ],
  },
};

export const getServiceContent = (slug?: string) =>
  slug ? SERVICE_CONTENT[slug] : undefined;
