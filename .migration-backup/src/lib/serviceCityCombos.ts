// Top-5 cities × 6 services = 30 high-intent SEO landing pages.
// Used for sitemap generation and internal linking.

import { SERVICE_CONTENT } from "./serviceContent";
import { getCity } from "./cities";

export const TOP_CITY_SLUGS = [
  "yonkers",
  "white-plains",
  "new-rochelle",
  "mount-vernon",
  "scarsdale",
] as const;

export const SERVICE_SLUGS = Object.keys(SERVICE_CONTENT);

export const isTopCity = (slug?: string) =>
  !!slug && (TOP_CITY_SLUGS as readonly string[]).includes(slug);

export const SERVICE_CITY_COMBOS = TOP_CITY_SLUGS.flatMap((citySlug) => {
  const city = getCity(citySlug);
  return SERVICE_SLUGS.map((serviceSlug) => ({
    citySlug,
    cityName: city?.name ?? citySlug,
    serviceSlug,
    serviceTitle: SERVICE_CONTENT[serviceSlug].title,
    path: `/services/${serviceSlug}/${citySlug}`,
  }));
});
