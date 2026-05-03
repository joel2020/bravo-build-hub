export type ProspectStatus =
  | "pending"
  | "linked"
  | "linked-nofollow"
  | "unlinked"
  | "contacted"
  | "responded"
  | "won"
  | "skipped"
  | "unreachable";

export interface EmailDraft { subject: string; body: string; generatedAt: string; }
export interface SentEmail { to: string; subject: string; body: string; sentAt: string; resendId?: string; error?: string; }

export interface Prospect {
  id: string;
  category: string;
  name: string;
  url: string;
  contactUrl?: string;
  contactEmail?: string;
  notes?: string;
  status: ProspectStatus;
  lastCheckedAt?: string;
  hasBacklink?: boolean;
  hasDofollowBacklink?: boolean;
  brandMentioned?: boolean;
  emailDraft?: EmailDraft | null;
  contactedAt?: string;
  sent?: SentEmail[];
  history: Array<{ at: string; event: string; detail?: string }>;
}

export interface Mention {
  id: string;
  url: string;
  source: "manual" | "scan";
  context?: string;
  contactEmail?: string;
  status: ProspectStatus;
  hasBacklink?: boolean;
  hasDofollowBacklink?: boolean;
  emailDraft?: EmailDraft | null;
  addedAt: string;
  lastCheckedAt?: string;
  contactedAt?: string;
  sent?: SentEmail[];
}

export interface Run {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "failed";
  summary: {
    prospectsScanned: number;
    prospectsUnlinked: number;
    prospectsLinked: number;
    prospectsLinkedNofollow: number;
    prospectsUnreachable: number;
    mentionsScanned: number;
    draftsGenerated: number;
    emailsDiscovered: number;
    emailsSent: number;
    emailsFailed: number;
    error?: string;
  };
}

export interface Settings { autoSend: boolean; dofollowOnly: boolean; }
export interface SiteInfo { brand: string; domain: string; siteUrl: string; phone: string; email: string; area: string; }

export interface DataResponse {
  prospects: Prospect[];
  mentions: Mention[];
  runs: Run[];
  site: SiteInfo;
  settings: Settings;
  resend: { configured: boolean; fromEmail: string | null };
}

const API = "/api/backlinks";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getData: () => jsonFetch<DataResponse>(`${API}/data`),
  startScan: () => jsonFetch<{ runId: string }>(`${API}/scan`, { method: "POST" }),
  updateSettings: (patch: Partial<Settings>) =>
    jsonFetch<Settings>(`${API}/settings`, { method: "POST", body: JSON.stringify(patch) }),
  addMention: (url: string, context?: string, contactEmail?: string) =>
    jsonFetch<Mention>(`${API}/mentions`, { method: "POST", body: JSON.stringify({ url, context, contactEmail }) }),
  setProspectStatus: (id: string, status: ProspectStatus) =>
    jsonFetch<Prospect>(`${API}/prospects/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
  setMentionStatus: (id: string, status: ProspectStatus) =>
    jsonFetch<Mention>(`${API}/mentions/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
  patchProspect: (id: string, patch: Partial<Pick<Prospect, "contactEmail" | "notes">>) =>
    jsonFetch<Prospect>(`${API}/prospects/${id}`, { method: "POST", body: JSON.stringify(patch) }),
  redraft: (id: string) =>
    jsonFetch<Prospect>(`${API}/prospects/${id}/redraft`, { method: "POST" }),
  sendNow: (id: string) =>
    jsonFetch<{ id?: string; error?: string }>(`${API}/prospects/${id}/send`, { method: "POST" }),
  digestUrl: () => `${API}/digest`,
};
