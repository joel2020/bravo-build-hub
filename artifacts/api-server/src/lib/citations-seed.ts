/**
 * Curated list of citation/business-profile sites for Bravo Mechanical.
 *
 * The agent CANNOT auto-create accounts here (CAPTCHA, phone/postcard
 * verification, ToS). What it does instead:
 *  - Pre-fills a consistent NAP + business package for copy/paste
 *  - Deep-links to the claim/signup page for each site
 *  - Tracks claim status manually (not-started → claimed → verified → live)
 *  - On scan, checks whether a listing for the brand exists on the site
 */

export type CitationCategory =
  | "Tier 1 (must-have)"
  | "Tier 2 (national directory)"
  | "HVAC/contractor vertical"
  | "Local/regional"
  | "Data aggregator";

export interface CitationSite {
  id: string;
  name: string;
  category: CitationCategory;
  /** Where to start the claim/signup process (deep link). */
  signupUrl: string;
  /** Public listing search URL (used to detect existing listings). */
  searchUrlTemplate: string;
  /** Public listing root, used to detect a listing in the brand's name on scan. */
  listingHostHints: string[];
  /** Friendly notes about what's needed (verification type, gotchas). */
  notes: string;
  /** Approximate priority — used for sorting in the UI. Lower = more important. */
  priority: number;
}

export const CITATION_SEED: CitationSite[] = [
  // ===== Tier 1: must-have =====
  {
    id: "google-business",
    name: "Google Business Profile",
    category: "Tier 1 (must-have)",
    signupUrl: "https://www.google.com/business/",
    searchUrlTemplate: "https://www.google.com/maps/search/{q}",
    listingHostHints: ["google.com/maps", "g.co"],
    notes: "Single most important listing. Verification is by postcard, phone, video, or email depending on category. Allow 1–2 weeks for postcard.",
    priority: 1,
  },
  {
    id: "bing-places",
    name: "Bing Places for Business",
    category: "Tier 1 (must-have)",
    signupUrl: "https://www.bingplaces.com/",
    searchUrlTemplate: "https://www.bing.com/maps?q={q}",
    listingHostHints: ["bing.com/maps"],
    notes: "Free. Can import directly from Google Business Profile.",
    priority: 2,
  },
  {
    id: "apple-business",
    name: "Apple Business Connect",
    category: "Tier 1 (must-have)",
    signupUrl: "https://businessconnect.apple.com/",
    searchUrlTemplate: "https://maps.apple.com/?q={q}",
    listingHostHints: ["maps.apple.com"],
    notes: "Free. Required for Apple Maps / Siri results. Sign in with Apple ID.",
    priority: 3,
  },
  {
    id: "facebook-business",
    name: "Facebook Business Page",
    category: "Tier 1 (must-have)",
    signupUrl: "https://www.facebook.com/business/pages/set-up",
    searchUrlTemplate: "https://www.facebook.com/search/pages/?q={q}",
    listingHostHints: ["facebook.com"],
    notes: "Free. Counts as a citation for local SEO + social proof. Requires personal FB account.",
    priority: 4,
  },
  {
    id: "yelp",
    name: "Yelp for Business",
    category: "Tier 1 (must-have)",
    signupUrl: "https://biz.yelp.com/signup",
    searchUrlTemplate: "https://www.yelp.com/search?find_desc={q}&find_loc=Westchester+County%2C+NY",
    listingHostHints: ["yelp.com/biz"],
    notes: "Free claim. Yelp links are nofollow, but the citation still helps local SEO. Watch for upsell calls.",
    priority: 5,
  },
  {
    id: "bbb",
    name: "Better Business Bureau",
    category: "Tier 1 (must-have)",
    signupUrl: "https://www.bbb.org/get-accredited",
    searchUrlTemplate: "https://www.bbb.org/search?find_country=USA&find_loc=Westchester+County%2C+NY&find_text={q}",
    listingHostHints: ["bbb.org"],
    notes: "Free unaccredited listing OR paid accreditation ($500+/yr). Even a free listing builds trust signals.",
    priority: 6,
  },

  // ===== Tier 2: major national directories =====
  {
    id: "yellowpages",
    name: "YellowPages.com",
    category: "Tier 2 (national directory)",
    signupUrl: "https://accounts.yellowpages.com/register",
    searchUrlTemplate: "https://www.yellowpages.com/westchester-county-ny/{q}",
    listingHostHints: ["yellowpages.com"],
    notes: "Free basic listing. Feeds into other data aggregators.",
    priority: 10,
  },
  {
    id: "manta",
    name: "Manta",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.manta.com/claim",
    searchUrlTemplate: "https://www.manta.com/search?search={q}&search_source=business",
    listingHostHints: ["manta.com"],
    notes: "Free. Auto-imports from public records — your listing may already exist; claim it.",
    priority: 11,
  },
  {
    id: "foursquare",
    name: "Foursquare for Business",
    category: "Tier 2 (national directory)",
    signupUrl: "https://business.foursquare.com/",
    searchUrlTemplate: "https://foursquare.com/explore?q={q}&near=Westchester+County+NY",
    listingHostHints: ["foursquare.com"],
    notes: "Powers location data for many apps. Free claim.",
    priority: 12,
  },
  {
    id: "merchantcircle",
    name: "MerchantCircle",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.merchantcircle.com/signup",
    searchUrlTemplate: "https://www.merchantcircle.com/search?q={q}&where=Westchester+County%2C+NY",
    listingHostHints: ["merchantcircle.com"],
    notes: "Free. Lower priority but easy citation.",
    priority: 13,
  },
  {
    id: "hotfrog",
    name: "Hotfrog",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.hotfrog.com/AddCompany",
    searchUrlTemplate: "https://www.hotfrog.com/search?q={q}&l=Westchester+County%2C+NY",
    listingHostHints: ["hotfrog.com"],
    notes: "Free. Quick to fill out.",
    priority: 14,
  },
  {
    id: "brownbook",
    name: "Brownbook",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.brownbook.net/business/add",
    searchUrlTemplate: "https://www.brownbook.net/business/search/?searchword={q}",
    listingHostHints: ["brownbook.net"],
    notes: "Free. Crowdsourced — easy to add.",
    priority: 15,
  },
  {
    id: "cylex",
    name: "Cylex USA",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.cylex.us.com/",
    searchUrlTemplate: "https://www.cylex.us.com/search?q={q}",
    listingHostHints: ["cylex.us.com"],
    notes: "Free. Good for international visibility.",
    priority: 16,
  },
  {
    id: "citysearch",
    name: "Citysearch",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.citysearch.com/",
    searchUrlTemplate: "https://www.citysearch.com/find?what={q}&where=Westchester+County%2C+NY",
    listingHostHints: ["citysearch.com"],
    notes: "Free. Powered by CityGrid network.",
    priority: 17,
  },
  {
    id: "ezlocal",
    name: "EZlocal",
    category: "Tier 2 (national directory)",
    signupUrl: "https://www.ezlocal.com/add-listing",
    searchUrlTemplate: "https://www.ezlocal.com/search?find_what={q}&find_where=Westchester+County+NY",
    listingHostHints: ["ezlocal.com"],
    notes: "Free.",
    priority: 18,
  },

  // ===== HVAC / contractor vertical =====
  {
    id: "angi",
    name: "Angi (formerly Angie's List)",
    category: "HVAC/contractor vertical",
    signupUrl: "https://pro.angi.com/",
    searchUrlTemplate: "https://www.angi.com/companylist/westchester-county-ny/{q}.htm",
    listingHostHints: ["angi.com", "angieslist.com"],
    notes: "Free basic profile + paid lead packages. Free claim is worth it for the citation alone.",
    priority: 20,
  },
  {
    id: "houzz",
    name: "Houzz Pro",
    category: "HVAC/contractor vertical",
    signupUrl: "https://www.houzz.com/forPros",
    searchUrlTemplate: "https://www.houzz.com/professionals/{q}/probrowse?location=Westchester+County%2C+NY",
    listingHostHints: ["houzz.com"],
    notes: "Free pro profile. Useful for residential HVAC + remodel-adjacent leads.",
    priority: 21,
  },
  {
    id: "thumbtack",
    name: "Thumbtack",
    category: "HVAC/contractor vertical",
    signupUrl: "https://www.thumbtack.com/pro",
    searchUrlTemplate: "https://www.thumbtack.com/ny/westchester-county/{q}/",
    listingHostHints: ["thumbtack.com"],
    notes: "Pay-per-lead. Set tight categories + service area to avoid burning credits.",
    priority: 22,
  },
  {
    id: "porch",
    name: "Porch",
    category: "HVAC/contractor vertical",
    signupUrl: "https://pros.porch.com/",
    searchUrlTemplate: "https://porch.com/westchester-county-ny/{q}",
    listingHostHints: ["porch.com"],
    notes: "Free claim. Pay-per-lead model for paid leads.",
    priority: 23,
  },
  {
    id: "buildzoom",
    name: "BuildZoom",
    category: "HVAC/contractor vertical",
    signupUrl: "https://www.buildzoom.com/",
    searchUrlTemplate: "https://www.buildzoom.com/contractor/search?location=Westchester+County%2C+NY&trade={q}",
    listingHostHints: ["buildzoom.com"],
    notes: "Auto-imports from license data — claim your existing profile.",
    priority: 24,
  },

  // ===== Local / regional =====
  {
    id: "nextdoor-business",
    name: "Nextdoor Business",
    category: "Local/regional",
    signupUrl: "https://business.nextdoor.com/local",
    searchUrlTemplate: "https://nextdoor.com/find_neighborhood/?q={q}",
    listingHostHints: ["nextdoor.com"],
    notes: "Free. Hyper-local — great for neighborhood word-of-mouth in Westchester.",
    priority: 30,
  },
  {
    id: "alignable",
    name: "Alignable",
    category: "Local/regional",
    signupUrl: "https://www.alignable.com/business-network/sign-up",
    searchUrlTemplate: "https://www.alignable.com/search?q={q}&where=Westchester+County%2C+NY",
    listingHostHints: ["alignable.com"],
    notes: "Free B2B local network — useful for chamber/contractor referrals.",
    priority: 31,
  },

  // ===== Data aggregators (feed everything else) =====
  {
    id: "neustar-localeze",
    name: "Neustar Localeze (data aggregator)",
    category: "Data aggregator",
    signupUrl: "https://www.neustarlocaleze.biz/",
    searchUrlTemplate: "https://www.neustarlocaleze.biz/welcome",
    listingHostHints: ["neustarlocaleze.biz"],
    notes: "Paid (~$300/yr). Distributes your NAP to ~100 downstream sites — fixes citation rot in bulk.",
    priority: 40,
  },
  {
    id: "data-axle",
    name: "Data Axle (Express Update)",
    category: "Data aggregator",
    signupUrl: "https://www.expressupdate.com/",
    searchUrlTemplate: "https://www.expressupdate.com/search?query={q}",
    listingHostHints: ["expressupdate.com"],
    notes: "Free claim. Feeds Yahoo, Apple, MapQuest, etc.",
    priority: 41,
  },
];
