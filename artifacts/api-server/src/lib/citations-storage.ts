import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "./logger";

const DATA_DIR = path.resolve(process.cwd(), "data");
const CITATIONS_FILE = path.join(DATA_DIR, "backlink-citations.json");

export type CitationStatus =
  | "not-started"
  | "in-progress"
  | "claimed"
  | "verified"
  | "live"
  | "skipped"
  | "needs-update";

export interface CitationRecord {
  id: string;
  status: CitationStatus;
  claimedAt?: string;
  verifiedAt?: string;
  liveAt?: string;
  publicUrl?: string;
  notes?: string;
  lastCheckedAt?: string;
  /** Whether the brand was found on the site during the last scan. */
  detected?: boolean;
}

const fileLocks = new Map<string, Promise<unknown>>();
function withFileLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(file, next.catch(() => undefined));
  return next;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readRaw(): Promise<CitationRecord[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(CITATIONS_FILE, "utf8");
    return JSON.parse(raw) as CitationRecord[];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    logger.error({ err }, "Failed to read citations file");
    return [];
  }
}

async function writeRaw(data: CitationRecord[]): Promise<void> {
  await ensureDir();
  const tmp = `${CITATIONS_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, CITATIONS_FILE);
}

export async function getCitations(): Promise<CitationRecord[]> {
  return withFileLock(CITATIONS_FILE, readRaw);
}

export async function updateCitations(
  fn: (items: CitationRecord[]) => CitationRecord[] | Promise<CitationRecord[]>,
): Promise<CitationRecord[]> {
  return withFileLock(CITATIONS_FILE, async () => {
    const cur = await readRaw();
    const next = await fn(cur);
    await writeRaw(next);
    return next;
  });
}
