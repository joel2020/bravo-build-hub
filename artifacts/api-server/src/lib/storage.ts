import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "./logger";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PROSPECTS_FILE = path.join(DATA_DIR, "backlink-prospects.json");
const MENTIONS_FILE = path.join(DATA_DIR, "backlink-mentions.json");
const RUNS_FILE = path.join(DATA_DIR, "backlink-runs.json");

export type ProspectStatus =
  | "pending"
  | "linked"
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
  emailDraft?: { subject: string; body: string; generatedAt: string } | null;
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
  emailDraft?: { subject: string; body: string; generatedAt: string } | null;
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

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Per-file serial mutex so concurrent updaters don't lose writes. */
const fileLocks = new Map<string, Promise<unknown>>();
function withFileLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(
    file,
    next.catch(() => undefined),
  );
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

/** Read+modify+write under the file's lock. */
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
