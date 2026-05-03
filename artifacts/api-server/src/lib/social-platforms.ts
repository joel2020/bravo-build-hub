/**
 * Platform registry. Two kinds of platforms:
 *   - autoPost: true  — we publish via API (Facebook, Instagram via Meta Graph)
 *   - autoPost: false — we deep-link the platform's composer with text pre-filled
 *                       where supported, otherwise just open the composer.
 */

export type PlatformId =
  | "facebook" | "instagram" | "linkedin" | "x" | "threads"
  | "nextdoor" | "google-business" | "pinterest" | "youtube-community";

export interface PlatformConfig {
  id: PlatformId;
  label: string;
  autoPost: boolean;
  charLimit: number;
  /** Maximum hashtags that look natural on this platform. */
  hashtagBudget: number;
  /** Tone instruction passed to the LLM. */
  toneHint: string;
  /** Whether the composer URL accepts pre-filled text. */
  prefillsText: boolean;
  /** Build a deep link to the composer with text pre-filled when supported. */
  composerUrl(text: string): string;
  /** Whether image is required for native posting. */
  requiresImage?: boolean;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "facebook",
    label: "Facebook Page",
    autoPost: true,
    charLimit: 2200,
    hashtagBudget: 2,
    toneHint: "Conversational, story-driven. Lead with a hook, give one useful insight, end with a call to action. Hashtags optional and minimal.",
    prefillsText: false,
    composerUrl: () => "https://www.facebook.com/?sk=composer",
  },
  {
    id: "instagram",
    label: "Instagram Business",
    autoPost: true,
    requiresImage: true,
    charLimit: 2200,
    hashtagBudget: 12,
    toneHint: "Visual-first caption. Strong hook in line 1 (first 125 chars are what shows). Short paragraphs separated by blank lines. End with 8–12 relevant hashtags grouped at the bottom.",
    prefillsText: false,
    composerUrl: () => "https://www.instagram.com/",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    autoPost: false,
    charLimit: 3000,
    hashtagBudget: 4,
    toneHint: "Professional but human. Lead with a specific observation or stat. 2–4 short paragraphs. End with a question or industry-specific CTA. 2–4 niche hashtags.",
    prefillsText: true,
    composerUrl: (t) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(t)}`,
  },
  {
    id: "x",
    label: "X (Twitter)",
    autoPost: false,
    charLimit: 280,
    hashtagBudget: 2,
    toneHint: "Punchy, single thought. Strong hook. No fluff. 1–2 hashtags max. Stay under 240 chars to leave room for a link.",
    prefillsText: true,
    composerUrl: (t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`,
  },
  {
    id: "threads",
    label: "Threads",
    autoPost: false,
    charLimit: 500,
    hashtagBudget: 1,
    toneHint: "Conversational, Twitter-but-longer. One observation or tip. Avoid hashtags unless one fits naturally.",
    prefillsText: true,
    composerUrl: (t) => `https://www.threads.net/intent/post?text=${encodeURIComponent(t)}`,
  },
  {
    id: "nextdoor",
    label: "Nextdoor (Local)",
    autoPost: false,
    charLimit: 2000,
    hashtagBudget: 0,
    toneHint: "Hyper-local, neighborly. No hashtags. Mention Westchester County or a specific town. Helpful tip framing — never salesy. End with a low-pressure offer ('Happy to answer questions in the comments').",
    prefillsText: false,
    composerUrl: () => "https://nextdoor.com/news_feed/",
  },
  {
    id: "google-business",
    label: "Google Business Profile",
    autoPost: false,
    charLimit: 1500,
    hashtagBudget: 0,
    toneHint: "Plain, factual, locally-optimized. Mention the service + Westchester. Include a clear CTA (Call, Book, Learn more). No hashtags. The Posts API was deprecated in 2024 — must be posted manually.",
    prefillsText: false,
    composerUrl: () => "https://business.google.com/posts",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    autoPost: false,
    requiresImage: true,
    charLimit: 500,
    hashtagBudget: 4,
    toneHint: "SEO-friendly title + descriptive caption. Think 'tip card' or 'before-and-after.' Lead with the keyword. 2–4 hashtags.",
    prefillsText: false,
    composerUrl: () => "https://www.pinterest.com/pin-creation-tool/",
  },
  {
    id: "youtube-community",
    label: "YouTube Community",
    autoPost: false,
    charLimit: 1500,
    hashtagBudget: 2,
    toneHint: "Direct address to subscribers. One quick tip or behind-the-scenes moment. End with a question to drive comments.",
    prefillsText: false,
    composerUrl: () => "https://studio.youtube.com/",
  },
];

export function getPlatform(id: PlatformId): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
