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
const CITATIONS_API = "/api/citations";

// ===== Citations =====
export type CitationStatus =
  | "not-started" | "in-progress" | "claimed" | "verified" | "live" | "skipped" | "needs-update";

export interface CitationSite {
  id: string;
  name: string;
  category: string;
  signupUrl: string;
  searchUrlTemplate: string;
  notes: string;
  priority: number;
  record: {
    id: string;
    status: CitationStatus;
    publicUrl?: string;
    notes?: string;
    detected?: boolean;
    lastCheckedAt?: string;
    claimedAt?: string;
    verifiedAt?: string;
    liveAt?: string;
  };
}

export interface NapPackage {
  businessName: string;
  legalName: string;
  phone: string;
  email: string;
  website: string;
  serviceArea: string;
  serviceAreaList: string[];
  addressType: string;
  hours: Record<string, string>;
  categories: string[];
  services: string[];
  shortDescription: string;
  longDescription: string;
  paymentMethods: string[];
  licenses: string[];
  keywords: string[];
  logoSuggestion: string;
}

export interface CitationsResponse {
  sites: CitationSite[];
  nap: NapPackage;
}

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

  // Citations
  getCitations: () => jsonFetch<CitationsResponse>(`${CITATIONS_API}/data`),
  setCitationStatus: (id: string, body: { status: CitationStatus; publicUrl?: string; notes?: string }) =>
    jsonFetch<CitationSite["record"]>(`${CITATIONS_API}/${id}/status`, { method: "POST", body: JSON.stringify(body) }),
  scanCitations: () =>
    jsonFetch<{ message: string }>(`${CITATIONS_API}/scan`, { method: "POST" }),

  // Social
  getSocial: () => jsonFetch<SocialDataResponse>(`/api/social/data`),
  generateSocial: (body: { topic: string; notes?: string; cta?: string; imageUrl?: string; platforms?: string[] }) =>
    jsonFetch<{ briefId: string; posts: SocialPost[] }>(`/api/social/generate`, { method: "POST", body: JSON.stringify(body) }),
  patchSocialPost: (id: string, body: Partial<Pick<SocialPost, "text"|"hashtags"|"imageUrl"|"status">>) =>
    jsonFetch<SocialPost>(`/api/social/posts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteSocialPost: (id: string) =>
    jsonFetch<{ ok: boolean }>(`/api/social/posts/${id}`, { method: "DELETE" }),
  publishSocialPost: (id: string) =>
    jsonFetch<{ ok: boolean; publicUrl?: string; error?: string }>(`/api/social/posts/${id}/publish`, { method: "POST" }),
  publishBrief: (briefId: string) =>
    jsonFetch<{ message: string }>(`/api/social/briefs/${briefId}/publish`, { method: "POST" }),
};

// ===== Social =====
export type SocialPostStatus = "draft" | "scheduled" | "posting" | "posted" | "failed" | "skipped";

export interface SocialPost {
  id: string;
  briefId: string;
  topic: string;
  platform: string;
  text: string;
  hashtags: string[];
  imageUrl?: string;
  status: SocialPostStatus;
  postedAt?: string;
  publicUrl?: string;
  postId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformInfo {
  id: string;
  label: string;
  autoPost: boolean;
  charLimit: number;
  hashtagBudget: number;
  requiresImage: boolean;
  prefillsText: boolean;
}

export interface MetaConfigInfo {
  facebookConfigured: boolean;
  instagramConfigured: boolean;
  pageName?: string;
  igUsername?: string;
  error?: string;
}

export interface SocialDataResponse {
  posts: SocialPost[];
  platforms: PlatformInfo[];
  meta: MetaConfigInfo;
}
