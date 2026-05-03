import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "./logger";
import type { PlatformId } from "./social-platforms";

const DATA_DIR = path.resolve(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "social-posts.json");

export type SocialPostStatus = "draft" | "scheduled" | "posting" | "posted" | "failed" | "skipped";

export interface SocialPost {
  id: string;
  /** Stable group id linking all platform variants generated from the same brief. */
  briefId: string;
  topic: string;
  platform: PlatformId;
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

const fileLocks = new Map<string, Promise<unknown>>();
function withFileLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(file, next.catch(() => undefined));
  return next;
}

async function ensureDir(): Promise<void> { await fs.mkdir(DATA_DIR, { recursive: true }); }

async function readRaw(): Promise<SocialPost[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(POSTS_FILE, "utf8");
    return JSON.parse(raw) as SocialPost[];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    logger.error({ err }, "Failed to read social posts file");
    return [];
  }
}

async function writeRaw(data: SocialPost[]): Promise<void> {
  await ensureDir();
  const tmp = `${POSTS_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, POSTS_FILE);
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  return withFileLock(POSTS_FILE, readRaw);
}

export async function updateSocialPosts(
  fn: (items: SocialPost[]) => SocialPost[] | Promise<SocialPost[]>,
): Promise<SocialPost[]> {
  return withFileLock(POSTS_FILE, async () => {
    const cur = await readRaw();
    const next = await fn(cur);
    await writeRaw(next);
    return next;
  });
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
