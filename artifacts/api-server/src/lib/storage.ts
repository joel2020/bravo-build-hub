import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "./logger";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PROSPECTS_FILE = path.join(DATA_DIR, "backlink-prospects.json");
const MENTIONS_FILE = path.join(DATA_DIR, "backlink-mentions.json");
const RUNS_FILE = path.join(DATA_DIR, "backlink-runs.json");
const SETTINGS_FILE = path.join(DATA_DIR, "backlink-settings.json");

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

/** Statuses that represent intentional human/CRM decisions. Automated scans
 *  must NEVER overwrite these. */
export const TERMINAL_STATUSES: ReadonlySet<ProspectStatus> = new Set([
  "contacted",
  "responded",
  "won",
  "skipped",
]);

export interface SentEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  resendId?: string;
  error?: string;
}

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
  emailDraft?: { subject: string; body: string; generatedAt: string } | null;
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
  emailDraft?: { subject: string; body: string; generatedAt: string } | null;
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

export interface Settings {
  /** When true, scan runs will auto-send drafts to discovered emails. */
  autoSend: boolean;
  /** When true, only dofollow backlinks count as "linked". */
  dofollowOnly: boolean;
}

const DEFAULT_SETTINGS: Settings = { autoSend: true, dofollowOnly: true };

async function ensureDir(): Promise<void> { await fs.mkdir(DATA_DIR, { recursive: true }); }

const fileLocks = new Map<string, Promise<unknown>>();
function withFileLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(file, next.catch(() => undefined));
  return next;
}

async function readJsonRaw<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    logger.error({ err, file }, "Failed to read storage file");
    return fallback;
  }
}

async function writeJsonRaw<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function updateProspects(
  fn: (items: Prospect[]) => Prospect[] | Promise<Prospect[]>,
): Promise<Prospect[]> {
  return withFileLock(PROSPECTS_FILE, async () => {
    const cur = await readJsonRaw<Prospect[]>(PROSPECTS_FILE, []);
    const next = await fn(cur);
    await writeJsonRaw(PROSPECTS_FILE, next);
    return next;
  });
}

export async function updateMentions(
  fn: (items: Mention[]) => Mention[] | Promise<Mention[]>,
): Promise<Mention[]> {
  return withFileLock(MENTIONS_FILE, async () => {
    const cur = await readJsonRaw<Mention[]>(MENTIONS_FILE, []);
    const next = await fn(cur);
    await writeJsonRaw(MENTIONS_FILE, next);
    return next;
  });
}

export async function updateRuns(
  fn: (items: Run[]) => Run[] | Promise<Run[]>,
): Promise<Run[]> {
  return withFileLock(RUNS_FILE, async () => {
    const cur = await readJsonRaw<Run[]>(RUNS_FILE, []);
    const next = await fn(cur);
    await writeJsonRaw(RUNS_FILE, next.slice(-50));
    return next.slice(-50);
  });
}

export async function getProspects(): Promise<Prospect[]> {
  return withFileLock(PROSPECTS_FILE, () => readJsonRaw<Prospect[]>(PROSPECTS_FILE, []));
}
export async function getMentions(): Promise<Mention[]> {
  return withFileLock(MENTIONS_FILE, () => readJsonRaw<Mention[]>(MENTIONS_FILE, []));
}
export async function getRuns(): Promise<Run[]> {
  return withFileLock(RUNS_FILE, () => readJsonRaw<Run[]>(RUNS_FILE, []));
}

export async function getSettings(): Promise<Settings> {
  const s = await withFileLock(SETTINGS_FILE, () =>
    readJsonRaw<Partial<Settings>>(SETTINGS_FILE, {}),
  );
  return { ...DEFAULT_SETTINGS, ...s };
}
export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  return withFileLock(SETTINGS_FILE, async () => {
    const cur = await readJsonRaw<Partial<Settings>>(SETTINGS_FILE, {});
    const next = { ...DEFAULT_SETTINGS, ...cur, ...patch };
    await writeJsonRaw(SETTINGS_FILE, next);
    return next;
  });
}
