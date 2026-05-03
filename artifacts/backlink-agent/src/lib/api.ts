export type ProspectStatus =
  | "pending"
  | "linked"
  | "unlinked"
  | "contacted"
  | "responded"
  | "won"
  | "skipped"
  | "unreachable";

export interface EmailDraft {
  subject: string;
  body: string;
  generatedAt: string;
}

export interface Prospect {
  id: string;
  category: string;
  name: string;
  url: string;
  notes?: string;
  status: ProspectStatus;
  lastCheckedAt?: string;
  hasBacklink?: boolean;
  brandMentioned?: boolean;
  emailDraft?: EmailDraft | null;
  contactedAt?: string;
  history: Array<{ at: string; event: string; detail?: string }>;
}

export interface Mention {
  id: string;
  url: string;
  source: "manual" | "scan";
  context?: string;
  status: ProspectStatus;
  hasBacklink?: boolean;
  emailDraft?: EmailDraft | null;
  addedAt: string;
  lastCheckedAt?: string;
  contactedAt?: string;
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
    prospectsUnreachable: number;
    mentionsScanned: number;
    draftsGenerated: number;
    error?: string;
  };
}

export interface SiteInfo {
  brand: string;
  domain: string;
  siteUrl: string;
  phone: string;
  email: string;
  area: string;
}

export interface DataResponse {
  prospects: Prospect[];
  mentions: Mention[];
  runs: Run[];
  site: SiteInfo;
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
  addMention: (url: string, context?: string) =>
    jsonFetch<Mention>(`${API}/mentions`, {
      method: "POST",
      body: JSON.stringify({ url, context }),
    }),
  setProspectStatus: (id: string, status: ProspectStatus) =>
    jsonFetch<Prospect>(`${API}/prospects/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  setMentionStatus: (id: string, status: ProspectStatus) =>
    jsonFetch<Mention>(`${API}/mentions/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  redraft: (id: string) =>
    jsonFetch<Prospect>(`${API}/prospects/${id}/redraft`, { method: "POST" }),
  digestUrl: () => `${API}/digest`,
};
