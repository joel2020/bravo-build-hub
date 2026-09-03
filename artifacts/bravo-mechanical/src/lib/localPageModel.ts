export type LocalFaqValue = { q: string; a: string };

export type LocalCityValue = {
  slug: string;
  name: string;
  metaDescription: string;
  faqItems: LocalFaqValue[];
};

export type LocalServiceCityValue = {
  serviceSlug: string;
  citySlug: string;
  serviceTitle: string;
  shortTitle: string;
  h1: string;
  metaDescription: string;
  answerFirst: string;
  faqItems: LocalFaqValue[];
};

export const APPROVED_SERVICE_AREAS = [
  { slug: "yonkers", name: "Yonkers" },
  { slug: "white-plains", name: "White Plains" },
  { slug: "new-rochelle", name: "New Rochelle" },
  { slug: "mount-vernon", name: "Mount Vernon" },
  { slug: "scarsdale", name: "Scarsdale" },
  { slug: "rye", name: "Rye" },
  { slug: "harrison", name: "Harrison" },
  { slug: "mamaroneck", name: "Mamaroneck" },
  { slug: "larchmont", name: "Larchmont" },
  { slug: "bronxville", name: "Bronxville" },
  { slug: "tuckahoe", name: "Tuckahoe" },
  { slug: "eastchester", name: "Eastchester" },
  { slug: "tarrytown", name: "Tarrytown" },
  { slug: "sleepy-hollow", name: "Sleepy Hollow" },
  { slug: "ossining", name: "Ossining" },
  { slug: "peekskill", name: "Peekskill" },
  { slug: "mount-kisco", name: "Mount Kisco" },
  { slug: "chappaqua", name: "Chappaqua" },
  { slug: "pleasantville", name: "Pleasantville" },
  { slug: "pound-ridge", name: "Pound Ridge" },
  { slug: "bedford", name: "Bedford" },
  { slug: "katonah", name: "Katonah" },
  { slug: "armonk", name: "Armonk" },
  { slug: "hastings-on-hudson", name: "Hastings-on-Hudson" },
  { slug: "dobbs-ferry", name: "Dobbs Ferry" },
  { slug: "irvington", name: "Irvington" },
  { slug: "briarcliff-manor", name: "Briarcliff Manor" },
  { slug: "croton-on-hudson", name: "Croton-on-Hudson" },
  { slug: "yorktown", name: "Yorktown" },
  { slug: "somers", name: "Somers" },
  { slug: "ardsley", name: "Ardsley" },
  { slug: "hartsdale", name: "Hartsdale" },
  { slug: "pelham", name: "Pelham" },
  { slug: "port-chester", name: "Port Chester" },
] as const;

export const SERVICE_INTENT_PARENTS = {
  "hvac-installation": {
    path: "/services",
    breadcrumbLabel: "HVAC Services",
    linkLabel: "All HVAC services in Westchester",
  },
  "hvac-repair": {
    path: "/services",
    breadcrumbLabel: "HVAC Services",
    linkLabel: "All HVAC services in Westchester",
  },
  "preventive-maintenance": {
    path: "/services/hvac-maintenance-westchester-county-ny",
    breadcrumbLabel: "HVAC Maintenance",
    linkLabel: "HVAC Maintenance in Westchester",
  },
  "indoor-air-quality": {
    path: "/services/indoor-air-quality-westchester-county-ny",
    breadcrumbLabel: "Indoor Air Quality Services",
    linkLabel: "Indoor Air Quality Services in Westchester",
  },
} as const;

export type PublishedLocalServiceSlug = keyof typeof SERVICE_INTENT_PARENTS;

export const CITY_SERVICE_INTENTS = [
  {
    slug: "hvac-installation",
    title: "HVAC Installation",
    description: "New furnace, AC, heat-pump, and ductwork options reviewed for the building and proposed scope.",
    parentPath: SERVICE_INTENT_PARENTS["hvac-installation"].path,
    parentLabel: "HVAC Installation: browse all HVAC services →",
  },
  {
    slug: "hvac-repair",
    title: "HVAC Repair",
    description: "Diagnostics and repair options for heating and cooling systems, including urgent service requests.",
    parentPath: SERVICE_INTENT_PARENTS["hvac-repair"].path,
    parentLabel: "HVAC Repair: browse all HVAC services →",
  },
  {
    slug: "preventive-maintenance",
    title: "Preventive Maintenance",
    description: "Seasonal maintenance that documents system condition and identifies reliability concerns.",
    parentPath: SERVICE_INTENT_PARENTS["preventive-maintenance"].path,
    parentLabel: "HVAC Maintenance in Westchester →",
  },
  {
    slug: "indoor-air-quality",
    title: "Indoor Air Quality",
    description: "Filtration, humidity-control, ventilation, and purification options matched to the building and HVAC system.",
    parentPath: SERVICE_INTENT_PARENTS["indoor-air-quality"].path,
    parentLabel: "Indoor Air Quality Services in Westchester →",
  },
  {
    slug: "residential",
    title: "Residential HVAC",
    description: "Heating and cooling options for single-family homes, condos, and multi-unit properties.",
    parentPath: "/services",
    parentLabel: "Residential HVAC: browse all HVAC services →",
  },
  {
    slug: "commercial",
    title: "Commercial HVAC",
    description: "HVAC service options for offices, retail, restaurants, and light-industrial buildings.",
    parentPath: "/services/commercial-hvac-westchester-county-ny",
    parentLabel: "Commercial HVAC in Westchester →",
  },
] as const;

export const SERVICE_AREA_SUMMARY = `Serving ${APPROVED_SERVICE_AREAS.length} listed communities in Westchester County, NY.`;

export const approvedServiceAreaPlaces = () =>
  APPROVED_SERVICE_AREAS.map(({ name }) => ({ "@type": "Place" as const, name: `${name}, NY` }));

export const LOCAL_PAGE_SHARED_STRINGS = [
  SERVICE_AREA_SUMMARY,
  ...CITY_SERVICE_INTENTS.flatMap((intent) => [
    intent.title,
    intent.description,
    intent.parentLabel,
  ]),
  ...Object.values(SERVICE_INTENT_PARENTS).flatMap((parent) => [
    parent.breadcrumbLabel,
    parent.linkLabel,
  ]),
];

export type CityServiceDestination = {
  serviceSlug: string;
  title: string;
  description: string;
  path: string;
  label: string;
  published: boolean;
};

export function getCityServiceDestinations(
  city: Pick<LocalCityValue, "slug" | "name">,
  publishedServices: LocalServiceCityValue[],
): CityServiceDestination[] {
  const publishedByService = new Map(
    publishedServices
      .filter((page) => page.citySlug === city.slug)
      .map((page) => [page.serviceSlug, page]),
  );

  return CITY_SERVICE_INTENTS.map((intent) => {
    const published = publishedByService.get(intent.slug);
    return published
      ? {
          serviceSlug: intent.slug,
          title: published.serviceTitle,
          description: published.answerFirst,
          path: `/services/${published.serviceSlug}/${published.citySlug}`,
          label: `${published.serviceTitle} in ${city.name} →`,
          published: true,
        }
      : {
          serviceSlug: intent.slug,
          title: intent.title,
          description: intent.description,
          path: intent.parentPath,
          label: intent.parentLabel,
          published: false,
        };
  });
}

function faqSchema(faqs: LocalFaqValue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

function breadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...item,
    })),
  };
}

function siteRoot(siteUrl: string) {
  return siteUrl.replace(/\/$/, "");
}

export function buildCityPageSemantics(city: LocalCityValue, siteUrl: string) {
  const root = siteRoot(siteUrl);
  const pageUrl = `${root}/service-areas/${city.slug}`;
  const h1 = `HVAC Services in ${city.name}, NY`;
  return {
    h1,
    service: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: `HVAC service in ${city.name}, NY`,
      serviceType: "Heating, cooling, installation, repair, and maintenance",
      description: city.metaDescription,
      url: pageUrl,
      areaServed: { "@type": "Place", name: `${city.name}, NY` },
      provider: { "@id": `${root}/#localbusiness` },
    },
    faq: faqSchema(city.faqItems),
    breadcrumb: breadcrumbSchema([
      { name: "Home", item: `${root}/` },
      { name: "Service Areas", item: `${root}/service-areas` },
      { name: city.name, item: pageUrl },
    ]),
  };
}

export function buildServiceCityPageSemantics(
  landing: LocalServiceCityValue,
  city: Pick<LocalCityValue, "slug" | "name">,
  siteUrl: string,
) {
  const root = siteRoot(siteUrl);
  const pageUrl = `${root}/services/${landing.serviceSlug}/${landing.citySlug}`;
  const parent = SERVICE_INTENT_PARENTS[landing.serviceSlug as PublishedLocalServiceSlug];
  if (!parent) throw new Error(`Unknown published local-service intent: ${landing.serviceSlug}`);
  const parentBreadcrumbs = parent.path === "/services"
    ? [{ name: parent.breadcrumbLabel, item: `${root}/services` }]
    : [
        { name: "Services", item: `${root}/services` },
        { name: parent.breadcrumbLabel, item: `${root}${parent.path}` },
      ];

  return {
    h1: landing.h1,
    parent,
    service: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: landing.h1,
      serviceType: landing.serviceTitle,
      description: landing.metaDescription,
      url: pageUrl,
      areaServed: { "@type": "Place", name: `${city.name}, NY` },
      provider: { "@id": `${root}/#localbusiness` },
    },
    faq: faqSchema(landing.faqItems),
    breadcrumb: breadcrumbSchema([
      { name: "Home", item: `${root}/` },
      ...parentBreadcrumbs,
      { name: `${landing.shortTitle} in ${city.name}`, item: pageUrl },
    ]),
  };
}

export function localPageSchemaArray(
  semantics: ReturnType<typeof buildCityPageSemantics> | ReturnType<typeof buildServiceCityPageSemantics>,
) {
  return [semantics.service, semantics.faq, semantics.breadcrumb];
}
