// Top-5 cities × 4 services = 20 high-intent SEO landing pages.
// Used for sitemap generation and internal linking.

import { CITY_LANDING_CONTENT, SERVICE_CITY_LANDING_CONTENT } from "./localLandingContent";

export const TOP_CITY_SLUGS = [
  "yonkers",
  "white-plains",
  "new-rochelle",
  "mount-vernon",
  "scarsdale",
] as const;

export const SERVICE_SLUGS = [...new Set(
  Object.values(SERVICE_CITY_LANDING_CONTENT).map((content) => content.serviceSlug),
)];

export const isTopCity = (slug?: string) =>
  !!slug && (TOP_CITY_SLUGS as readonly string[]).includes(slug);

export const SERVICE_CITY_COMBOS = TOP_CITY_SLUGS.flatMap((citySlug) => {
  return SERVICE_SLUGS.map((serviceSlug) => {
    const content = SERVICE_CITY_LANDING_CONTENT[`${serviceSlug}/${citySlug}`];
    if (!content) throw new Error(`Missing reviewed service-city content for ${serviceSlug}/${citySlug}`);
    const city = CITY_LANDING_CONTENT[content.citySlug];
    if (!city) throw new Error(`Missing reviewed city content for ${content.citySlug}`);

    return {
      citySlug: content.citySlug,
      cityName: city.name,
      serviceSlug: content.serviceSlug,
      serviceTitle: content.serviceTitle,
      path: `/services/${content.serviceSlug}/${content.citySlug}`,
    };
  });
});
