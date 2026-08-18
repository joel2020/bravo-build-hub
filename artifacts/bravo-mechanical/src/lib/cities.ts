import { TOWNS } from "./site";

export type City = {
  slug: string;
  name: string;
  zips: string[];
  neighborhoods: string[];
  region: "Lower Westchester" | "Sound Shore" | "Rivertowns" | "Central Westchester" | "Northern Westchester";
  intro: string;
  housing: string;
  climateNote: string;
  faqs: { q: string; a: string }[];
};

export const citySlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const baseFaqs = (name: string) => [
  {
    q: `How do I request urgent HVAC repair in ${name}?`,
    a: `Call Bravo Mechanical to request the next available appointment in ${name}. Response timing depends on call volume, weather, location, and technician availability.`,
  },
  {
    q: `Is Bravo Mechanical licensed to work in ${name}, NY?`,
    a: `Bravo Mechanical lists Westchester HVAC license #8822 and serves ${name}. Customers can confirm the credential and permit requirements that apply to their specific project before work begins.`,
  },
  {
    q: `How do you select HVAC equipment for a project in ${name}?`,
    a: `Equipment recommendations depend on building load, existing distribution, fuel or electrical constraints, efficiency goals, serviceability, and current availability. Ask which models are supported for your project.`,
  },
  {
    q: `Do you provide written estimates in ${name}?`,
    a: `Bravo Mechanical can prepare a written, project-specific estimate for installation or replacement work in ${name}. The scope depends on the site assessment and selected equipment.`,
  },
];

const CITY_DATA: Record<string, Omit<City, "slug" | "name" | "faqs">> = {
  "Yonkers": {
    zips: ["10701","10703","10704","10705","10706","10707","10708","10710"],
    neighborhoods: ["Getty Square","Bryn Mawr","Park Hill","Ludlow","Crestwood","Lincoln Park","Nodine Hill","Bryn Mawr Park"],
    region: "Lower Westchester",
    intro: "Yonkers is the largest city in Westchester County, with a mix of pre-war multi-family homes, modern high-rises, and detached single-family houses across neighborhoods like Park Hill, Bryn Mawr, and Crestwood. The housing stock here is diverse, which means HVAC needs range from boiler retrofits in 1920s row houses to ductless mini-split installs in older homes that never had central air.",
    housing: "Many Yonkers homes still run on steam or hot-water boilers — some 50+ years old. We handle high-efficiency gas boiler conversions, oil-to-gas conversions, and add-on ductless cooling for homes without ductwork.",
    climateNote: "Yonkers winters drop into the teens regularly, and humid summers push July temps near 90°F. Properly sized heating and dependable cooling matter — we don't oversize, and we don't undersize.",
  },
  "White Plains": {
    zips: ["10601","10603","10604","10605","10606","10607"],
    neighborhoods: ["Downtown","Battle Hill","Gedney","Highlands","Eastview","Fisher Hill","Westchester Hills"],
    region: "Central Westchester",
    intro: "White Plains is Westchester's commercial hub and home to a strong mix of mid-century single-family homes, condos, and downtown commercial buildings. From colonials in Gedney to high-rises downtown, we work across both residential and commercial HVAC in White Plains every week.",
    housing: "White Plains residential customers most commonly need furnace replacements, central AC tune-ups, and heat pump conversions. Commercial customers — offices, restaurants, retail — rely on us for rooftop unit service and preventive maintenance contracts.",
    climateNote: "White Plains sees the full Westchester weather range: snow loads in January, humid 90°F days in August. Annual maintenance is the difference between equipment that lasts 8 years and equipment that lasts 18.",
  },
  "New Rochelle": {
    zips: ["10801","10804","10805"],
    neighborhoods: ["Downtown","North End","Sun Haven","Wykagyl","Quaker Ridge","Premium Point","Davenport Neck"],
    region: "Sound Shore",
    intro: "New Rochelle blends turn-of-the-century waterfront homes with modern condos and townhomes in the North End. We service heating and cooling across the full city — from compact downtown units to large Wykagyl colonials.",
    housing: "Older homes near the Sound often have boiler heat with no ductwork — perfect candidates for ductless mini-splits or high-velocity AC. Newer construction usually has central air but may need a heat-pump upgrade for efficiency.",
    climateNote: "Coastal humidity in New Rochelle is real — dehumidification and air-quality solutions matter as much as cooling capacity here.",
  },
  "Mount Vernon": {
    zips: ["10550","10552","10553"],
    neighborhoods: ["Fleetwood","Chester Heights","South Side","North Side","Vernon Park"],
    region: "Lower Westchester",
    intro: "Mount Vernon's housing leans heavily toward pre-war multi-family buildings and older single-family homes, especially in Fleetwood and Chester Heights. Many properties still run original boilers and would benefit from modern high-efficiency replacements.",
    housing: "Boiler replacements, oil-to-gas conversions, and add-on cooling are our most common Mount Vernon jobs. We also service apartment buildings on annual maintenance plans.",
    climateNote: "Like the rest of Lower Westchester, Mount Vernon swings from below-freezing January nights to humid August afternoons. Reliable heat is non-negotiable.",
  },
  "Scarsdale": {
    zips: ["10583"],
    neighborhoods: ["Heathcote","Greenacres","Quaker Ridge","Edgewood","Fox Meadow","Murray Hill","Arthur Manor"],
    region: "Central Westchester",
    intro: "Scarsdale is one of Westchester's premier residential communities, with large center-hall colonials, Tudors, and Mediterranean-style homes — many over 80 years old. HVAC work in Scarsdale demands clean, code-compliant installs that protect the home.",
    housing: "Common Scarsdale projects: high-efficiency boiler swaps, multi-zone heat pump installations, whole-home humidifiers, and HEPA-grade filtration for older homes with chronic dust issues.",
    climateNote: "Larger Scarsdale homes need carefully designed zoning to avoid hot upstairs/cold downstairs syndrome. We do load calculations, not guesswork.",
  },
  "Rye": {
    zips: ["10580"],
    neighborhoods: ["Greenhaven","Indian Village","Milton Point","Rye Beach","Apawamis"],
    region: "Sound Shore",
    intro: "Rye sits on the Long Island Sound and includes some of Westchester's most architecturally significant homes. Salt air, humidity, and large home footprints make Rye HVAC work specialized — equipment selection and corrosion protection matter.",
    housing: "We install corrosion-resistant condensers for waterfront properties, multi-zone systems for larger homes, and whole-home dehumidifiers. Boiler service and high-velocity AC retrofits are also common.",
    climateNote: "Coastal humidity near Rye Beach and Milton Point can punish standard equipment. We choose components that hold up.",
  },
  "Harrison": {
    zips: ["10528","10577"],
    neighborhoods: ["Downtown Harrison","West Harrison","Purchase","Silver Lake","Sterling Ridge"],
    region: "Sound Shore",
    intro: "Harrison spans from the train-station downtown to the spacious estates of Purchase. Job profiles vary widely — compact furnace swaps near the village, full-system designs for large Purchase homes.",
    housing: "Heat-pump conversions are increasingly popular in Harrison, especially in homes already running natural gas. We also handle commercial maintenance for Purchase office parks.",
    climateNote: "Harrison sees the same Sound Shore humidity as Rye, with cold pockets inland — system design has to handle both.",
  },
  "Mamaroneck": {
    zips: ["10543"],
    neighborhoods: ["Orienta","Harbor Heights","Washingtonville","Heathcote Heights"],
    region: "Sound Shore",
    intro: "Mamaroneck is a tight-knit Sound Shore community with a mix of waterfront homes, walkable village neighborhoods, and traditional colonials. We're a familiar face here for both repairs and full system replacements.",
    housing: "Common: boiler service, high-efficiency furnace upgrades, ductless mini-splits for finished basements and additions, whole-home humidifier installs.",
    climateNote: "Waterfront and harbor humidity make IAQ (filtration, dehumidification) a real factor for many Mamaroneck homes.",
  },
  "Larchmont": {
    zips: ["10538"],
    neighborhoods: ["Larchmont Village","Larchmont Manor","Larchmont Gardens","Larchmont Woods"],
    region: "Sound Shore",
    intro: "Larchmont's classic Tudors, Colonials, and historic Manor homes deserve clean HVAC work that respects the architecture — no exposed line sets running across a slate roof, no oversized condensers in the front yard.",
    housing: "Mini-splits and high-velocity AC are popular Larchmont retrofits. We also do a lot of high-efficiency boiler conversions and water-heater swaps in older homes.",
    climateNote: "Salt air from the Sound and humid summers — equipment choice and placement both matter.",
  },
  "Bronxville": {
    zips: ["10708"],
    neighborhoods: ["Bronxville Village","Lawrence Park","Cedar Knoll","Sagamore Park"],
    region: "Lower Westchester",
    intro: "Bronxville is a small, dense, architecturally protected village with prewar single-family homes and historic apartment buildings. HVAC retrofits here have to be tidy and unobtrusive.",
    housing: "Steam-to-hot-water conversions, ductless mini-splits, and high-efficiency boiler swaps are common Bronxville projects.",
    climateNote: "Older Bronxville homes benefit enormously from indoor air quality upgrades — fresh-air intakes, whole-home filtration, humidifiers.",
  },
  "Tuckahoe": {
    zips: ["10707"],
    neighborhoods: ["Tuckahoe Village","Crestwood Lake area"],
    region: "Lower Westchester",
    intro: "Tuckahoe is a small village with a mix of compact single-family homes, multi-family houses, and apartments. Reliable furnace and boiler service is the most common need here.",
    housing: "Furnace replacements, boiler tune-ups, water-heater swaps, and add-on ductless cooling for finished attics and basements.",
    climateNote: "Standard inland Westchester weather — cold winters, humid summers, equipment that gets used hard.",
  },
  "Eastchester": {
    zips: ["10709"],
    neighborhoods: ["Eastchester Hamlet","Lake Isle area","Waverly"],
    region: "Lower Westchester",
    intro: "Eastchester's mix of single-family homes and condos keeps us busy with both residential service and small-commercial maintenance contracts.",
    housing: "Common jobs: central AC replacements, gas furnace upgrades, water-heater installs (tank, tankless, and heat-pump), and seasonal maintenance plans.",
    climateNote: "Eastchester's older homes often need ductwork sealing — a small investment that improves comfort and lowers bills significantly.",
  },
  "Tarrytown": {
    zips: ["10591"],
    neighborhoods: ["Downtown Tarrytown","Lyndhurst area","Philipse Manor","Wilson Park"],
    region: "Rivertowns",
    intro: "Tarrytown overlooks the Hudson and includes everything from compact village apartments to large estate homes. We service the full spectrum.",
    housing: "Heat-pump installations are popular in Tarrytown — many homeowners are looking to electrify their heating and cooling. Boiler and furnace work is steady year-round.",
    climateNote: "River-valley microclimates can produce surprisingly humid summers and damp basements — IAQ matters.",
  },
  "Sleepy Hollow": {
    zips: ["10591"],
    neighborhoods: ["Philipse Manor","Beekman Park","Webber Park","River Edge"],
    region: "Rivertowns",
    intro: "Sleepy Hollow's blend of historic homes and newer condo developments means we regularly switch between vintage boiler work and modern multi-zone systems in the same week.",
    housing: "Boiler tune-ups in older homes, ductless mini-splits in homes without ducts, central-AC replacements in newer construction.",
    climateNote: "Hudson River humidity affects equipment longevity — we install with that in mind.",
  },
  "Ossining": {
    zips: ["10562"],
    neighborhoods: ["Crotonville","Briarcliff Knolls","Sing Sing area","Maple Heights"],
    region: "Northern Westchester",
    intro: "Ossining stretches from the Hudson up into the hills, with significant elevation differences and a mix of older village homes and newer subdivisions.",
    housing: "Heat-pump conversions, boiler replacements, and whole-home humidifier installs are common — older Ossining homes often run dry in winter.",
    climateNote: "Hilly Ossining gets meaningfully colder than the lower-elevation parts of Westchester — heating capacity matters.",
  },
  "Peekskill": {
    zips: ["10566"],
    neighborhoods: ["Downtown Peekskill","Bohlmann Towers area","Park Street"],
    region: "Northern Westchester",
    intro: "Peekskill's mix of historic homes, recent condo developments, and small commercial buildings keeps our team busy across residential and light commercial.",
    housing: "Furnace and boiler service, ductless mini-splits for older homes, commercial rooftop unit maintenance.",
    climateNote: "Peekskill winters are colder than Lower Westchester — we size heating systems for the actual local design temperature, not a one-size-fits-all number.",
  },
  "Mount Kisco": {
    zips: ["10549"],
    neighborhoods: ["Downtown Mount Kisco","Sarles Crossing","Stony Hill","Mount Kisco Country Club area"],
    region: "Northern Westchester",
    intro: "Mount Kisco's village center is surrounded by larger homes on wooded lots. HVAC needs run from compact downtown units to multi-zone systems for spread-out homes.",
    housing: "Heat-pump installs (often paired with backup gas heat), boiler replacements, and whole-home filtration for homes near wooded areas with high pollen counts.",
    climateNote: "Mount Kisco gets meaningfully colder than the southern county — design matters.",
  },
  "Chappaqua": {
    zips: ["10514"],
    neighborhoods: ["Random Farms","Chappaqua Crossing","Old Chappaqua","Lawrence Farms"],
    region: "Northern Westchester",
    intro: "Chappaqua is known for spacious wooded lots and large, well-maintained homes. HVAC work here often involves multi-zone systems, dedicated filtration, and high-end equipment.",
    housing: "Multi-zone heat pumps, high-efficiency boilers, whole-home humidification, HEPA-grade filtration. Geothermal interest is rising.",
    climateNote: "Chappaqua homeowners notice cold winter nights more than most — proper heating capacity and zoning are critical.",
  },
  "Pleasantville": {
    zips: ["10570"],
    neighborhoods: ["Downtown Pleasantville","Bedford Road","Manville Road area"],
    region: "Northern Westchester",
    intro: "Pleasantville's walkable village and surrounding neighborhoods include both vintage homes and newer construction. We service both styles regularly.",
    housing: "Furnace upgrades, boiler swaps, ductless mini-splits, and central AC replacements.",
    climateNote: "Standard Northern Westchester weather — cold winters, mild-to-hot summers, equipment that has to work.",
  },
  "Pound Ridge": {
    zips: ["10576"],
    neighborhoods: ["Pound Ridge Village","Long Ridge area","Cross River"],
    region: "Northern Westchester",
    intro: "Pound Ridge is rural by Westchester standards — large lots, big homes, often well water and propane heat. HVAC work here requires planning and careful equipment selection.",
    housing: "Propane boiler conversions, multi-zone heat pumps, whole-home water heater + filtration combos.",
    climateNote: "Pound Ridge sees the coldest winter temps in the county — heating reliability is the #1 priority.",
  },
  "Bedford": {
    zips: ["10506","10536"],
    neighborhoods: ["Bedford Village","Bedford Hills","Katonah border area"],
    region: "Northern Westchester",
    intro: "Bedford's historic center and surrounding estates demand HVAC work that's both technically excellent and visually unobtrusive.",
    housing: "Multi-zone systems, high-efficiency boilers, geothermal interest, hidden ductless installations.",
    climateNote: "Cold Northern Westchester winters — system design and equipment selection matter more than brand-name marketing.",
  },
  "Katonah": {
    zips: ["10536"],
    neighborhoods: ["Katonah Village","Beaver Dam","Cherry Street"],
    region: "Northern Westchester",
    intro: "Katonah's historic homes around the village center require careful, code-compliant HVAC retrofits that don't damage character.",
    housing: "Boiler tune-ups and replacements, ductless mini-splits, whole-home humidification, water heater swaps.",
    climateNote: "Katonah winters are cold — we size for the actual coldest expected day, not the average.",
  },
  "Armonk": {
    zips: ["10504"],
    neighborhoods: ["Downtown Armonk","Whippoorwill","Windmill Farms","Bryant Pond area"],
    region: "Northern Westchester",
    intro: "Armonk's larger homes on wooded lots are a regular setting for our multi-zone heat pump and high-efficiency boiler work.",
    housing: "Multi-zone heat pumps, geothermal evaluations, whole-home filtration, high-end thermostat and zoning controls.",
    climateNote: "Armonk's microclimate runs cold in winter — proper heat-pump sizing and reliable backup matter.",
  },
  "Hastings-on-Hudson": {
    zips: ["10706"],
    neighborhoods: ["Downtown Hastings","Boulanger Plaza area","Uniontown"],
    region: "Rivertowns",
    intro: "Hastings-on-Hudson's compact village and historic homes keep us busy with vintage boiler service and modern ductless retrofits.",
    housing: "Boiler swaps, ductless mini-splits, whole-home humidifier installs.",
    climateNote: "River-adjacent humidity makes IAQ a year-round consideration.",
  },
  "Dobbs Ferry": {
    zips: ["10522"],
    neighborhoods: ["Downtown Dobbs Ferry","Ardsley Park area","Beacon Hill"],
    region: "Rivertowns",
    intro: "Dobbs Ferry's mix of historic and newer construction keeps our work varied — vintage boiler service one day, modern multi-zone heat pump install the next.",
    housing: "Heat-pump installs, boiler tune-ups, ductless cooling additions, water heater replacements.",
    climateNote: "Hudson Valley humidity in summer, sharp cold in winter — equipment has to handle both.",
  },
  "Irvington": {
    zips: ["10533"],
    neighborhoods: ["Downtown Irvington","Ardsley-on-Hudson","East Irvington","Halsey Pond area"],
    region: "Rivertowns",
    intro: "Irvington's historic homes and Hudson views make for picturesque HVAC challenges — equipment placement matters as much as performance.",
    housing: "Hidden ductless installs, boiler replacements, whole-home humidification, multi-zone systems for larger homes.",
    climateNote: "River-valley humidity, cold winters — equipment selection and sealing matter.",
  },
  "Briarcliff Manor": {
    zips: ["10510"],
    neighborhoods: ["Scarborough","Pine Road","Briarcliff College area"],
    region: "Northern Westchester",
    intro: "Briarcliff Manor's mix of estate homes and newer subdivisions provides steady work across both vintage and modern HVAC systems.",
    housing: "Multi-zone heat pumps, high-efficiency boilers, central AC replacements, whole-home humidification.",
    climateNote: "Briarcliff winters run cold — proper heating capacity is essential.",
  },
  "Croton-on-Hudson": {
    zips: ["10520"],
    neighborhoods: ["Mount Airy","Half Moon Bay","Harmon","Croton Heights"],
    region: "Rivertowns",
    intro: "Croton-on-Hudson's hillside homes overlooking the Hudson and Croton Bay present interesting equipment placement and ductwork challenges.",
    housing: "Heat-pump installs, ductless mini-splits, boiler replacements, water heater conversions to heat pump.",
    climateNote: "River-valley humidity and elevation differences affect system performance — design matters.",
  },
  "Yorktown": {
    zips: ["10547","10588","10598"],
    neighborhoods: ["Yorktown Heights","Mohegan Lake","Jefferson Valley","Shrub Oak"],
    region: "Northern Westchester",
    intro: "Yorktown is one of Westchester's larger and more spread-out municipalities, including Yorktown Heights, Mohegan Lake, Jefferson Valley, and Shrub Oak. Housing ranges from compact lakefront cottages to large suburban homes.",
    housing: "Furnace and boiler service, propane and oil conversions, multi-zone heat pumps, ductless retrofits.",
    climateNote: "Yorktown sees the colder end of Westchester winters — heating reliability and proper sizing are non-negotiable.",
  },
  "Somers": {
    zips: ["10589","10536","10541"],
    neighborhoods: ["Somers Hamlet","Heritage Hills","Lake Lincolndale","Lincolndale"],
    region: "Northern Westchester",
    intro: "Somers is rural-suburban with large lots, condo communities like Heritage Hills, and a mix of propane, oil, and natural-gas heating systems.",
    housing: "Heat-pump conversions (often replacing oil or propane), boiler replacements, condo HVAC service contracts in Heritage Hills.",
    climateNote: "Cold Northern Westchester winters — system design and reliable heat are top priorities.",
  },
  "Ardsley": {
    zips: ["10502"],
    neighborhoods: ["Ardsley Village","Ardsley Park","Concord Road corridor"],
    region: "Rivertowns",
    intro: "Ardsley is a compact Rivertowns village of roughly 4,700 residents, dominated by 1950s–60s colonials, split-levels, and capes on quiet residential streets off Ashford Avenue and Heatherdell Road. Homes of this era typically run forced-air furnaces or hot-water boilers that are reaching their second or third replacement cycle.",
    housing: "The most common Ardsley calls we see: mid-century furnace and boiler replacements, adding central AC or ductless cooling to homes that never had it, and sealing leaky mid-century ductwork that wastes conditioned air in unfinished basements.",
    climateNote: "Ardsley's Saw Mill River valley position traps summer humidity, and winter cold snaps expose undersized or aging heating plants. Right-sizing on replacement — not matching the old oversized unit — pays off here.",
  },
  "Hartsdale": {
    zips: ["10530"],
    neighborhoods: ["Manor Woods","Poets Corner","College Corners","Central Park Avenue corridor"],
    region: "Central Westchester",
    intro: "Hartsdale, a hamlet of Greenburgh, mixes pre-war Tudors and colonials near the Metro-North station with large co-op and condo communities along the Central Park Avenue corridor. That split means two very different kinds of HVAC work — and we do both.",
    housing: "In the single-family neighborhoods we handle boiler replacements, steam-system balancing, and ductless retrofits for homes without ducts. In Hartsdale's co-ops and condos we install and service through-wall units, ductless splits (with board-approved line-set routing), and unit-level heat pumps.",
    climateNote: "Pre-war Hartsdale homes with radiator heat often have no cooling infrastructure at all — cold-climate ductless heat pumps solve both the July humidity and shoulder-season heating in one system.",
  },
  "Pelham": {
    zips: ["10803"],
    neighborhoods: ["Pelham Village","Pelham Manor","Pelhamwood","Chester Park"],
    region: "Sound Shore",
    intro: "Pelham and Pelham Manor are among Westchester's oldest commuter suburbs, filled with 1910s–1930s colonials, Tudors, and center-hall homes on tree-lined streets. Pre-war construction here usually means steam or hot-water radiator heat, plaster walls, and no ductwork — the classic Westchester retrofit challenge.",
    housing: "Our bread-and-butter in Pelham: steam boiler repair and replacement (including near-boiler piping done correctly), oil-to-gas conversions, and adding cooling to pre-war homes with ductless mini-splits or slim-duct systems that respect original plaster and trim.",
    climateNote: "Steam systems in Pelham's older homes are unforgiving of bad piping and poor maintenance — short cycling, banging pipes, and uneven heat are almost always fixable without full replacement. We diagnose before we quote.",
  },
  "Port Chester": {
    zips: ["10573"],
    neighborhoods: ["Downtown","Fox Island area","Ridge Street corridor","King Street corridor"],
    region: "Sound Shore",
    intro: "Port Chester is one of Westchester's densest villages, with a large stock of two- and three-family homes, older single-families, and active ground-floor commercial space along Main Street and Westchester Avenue. Multifamily heating is a specialty of ours here.",
    housing: "Common Port Chester work: boiler replacements in two- and three-family buildings (including separate-zone configurations landlords ask for), water heater replacements sized for multifamily demand, ductless cooling for apartments, and commercial HVAC for restaurants and storefronts.",
    climateNote: "Dense housing near the Byram River and the Sound means humid summers and hard-working boilers in winter. For rental property owners, annual maintenance contracts prevent the mid-January no-heat call from a tenant.",
  },
};

export const CITIES: City[] = TOWNS.map((name) => {
  const data = CITY_DATA[name];
  if (!data) {
    // Defensive fallback so build never breaks if TOWNS adds a name
    return {
      slug: citySlug(name),
      name,
      zips: [],
      neighborhoods: [],
      region: "Central Westchester",
      intro: `${name} is part of Westchester County, NY, where Bravo Mechanical provides full residential and commercial HVAC service.`,
      housing: `Common HVAC work in ${name} includes boiler and furnace replacement, central AC installation, ductless mini-splits, and preventive maintenance.`,
      climateNote: `${name} sees cold winters and humid summers typical of Westchester County — well-sized, well-maintained equipment matters.`,
      faqs: baseFaqs(name),
    };
  }
  return {
    slug: citySlug(name),
    name,
    ...data,
    faqs: baseFaqs(name),
  };
});

export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug);
