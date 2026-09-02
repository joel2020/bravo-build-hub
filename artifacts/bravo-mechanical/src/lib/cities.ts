import { CITY_LANDING_CONTENT, type CityLandingContent } from "./localLandingContent";
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
  content: CityLandingContent;
};

export const citySlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const CITIES: City[] = TOWNS.map((name) => {
  const content = CITY_LANDING_CONTENT[citySlug(name)];
  if (!content) throw new Error(`Missing reviewed local landing content for ${name}`);

  return {
    slug: content.slug,
    name: content.name,
    zips: content.zips,
    neighborhoods: content.neighborhoods,
    region: content.region,
    intro: content.answerFirst,
    housing: content.localContext[0] ?? "",
    climateNote: content.localContext[1] ?? "",
    faqs: content.faqItems,
    content,
  };
});

export const getCity = (slug: string) => CITIES.find((city) => city.slug === slug);
