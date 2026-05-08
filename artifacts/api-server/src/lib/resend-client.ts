import { Resend } from "resend";
import { logger } from "./logger";

interface ResendCreds {
  apiKey: string;
  fromEmail: string;
}

interface ReplitConnectorResponse {
  items?: Array<{
    settings?: {
      api_key?: string;
      from_email?: string;
    };
  }>;
}

let cachedFromEmail: string | null = null;

async function getCredentials(): Promise<ResendCreds | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;
  if (!hostname || !xReplitToken) return null;

  try {
    const data = (await fetch(
      `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
      { headers: { Accept: "application/json", "X-Replit-Token": xReplitToken } },
    ).then((r) => r.json())) as ReplitConnectorResponse;
    const settings = data?.items?.[0]?.settings;
    if (!settings?.api_key || !settings.from_email) return null;
    cachedFromEmail = settings.from_email;
    return { apiKey: settings.api_key, fromEmail: settings.from_email };
  } catch (err) {
    logger.error({ err }, "Failed to load Resend credentials");
    return null;
  }
}

export async function isResendConfigured(): Promise<boolean> {
  const c = await getCredentials();
  return !!(c?.apiKey && c?.fromEmail);
}

export async function getResendFromEmail(): Promise<string | null> {
  const c = await getCredentials();
  return c?.fromEmail ?? cachedFromEmail;
}

export interface SendArgs {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export async function sendEmail(args: SendArgs): Promise<{ id: string } | { error: string }> {
  const creds = await getCredentials();
  if (!creds) return { error: "Resend not connected" };
  const resend = new Resend(creds.apiKey);
  try {
    const result = await resend.emails.send({
      from: creds.fromEmail,
      to: args.to,
      subject: args.subject,
      text: args.body,
      replyTo: args.replyTo,
    });
    if (result.error) return { error: result.error.message };
    return { id: result.data?.id ?? "unknown" };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
