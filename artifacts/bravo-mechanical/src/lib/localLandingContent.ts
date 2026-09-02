import raw from "@/content/localLandingPages.json";

export type LocalSource = { label: string; url: string; supports: string };
export type LocalFaq = { q: string; a: string };
export type MunicipalResource = { label: string; url: string };

export type CityLandingContent = {
  slug: string;
  name: string;
  region: "Lower Westchester" | "Sound Shore" | "Rivertowns" | "Central Westchester" | "Northern Westchester";
  zips: string[];
  neighborhoods: string[];
  title: string;
  metaDescription: string;
  answerFirst: string;
  localContext: string[];
  commonConcerns: string[];
  safeChecks: string[];
  professionalBoundaries: string[];
  municipalResources: MunicipalResource[];
  relatedGuideSlugs: string[];
  nearbyCitySlugs: string[];
  faqItems: LocalFaq[];
  sourceNotes: LocalSource[];
  reviewedAt: string;
};

export type ServiceCityLandingContent = {
  serviceSlug: "hvac-installation" | "hvac-repair" | "preventive-maintenance" | "indoor-air-quality";
  citySlug: string;
  serviceTitle: string;
  shortTitle: string;
  parentServicePath: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  answerFirst: string;
  localConsiderations: string[];
  commonConcerns: string[];
  serviceScope: string[];
  safeChecks: string[];
  professionalBoundaries: string[];
  relatedGuideSlugs: string[];
  relatedServiceSlugs: string[];
  faqItems: LocalFaq[];
  sourceNotes: LocalSource[];
  reviewedAt: string;
};

const dataset = raw as {
  cities: Record<string, CityLandingContent>;
  serviceCities: Record<string, ServiceCityLandingContent>;
};

export const CITY_LANDING_CONTENT = dataset.cities;
export const SERVICE_CITY_LANDING_CONTENT = dataset.serviceCities;
export const getCityLanding = (slug: string) => CITY_LANDING_CONTENT[slug];
export const getServiceCityLanding = (serviceSlug: string, citySlug: string) =>
  SERVICE_CITY_LANDING_CONTENT[`${serviceSlug}/${citySlug}`];
