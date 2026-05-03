import { anthropic } from "@workspace/integrations-anthropic-ai";
import { BRAVO } from "./site-config";
import { PLATFORMS, type PlatformConfig } from "./social-platforms";
import { logger } from "./logger";

export interface PlatformDraft {
  platform: string;
  text: string;
  hashtags: string[];
}

export interface GenerateInput {
  topic: string;
  platforms?: string[];
  notes?: string;
  cta?: string;
}

const SYSTEM = `You are a senior social-media manager for a residential HVAC contractor in Westchester County, NY.

Brand voice:
- Confident, plain-spoken, never salesy
- Knows the trade (mentions specific equipment, season-appropriate problems)
- Locally rooted in Westchester (mentions towns, weather, local landmarks when natural)
- Helpful first, promotional second
- Never invents customer testimonials, fake stats, or claims you can't back up

You will be given one weekly content topic and asked to produce a SEPARATE post for each social platform, tailored to that platform's tone, char limit, and hashtag conventions. Each platform gets its own version — never reuse the same text across platforms.

Always return STRICT JSON, no prose preamble. Schema:
{
  "drafts": [
    { "platform": "facebook", "text": "…", "hashtags": ["..."] },
    ...
  ]
}

Rules:
- "text" should be the post body WITHOUT hashtags inline (hashtags go in their own array — caller appends them).
- Stay under each platform's char limit (text + hashtags + spaces + leading "#").
- Never use emoji-stuffing. One or two emojis max only when natural.
- Never use the phrases: "game-changer", "elevate", "leverage", "unleash", "unlock the power".
- Always speak as the brand ("we", "our team"), never third-person.
- For X: count chars carefully. Stay ≤240 chars including hashtags so a link fits.
- For Instagram: first line is THE hook — the only thing visible before "more".
- For Nextdoor: zero hashtags. Mention a specific town or "Westchester County".
- For Google Business: zero hashtags. Include the phone number ${BRAVO.phone} and a clear CTA.`;

function buildUserPrompt(input: GenerateInput, platforms: PlatformConfig[]): string {
  const platformBlock = platforms.map((p) =>
    `- ${p.id} (${p.label}): max ${p.charLimit} chars. Hashtags: ${p.hashtagBudget}. Tone: ${p.toneHint}`,
  ).join("\n");
  return `Brand: ${BRAVO.brand} — ${BRAVO.legalName}
Service: HVAC contractor in Westchester County, NY (furnace, boiler, AC, heat pump, ductless, 24/7 emergency)
Phone: ${BRAVO.phone}
Website: ${BRAVO.siteUrl}

Weekly topic / content idea:
${input.topic}

${input.notes ? `Additional notes: ${input.notes}\n` : ""}${input.cta ? `Preferred call-to-action: ${input.cta}\n` : ""}
Produce one post for each of the following platforms. Return STRICT JSON matching the schema.

Platforms:
${platformBlock}`;
}

export async function generatePlatformDrafts(input: GenerateInput): Promise<PlatformDraft[]> {
  const platforms = (input.platforms?.length
    ? PLATFORMS.filter((p) => input.platforms!.includes(p.id))
    : PLATFORMS);
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: "user", content: buildUserPrompt(input, platforms) }],
  });
  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    logger.error({ text }, "social text generator: no JSON in response");
    throw new Error("Model did not return JSON");
  }
  const parsed = JSON.parse(match[0]) as { drafts: PlatformDraft[] };
  return parsed.drafts.filter((d) => platforms.some((p) => p.id === d.platform));
}
