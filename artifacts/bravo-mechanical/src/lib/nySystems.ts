import jobMitsubishi from "@/assets/job-mitsubishi-install.webp";
import jobBoiler from "@/assets/job-boiler-install.webp";
import jobWaterHeater from "@/assets/job-water-heater.webp";
import jobOilTank from "@/assets/job-oil-tank.webp";
import jobRadiator from "@/assets/job-radiator-repair.webp";
import jobMiniSplit from "@/assets/job-mini-split-exterior.webp";
import jobExteriorWhite from "@/assets/job-exterior-white-house.webp";
import jobBoilerBefore from "@/assets/job-boiler-before.jpeg";
import jobBoilerAfter from "@/assets/job-boiler-after.jpeg";
import jobGasFurnace from "@/assets/job-gas-furnace.jpg";
import heroTechnician from "@/assets/hero-technician.webp";

export type NYSystem = {
  slug: string;
  card: {
    img: string;
    alt: string;
    title: string;
    desc: string;
    best: string;
  };
  page: {
    eyebrow: string;
    title: string;
    subtitle: string;
    metaDescription: string;
    overview: string[];
    gallery: { src: string; alt: string }[];
    faqs: { q: string; a: string }[];
  };
};

export const NY_SYSTEMS: NYSystem[] = [
  {
    slug: "gas-boilers",
    card: {
      img: jobBoilerAfter,
      alt: "High-efficiency gas boiler installation in a Westchester home basement",
      title: "High-efficiency gas boilers",
      desc: "The workhorse of NY winters. Modern condensing boilers (Weil-McLain, Navien, Buderus) deliver 90%+ AFUE efficiency for hydronic baseboard and radiator systems common in older Westchester homes.",
      best: "Best for: existing hot-water heat, multi-family, oversized older homes",
    },
    page: {
      eyebrow: "NY Homeowner Guide",
      title: "High-efficiency gas boiler installation in Westchester County",
      subtitle: "Modern condensing boilers built for hydronic baseboard and radiator systems common across older NY homes.",
      metaDescription: "High-efficiency gas boiler installation in Westchester County, NY. Weil-McLain, Navien, and Buderus condensing boilers with 90%+ AFUE for older hydronic homes.",
      overview: [
        "Older Westchester homes were built around hot-water heat — cast-iron radiators or fin-tube baseboard fed by a basement boiler. When those boilers age out (typically 20-30 years), upgrading to a modern condensing boiler is the highest-impact heating investment most NY homeowners can make.",
        "We install Weil-McLain, Navien, and Buderus condensing boilers rated 90-96% AFUE. They modulate output to match real-time demand, cutting fuel use 20-40% compared to older atmospheric units while keeping the same radiators and piping you already have.",
        "Every install includes proper venting, near-boiler piping rebuilt to spec, and combustion analysis at start-up — not just a swap-and-go.",
      ],
      gallery: [
        { src: jobBoilerAfter, alt: "New Weil-McLain condensing gas boiler installation" },
        { src: jobBoilerBefore, alt: "Old gas boiler before replacement" },
        { src: jobRadiator, alt: "Hydronic radiator system serviced by Bravo Mechanical" },
        { src: jobOilTank, alt: "Near-boiler piping with gauges and circulator" },
      ],
      faqs: [
        { q: "How long does a boiler installation take?", a: "Most residential boiler replacements take 1-2 days. We typically remove the old unit, rebuild near-boiler piping, install and vent the new boiler, and restart the system in a single visit when conditions allow." },
        { q: "Will a new boiler work with my existing radiators?", a: "Yes. Modern condensing boilers are designed to retrofit into existing baseboard and radiator systems. We verify your distribution capacity during the estimate." },
        { q: "What size boiler do I need?", a: "We perform a heat-loss calculation (Manual J) for your home rather than guessing by square footage. Oversized boilers short-cycle, waste fuel, and shorten equipment life." },
        { q: "How much does a new gas boiler cost in Westchester?", a: "Most full residential boiler replacements in our area run $9,000-$16,000 depending on size, venting, and piping work. We provide written, itemized estimates before any work begins." },
      ],
    },
  },
  {
    slug: "mini-splits",
    card: {
      img: jobMitsubishi,
      alt: "Mitsubishi ductless mini-split heat pump exterior unit",
      title: "Ductless mini-split heat pumps",
      desc: "Mitsubishi and Daikin cold-climate heat pumps now heat efficiently down to -13°F. Ideal for homes without ductwork, additions, and finished basements or attics.",
      best: "Best for: zoned comfort, no-duct retrofits, all-electric heating and cooling",
    },
    page: {
      eyebrow: "NY Homeowner Guide",
      title: "Ductless mini-split heat pump installation in Westchester County",
      subtitle: "Mitsubishi and Daikin cold-climate heat pumps that heat efficiently down to -13°F.",
      metaDescription: "Ductless mini-split heat pump installation in Westchester County, NY. Cold-climate Mitsubishi and Daikin systems installed by licensed local techs.",
      overview: [
        "Ductless mini-splits are the easiest way to add efficient heating and cooling to a home that doesn't have ductwork — older Cape Cods, Tudors, additions, finished basements, sunrooms, and attics. One outdoor condenser can feed up to eight indoor heads, each with its own thermostat.",
        "Today's cold-climate inverter heat pumps from Mitsubishi (Hyper-Heat) and Daikin (Aurora) keep full heating capacity down to 5°F and continue to operate at -13°F, making them practical primary heat for most Westchester homes.",
        "We are factory-trained on Mitsubishi Diamond and handle line-set routing carefully so the install looks intentional, not bolted on.",
      ],
      gallery: [
        { src: jobMitsubishi, alt: "Mitsubishi ductless mini-split exterior install" },
        { src: jobMiniSplit, alt: "Cold-climate heat pump condenser mounted outside a NY home" },
        { src: jobExteriorWhite, alt: "Mini-split line set neatly run along exterior siding" },
      ],
      faqs: [
        { q: "Will a mini-split actually heat my home in January?", a: "Yes — modern cold-climate units are rated for full heating capacity at 5°F and continue to operate at -13°F. We size based on your home's heat loss to make sure capacity matches the coldest week of the year." },
        { q: "How many indoor heads can one outdoor unit support?", a: "Multi-zone outdoor condensers can support 2-8 indoor heads. We design the system around your room-by-room needs, not the manufacturer's maximum." },
        { q: "Are mini-splits noisy?", a: "Indoor heads run at 19-30 dB on low — quieter than a whisper. Outdoor units are designed to sit close to the house without disturbing neighbors." },
        { q: "Can I use mini-splits with my existing furnace?", a: "Yes. Many Westchester homeowners run mini-splits as primary heat and keep the furnace as backup for the coldest snaps. This dual-fuel setup delivers efficient everyday heat while keeping a safety net." },
      ],
    },
  },
  {
    slug: "heat-pumps",
    card: {
      img: jobMiniSplit,
      alt: "Whole-home air-source heat pump exterior condenser",
      title: "Whole-home air-source heat pumps",
      desc: "Centrally-ducted heat pumps replace traditional AC + furnace combos with one all-electric system that heats and cools all year.",
      best: "Best for: full electrification, ducted homes, long-term energy savings",
    },
    page: {
      eyebrow: "NY Homeowner Guide",
      title: "Whole-home air-source heat pump installation in Westchester County",
      subtitle: "All-electric ducted heat pumps that replace your furnace and AC with one efficient system.",
      metaDescription: "Whole-home air-source heat pump installation in Westchester County, NY. Ducted electric systems sized and commissioned by licensed local techs.",
      overview: [
        "If your home already has ductwork, a centrally-ducted air-source heat pump can replace both your AC condenser and your furnace with a single all-electric system. One piece of outdoor equipment, one indoor air handler, even temperatures all year.",
        "We install variable-speed cold-climate systems from Carrier, Trane, and Mitsubishi that hold capacity down to 5°F. Most Westchester homes can run heat pump-only with no backup; for the very coldest installs we add a small electric or dual-fuel backup.",
        "One system to maintain instead of two, no combustion in the house, and steady low-and-slow heat that avoids the temperature swings of a cycling furnace.",
      ],
      gallery: [
        { src: jobMiniSplit, alt: "Whole-home air-source heat pump outdoor condenser" },
        { src: jobExteriorWhite, alt: "Heat pump install on a Westchester home exterior" },
        { src: jobMitsubishi, alt: "Variable-speed heat pump equipment" },
      ],
      faqs: [
        { q: "Can a heat pump really replace my furnace?", a: "For most Westchester homes, yes. Modern cold-climate ducted heat pumps maintain full output well below freezing. We model your heat loss against the heat pump's performance curve before recommending heat-pump-only vs. dual-fuel." },
        { q: "Will my electric bill go up?", a: "Yes — but your gas or oil bill goes away. Most homeowners see 10-30% lower total energy costs after switching, especially with ENERGY STAR equipment." },
        { q: "Do I need new ductwork?", a: "Often the existing ducts work fine. We test static pressure and airflow as part of the estimate; if modifications are needed we include them in writing up front." },
        { q: "How long does installation take?", a: "Most whole-home heat pump installs take 2-3 days, including removing the old equipment, electrical work, refrigerant lines, and full commissioning." },
      ],
    },
  },
  {
    slug: "central-ac",
    card: {
      img: heroTechnician,
      alt: "Outdoor central air conditioning condenser unit",
      title: "Central air conditioning",
      desc: "Carrier, Lennox, and Trane condensers paired with matched coils keep humidity low through July and August. We size to Manual J — never just by square footage — to avoid short-cycling.",
      best: "Best for: existing forced-air homes, whole-house cooling",
    },
    page: {
      eyebrow: "NY Homeowner Guide",
      title: "Central air conditioning installation in Westchester County",
      subtitle: "Properly sized Carrier, Lennox, and Trane systems that keep Westchester homes cool and dry through humid summers.",
      metaDescription: "Central air conditioning installation in Westchester County, NY. Carrier, Lennox, and Trane systems sized to Manual J for efficient summer cooling.",
      overview: [
        "Westchester summers bring 90°F days and high dew points. A correctly-sized central AC system pulls humidity out of the air as it cools — but oversized systems short-cycle, leave the house clammy, and wear out faster.",
        "We install Carrier, Lennox, and Trane condensers paired with matched indoor coils and properly-sized line sets. Every install includes a Manual J load calculation rather than rule-of-thumb sizing.",
        "We also handle full system replacements when an aging AC is paired with a still-good furnace — including refrigerant transition planning for older R-22 systems.",
      ],
      gallery: [
        { src: heroTechnician, alt: "Outdoor central AC condenser installed beside a home" },
        { src: jobExteriorWhite, alt: "Central AC line set neatly routed along exterior" },
        { src: jobMiniSplit, alt: "AC condenser pad with proper clearance" },
      ],
      faqs: [
        { q: "How long do central AC systems last in NY?", a: "Properly maintained systems last 15-20 years. Coastal Westchester homes near the Sound see slightly shorter outdoor-unit life due to salt exposure." },
        { q: "Should I replace AC and furnace together?", a: "If both are 12+ years old, replacing together usually delivers better matched-system efficiency and a single labor charge. We'll lay out the math both ways." },
        { q: "What size AC do I need?", a: "We perform a Manual J load calculation. Most 2,000-2,500 sq ft Westchester homes need 3-3.5 tons — never rely on the existing equipment's tonnage alone, since it may have been oversized." },
        { q: "Can I add central AC to a home with hot-water heat?", a: "Yes — we install high-velocity small-duct systems or ductless mini-splits for homes without existing ductwork. Both are common Westchester retrofits." },
      ],
    },
  },
  {
    slug: "gas-furnaces",
    card: {
      img: jobGasFurnace,
      alt: "Gas furnace installation in a residential utility room",
      title: "High-efficiency gas furnaces",
      desc: "For ducted homes that want fast, powerful heat, a 95%+ AFUE two-stage furnace pairs perfectly with central AC. Reliable in NY's coldest stretches when heat pumps need backup.",
      best: "Best for: ducted homes, dual-fuel systems, fast recovery",
    },
    page: {
      eyebrow: "NY Homeowner Guide",
      title: "High-efficiency gas furnace installation in Westchester County",
      subtitle: "Two-stage 95%+ AFUE gas furnaces for ducted Westchester homes — fast recovery on the coldest NY nights.",
      metaDescription: "High-efficiency gas furnace installation in Westchester County, NY. 95%+ AFUE Carrier, Trane, and Lennox furnaces with proper sizing and venting.",
      overview: [
        "For ducted homes, a modern gas furnace remains the fastest, most powerful way to recover heat after a setback. Today's 95%+ AFUE two-stage furnaces from Carrier, Trane, and Lennox waste almost no fuel and run quietly on low stage most of the season.",
        "Furnaces also play a critical role in dual-fuel setups — the heat pump handles 80-90% of the heating season at peak efficiency, and the gas furnace kicks in for the coldest single-digit nights.",
        "Every install includes new PVC venting, condensate handling, and combustion analysis at start-up to lock in advertised efficiency.",
      ],
      gallery: [
        { src: jobGasFurnace, alt: "High-efficiency two-stage gas furnace installed in a residential basement" },
        { src: jobBoiler, alt: "High-efficiency gas heating equipment install" },
        { src: jobOilTank, alt: "Furnace venting and gas piping" },
      ],
      faqs: [
        { q: "What size furnace do I need?", a: "We perform a Manual J heat-loss calculation. Most 2,000 sq ft Westchester homes need 60,000-80,000 BTU/h — oversized furnaces short-cycle, wear out faster, and deliver uneven temperatures." },
        { q: "Single-stage, two-stage, or modulating?", a: "Two-stage offers the best comfort-per-dollar for most homes. Modulating furnaces deliver the quietest, most even heat but cost more up front. We'll explain the trade-offs for your home." },
        { q: "How long does a furnace install take?", a: "Most replacements take a single day. If venting needs to be re-run for a 95%+ unit, plan for 1-2 days." },
        { q: "Can I pair a new furnace with a heat pump?", a: "Yes — a dual-fuel system uses the heat pump for most of the season and the furnace as backup for the coldest stretches. It's the most efficient combo for many Westchester homes." },
      ],
    },
  },
  {
    slug: "water-heaters",
    card: {
      img: jobWaterHeater,
      alt: "Water heater installation",
      title: "Water heaters",
      desc: "Gas, electric, tankless, and hybrid heat pump water heaters from Rheem, AO Smith, Bradford White, and Navien — sized and installed for your household demand.",
      best: "Best for: replacing aging tanks, upgrading to tankless, or going all-electric",
    },
    page: {
      eyebrow: "NY Homeowner Guide",
      title: "Water heater installation in Westchester County",
      subtitle: "Gas, electric, tankless, and hybrid heat pump water heaters — properly sized, code-compliant installs.",
      metaDescription: "Water heater installation in Westchester County, NY. Gas, electric, tankless, and hybrid heat pump units from Rheem, AO Smith, Bradford White, and Navien.",
      overview: [
        "We install every major type of water heater: standard gas and electric tanks, high-efficiency tankless (Navien, Rinnai, Rheem), and hybrid heat pump units that use roughly 60% less electricity than a standard electric tank.",
        "The right choice depends on your fuel source, household size, available space, and how you use hot water. We size based on first-hour rating and peak demand — not just gallons — so you don't run out during back-to-back showers.",
        "Every install includes proper venting, code-compliant gas or electrical work, expansion tanks where required, condensate handling for high-efficiency and heat pump models, and a clean tie-in to existing plumbing.",
      ],
      gallery: [
        { src: jobWaterHeater, alt: "Residential water heater installation" },
        { src: jobBoiler, alt: "Mechanical room with new water heater" },
        { src: jobOilTank, alt: "Plumbing tie-ins for a water heater replacement" },
      ],
      faqs: [
        { q: "Tank, tankless, or heat pump — which is right for me?", a: "Tankless is great for limited space and unlimited hot water on demand. Heat pump is best if you want lower bills and have a basement with 700+ cubic feet. Standard tanks are still the most affordable upfront. We walk through the trade-offs at the estimate." },
        { q: "What size do I need?", a: "Standard sizing: 40-50 gallons for 1-3 people, 65-80 gallons for 4-5 people. Tankless is sized by GPM (flow rate) and temperature rise. We size based on first-hour rating and your actual peak demand." },
        { q: "How long do water heaters last?", a: "Standard tank: 8-12 years. Tankless: 15-20 years. Heat pump: 10-15 years. Annual flush and anode rod inspection extends the life of any tank-style unit." },
        { q: "Do you offer same-day or emergency replacement?", a: "Yes — we keep common sizes in stock and can usually replace a failed water heater the same day or next morning." },
      ],
    },
  },
];

export const getNYSystem = (slug: string) => NY_SYSTEMS.find((s) => s.slug === slug);
