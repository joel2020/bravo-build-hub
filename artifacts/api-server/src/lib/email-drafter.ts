import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";
import { BRAVO } from "./site-config";

export type DraftKind = "directory-claim" | "outreach" | "unlinked-mention";

export interface DraftInput {
  kind: DraftKind;
  prospectName: string;
  prospectUrl: string;
  category?: string;
  contextSnippet?: string;
  notes?: string;
}

export interface DraftResult {
  subject: string;
  body: string;
  generatedAt: string;
}

const SYSTEM_PROMPT = `You write short, warm, specific outreach emails on behalf of a small home-services business.

Hard rules:
- Never use spammy or templated language ("I hope this email finds you well", "I came across your site", "I wanted to reach out", "great content").
- Keep it under 130 words.
- Do NOT promise links, payment, or anything in exchange.
- Be concrete about WHY this specific page/site/directory is a good fit for the sender.
- Never invent facts the sender did not provide.
- Sign off with the sender's name and phone.
- Output ONLY a JSON object with keys "subject" and "body". No prose, no markdown.`;

function userPrompt(input: DraftInput): string {
  const senderBlock = `Sender: ${BRAVO.brand} (${BRAVO.legalName})
Sender summary: ${BRAVO.oneLiner}
Sender phone: ${BRAVO.phone}
Sender email: ${BRAVO.email}
Sender site: ${BRAVO.siteUrl}
Sender service area: ${BRAVO.area}
Owner display name: ${BRAVO.ownerName}`;

  const recipientBlock = `Recipient site: ${input.prospectName}
Recipient URL: ${input.prospectUrl}
Category: ${input.category ?? "n/a"}
Notes from sender about this prospect: ${input.notes ?? "(none)"}`;

  let instruction = "";
  switch (input.kind) {
    case "directory-claim":
      instruction = `Goal: This is a directory or listing site. Write a short note to whoever manages business listings asking how to add or claim Bravo Mechanical's profile, and confirm what's needed (license/insurance proof, photos, NAP). If this directory is self-serve (e.g. Google Business, Yelp), write a short internal action note instead of an outreach email — phrase the body as a checklist of what to do, not as a letter.`;
      break;
    case "outreach":
      instruction = `Goal: Polite, specific outreach asking the recipient to consider including Bravo Mechanical in their member directory, vendor list, or local-pros listing. Reference what the recipient does (chamber, association, local press) and explain why a Westchester HVAC contractor with a 5.0-star rating fits. Mention willingness to share license, insurance, and references.`;
      break;
    case "unlinked-mention":
      instruction = `Goal: The recipient has mentioned Bravo Mechanical on the page at ${input.prospectUrl} but did not link to ${BRAVO.siteUrl}. Politely thank them for the mention, share the canonical URL, and ask if they would consider linking the brand name to it. Quote a short snippet of context if provided.${input.contextSnippet ? `\nContext snippet from the page: """${input.contextSnippet.slice(0, 300)}"""` : ""}`;
      break;
  }

  return `${senderBlock}

${recipientBlock}

${instruction}

Output JSON only: {"subject":"...","body":"..."}`;
}

export async function draftOutreachEmail(input: DraftInput): Promise<DraftResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt(input) }],
  });
  const block = message.content[0];
  const text = block && block.type === "text" ? block.text : "";
  let parsed: { subject?: string; body?: string };
  try {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(match ? match[0] : text);
  } catch (err) {
    logger.error({ err, text }, "Failed to parse Anthropic JSON");
    parsed = { subject: `Quick question about ${input.prospectName}`, body: text };
  }
  return {
    subject: parsed.subject ?? `About ${BRAVO.brand} — ${input.prospectName}`,
    body: parsed.body ?? "(no body generated)",
    generatedAt: new Date().toISOString(),
  };
}
