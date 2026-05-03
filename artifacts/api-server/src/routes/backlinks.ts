import { Router, type IRouter } from "express";
import { batchProcess } from "@workspace/integrations-anthropic-ai/batch";
import {
  getProspects,
  updateProspects,
  getMentions,
  updateMentions,
  getRuns,
  updateRuns,
  TERMINAL_STATUSES,
  type Prospect,
  type Mention,
  type Run,
  type ProspectStatus,
} from "../lib/storage";
import { PROSPECT_SEED } from "../lib/prospects-seed";
import { scanUrlForBravo } from "../lib/backlink-scanner";
import { draftOutreachEmail, type DraftKind } from "../lib/email-drafter";
import { BRAVO } from "../lib/site-config";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SELF_SERVE_DIRECTORY_IDS = new Set([
  "cit-google-business",
  "cit-yelp",
  "cit-bbb",
  "cit-angi",
  "cit-houzz",
  "cit-homeadvisor",
  "cit-thumbtack",
  "cit-bing-places",
  "cit-apple-maps",
  "cit-yellowpages",
  "cit-foursquare",
  "cit-mapquest",
  "cit-manta",
  "cit-hotfrog",
  "cit-brownbook",
  "cit-chamberofcommerce",
  "cit-superpages",
  "cit-merchantcircle",
  "cit-cylex",
  "cit-tupalo",
  "ny-cleanheat",
  "ny-nyserda-cn",
  "ny-energystar-locator",
  "loc-nextdoor",
  "loc-alignable",
]);

function nowIso(): string {
  return new Date().toISOString();
}

async function ensureSeeded(): Promise<Prospect[]> {
  return updateProspects((existing) => {
    const byId = new Map(existing.map((p) => [p.id, p]));
    let added = 0;
    for (const seed of PROSPECT_SEED) {
      if (!byId.has(seed.id)) {
        byId.set(seed.id, {
          id: seed.id,
          category: seed.category,
          name: seed.name,
          url: seed.url,
          notes: seed.notes,
          status: "pending",
          history: [{ at: nowIso(), event: "seeded" }],
        });
        added += 1;
      }
    }
    return added > 0 ? Array.from(byId.values()) : existing;
  });
}

router.get("/backlinks/data", async (_req, res) => {
  const [prospects, mentions, runs] = await Promise.all([
    ensureSeeded(),
    getMentions(),
    getRuns(),
  ]);
  res.json({
    prospects,
    mentions,
    runs: runs.slice(-10).reverse(),
    site: BRAVO,
  });
});

router.post("/backlinks/scan", async (_req, res) => {
  // Single-active-scan guard
  const existing = await getRuns();
  const active = existing.find((r) => r.status === "running");
  if (active) {
    res.status(409).json({ error: "scan already running", runId: active.id });
    return;
  }

  const run: Run = {
    id: `run-${Date.now()}`,
    startedAt: nowIso(),
    status: "running",
    summary: {
      prospectsScanned: 0,
      prospectsUnlinked: 0,
      prospectsLinked: 0,
      prospectsUnreachable: 0,
      mentionsScanned: 0,
      draftsGenerated: 0,
    },
  };
  await updateRuns((all) => [...all, run]);

  res.json({ runId: run.id, message: "Scan started" });

  void runScan(run).catch(async (err) => {
    logger.error({ err }, "Scan failed");
    run.status = "failed";
    run.finishedAt = nowIso();
    run.summary.error = (err as Error).message;
    await updateRuns((all) => {
      const idx = all.findIndex((r) => r.id === run.id);
      if (idx >= 0) all[idx] = run;
      return all;
    });
  });
});

interface ScanOutcome {
  id: string;
  reachable: boolean;
  hasBacklink: boolean;
  brandMentioned: boolean;
  at: string;
}

async function runScan(run: Run): Promise<void> {
  const initialProspects = await ensureSeeded();
  const initialMentions = await getMentions();

  const checkable = initialProspects.filter(
    (p) => !SELF_SERVE_DIRECTORY_IDS.has(p.id) && !TERMINAL_STATUSES.has(p.status),
  );

  // 1. Scan prospects
  const prospectOutcomes: ScanOutcome[] = await batchProcess(
    checkable,
    async (p: Prospect): Promise<ScanOutcome> => {
      const result = await scanUrlForBravo(p.url);
      return {
        id: p.id,
        reachable: result.reachable,
        hasBacklink: result.hasBacklink,
        brandMentioned: result.brandMentioned,
        at: nowIso(),
      };
    },
    { concurrency: 5, retries: 1 },
  );

  // 2. Apply prospect outcomes under lock, skipping terminal items
  const prospectsAfter = await updateProspects((items) => {
    const map = new Map(items.map((p) => [p.id, p]));
    for (const o of prospectOutcomes) {
      const p = map.get(o.id);
      if (!p || TERMINAL_STATUSES.has(p.status)) continue;
      p.lastCheckedAt = o.at;
      p.hasBacklink = o.hasBacklink;
      p.brandMentioned = o.brandMentioned;
      run.summary.prospectsScanned += 1;
      if (!o.reachable) {
        p.status = "unreachable";
        run.summary.prospectsUnreachable += 1;
        p.history.push({ at: o.at, event: "scan", detail: "unreachable" });
      } else if (o.hasBacklink) {
        p.status = "linked";
        run.summary.prospectsLinked += 1;
        p.history.push({ at: o.at, event: "scan", detail: "backlink found" });
      } else {
        p.status = "unlinked";
        run.summary.prospectsUnlinked += 1;
        p.history.push({
          at: o.at,
          event: "scan",
          detail: o.brandMentioned ? "brand mentioned, no link" : "no link, no mention",
        });
      }
    }
    // Promote pending self-serve directories to "unlinked" so they get drafts
    for (const p of map.values()) {
      if (
        SELF_SERVE_DIRECTORY_IDS.has(p.id) &&
        p.status === "pending" &&
        !TERMINAL_STATUSES.has(p.status)
      ) {
        p.status = "unlinked";
      }
    }
    return Array.from(map.values());
  });

  // 3. Scan existing mentions (skip terminal)
  const mentionOutcomes: ScanOutcome[] = await batchProcess(
    initialMentions.filter((m) => !TERMINAL_STATUSES.has(m.status)),
    async (m: Mention): Promise<ScanOutcome> => {
      const result = await scanUrlForBravo(m.url);
      return {
        id: m.id,
        reachable: result.reachable,
        hasBacklink: result.hasBacklink,
        brandMentioned: result.brandMentioned,
        at: nowIso(),
      };
    },
    { concurrency: 5, retries: 1 },
  );

  const mentionsAfter = await updateMentions((items) => {
    const map = new Map(items.map((m) => [m.id, m]));
    for (const o of mentionOutcomes) {
      const m = map.get(o.id);
      if (!m || TERMINAL_STATUSES.has(m.status)) continue;
      m.lastCheckedAt = o.at;
      m.hasBacklink = o.hasBacklink;
      run.summary.mentionsScanned += 1;
      if (!o.reachable) m.status = "unreachable";
      else if (o.hasBacklink) m.status = "linked";
      else m.status = "unlinked";
    }
    return Array.from(map.values());
  });

  // 4. Draft emails for unlinked items without a draft
  type DraftJob =
    | { kind: DraftKind; targetKind: "prospect"; id: string; name: string; url: string; category?: string; notes?: string }
    | { kind: DraftKind; targetKind: "mention"; id: string; name: string; url: string; context?: string };

  const jobs: DraftJob[] = [];
  for (const p of prospectsAfter) {
    if (p.status === "unlinked" && !p.emailDraft) {
      jobs.push({
        kind: SELF_SERVE_DIRECTORY_IDS.has(p.id) ? "directory-claim" : "outreach",
        targetKind: "prospect",
        id: p.id,
        name: p.name,
        url: p.url,
        category: p.category,
        notes: p.notes,
      });
    }
  }
  for (const m of mentionsAfter) {
    if (m.status === "unlinked" && !m.emailDraft) {
      jobs.push({
        kind: "unlinked-mention",
        targetKind: "mention",
        id: m.id,
        name: safeHostname(m.url),
        url: m.url,
        context: m.context,
      });
    }
  }

  const drafts = await batchProcess(
    jobs.slice(0, 25),
    async (job: DraftJob) => {
      try {
        const d = await draftOutreachEmail({
          kind: job.kind,
          prospectName: job.name,
          prospectUrl: job.url,
          category: "category" in job ? job.category : undefined,
          notes: "notes" in job ? job.notes : undefined,
          contextSnippet: "context" in job ? job.context : undefined,
        });
        return { ok: true as const, job, draft: d };
      } catch (err) {
        logger.error({ err }, "Draft generation failed");
        return { ok: false as const, job };
      }
    },
    { concurrency: 2, retries: 3 },
  );

  await updateProspects((items) => {
    const map = new Map(items.map((p) => [p.id, p]));
    for (const r of drafts) {
      if (!r.ok || r.job.targetKind !== "prospect") continue;
      const p = map.get(r.job.id);
      if (!p || TERMINAL_STATUSES.has(p.status)) continue;
      p.emailDraft = r.draft;
      run.summary.draftsGenerated += 1;
      p.history.push({ at: nowIso(), event: "draft", detail: r.draft.subject });
    }
    return Array.from(map.values());
  });

  await updateMentions((items) => {
    const map = new Map(items.map((m) => [m.id, m]));
    for (const r of drafts) {
      if (!r.ok || r.job.targetKind !== "mention") continue;
      const m = map.get(r.job.id);
      if (!m || TERMINAL_STATUSES.has(m.status)) continue;
      m.emailDraft = r.draft;
      run.summary.draftsGenerated += 1;
    }
    return Array.from(map.values());
  });

  run.status = "completed";
  run.finishedAt = nowIso();
  await updateRuns((all) => {
    const idx = all.findIndex((r) => r.id === run.id);
    if (idx >= 0) all[idx] = run;
    else all.push(run);
    return all;
  });
  logger.info({ summary: run.summary }, "Scan completed");
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

router.post("/backlinks/mentions", async (req, res) => {
  const { url, context } = req.body as { url?: string; context?: string };
  if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    res.status(400).json({ error: "Provide a full http(s) URL" });
    return;
  }
  const existing = await getMentions();
  if (existing.some((m) => m.url === url)) {
    res.status(409).json({ error: "URL already tracked" });
    return;
  }
  const m: Mention = {
    id: `mention-${Date.now()}`,
    url,
    source: "manual",
    context,
    status: "pending",
    addedAt: nowIso(),
  };
  try {
    const result = await scanUrlForBravo(url);
    m.lastCheckedAt = nowIso();
    m.hasBacklink = result.hasBacklink;
    if (!result.reachable) m.status = "unreachable";
    else if (result.hasBacklink) m.status = "linked";
    else {
      m.status = "unlinked";
      try {
        m.emailDraft = await draftOutreachEmail({
          kind: "unlinked-mention",
          prospectName: safeHostname(url),
          prospectUrl: url,
          contextSnippet: context,
        });
      } catch (err) {
        logger.error({ err }, "Inline draft failed");
      }
    }
  } catch (err) {
    logger.error({ err }, "Inline mention scan failed");
  }
  await updateMentions((all) => [...all, m]);
  res.json(m);
});

router.post("/backlinks/prospects/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: ProspectStatus };
  const allowed: ProspectStatus[] = [
    "pending", "linked", "unlinked", "contacted", "responded", "won", "skipped", "unreachable",
  ];
  if (!status || !allowed.includes(status)) {
    res.status(400).json({ error: "invalid status" });
    return;
  }
  let updated: Prospect | undefined;
  await updateProspects((items) => {
    const p = items.find((x) => x.id === id);
    if (!p) return items;
    p.status = status;
    if (status === "contacted") p.contactedAt = nowIso();
    p.history.push({ at: nowIso(), event: "status", detail: status });
    updated = p;
    return items;
  });
  if (!updated) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(updated);
});

router.post("/backlinks/mentions/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: ProspectStatus };
  if (!status) {
    res.status(400).json({ error: "missing status" });
    return;
  }
  let updated: Mention | undefined;
  await updateMentions((items) => {
    const m = items.find((x) => x.id === id);
    if (!m) return items;
    m.status = status;
    if (status === "contacted") m.contactedAt = nowIso();
    updated = m;
    return items;
  });
  if (!updated) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(updated);
});

router.post("/backlinks/prospects/:id/redraft", async (req, res) => {
  const { id } = req.params;
  const items = await getProspects();
  const target = items.find((x) => x.id === id);
  if (!target) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const kind: DraftKind = SELF_SERVE_DIRECTORY_IDS.has(target.id) ? "directory-claim" : "outreach";
  try {
    const draft = await draftOutreachEmail({
      kind,
      prospectName: target.name,
      prospectUrl: target.url,
      category: target.category,
      notes: target.notes,
    });
    let updated: Prospect | undefined;
    await updateProspects((arr) => {
      const p = arr.find((x) => x.id === id);
      if (!p) return arr;
      p.emailDraft = draft;
      p.history.push({ at: nowIso(), event: "draft", detail: draft.subject });
      updated = p;
      return arr;
    });
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Redraft failed");
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/backlinks/digest", async (_req, res) => {
  const [prospects, mentions, runs] = await Promise.all([
    getProspects(),
    getMentions(),
    getRuns(),
  ]);
  const lastRun = runs[runs.length - 1];
  const unlinked = prospects.filter((p) => p.status === "unlinked");
  const linked = prospects.filter((p) => p.status === "linked");
  const contacted = prospects.filter((p) => p.status === "contacted");
  const won = prospects.filter((p) => p.status === "won");
  const newDrafts = unlinked.filter((p) => p.emailDraft).slice(0, 10);

  let md = `# Bravo Mechanical — Weekly Backlink Digest\n\n`;
  md += `Generated: ${nowIso()}\n\n`;
  if (lastRun) {
    md += `## Latest scan summary\n`;
    md += `- Started: ${lastRun.startedAt}\n`;
    md += `- Status: ${lastRun.status}\n`;
    md += `- Prospects scanned: ${lastRun.summary.prospectsScanned}\n`;
    md += `- Backlinks confirmed: ${lastRun.summary.prospectsLinked}\n`;
    md += `- Unlinked prospects: ${lastRun.summary.prospectsUnlinked}\n`;
    md += `- Unreachable: ${lastRun.summary.prospectsUnreachable}\n`;
    md += `- New drafts generated: ${lastRun.summary.draftsGenerated}\n\n`;
  }
  md += `## Pipeline totals\n`;
  md += `- Linked (live backlinks): **${linked.length}**\n`;
  md += `- Contacted, awaiting response: **${contacted.length}**\n`;
  md += `- Won: **${won.length}**\n`;
  md += `- Unlinked prospects with drafts ready to send: **${newDrafts.length}**\n`;
  md += `- Manual mentions tracked: **${mentions.length}**\n\n`;

  if (newDrafts.length > 0) {
    md += `## Top ${newDrafts.length} drafts ready to send\n\n`;
    for (const p of newDrafts) {
      md += `### ${p.name} _(${p.category})_\n`;
      md += `- URL: ${p.url}\n`;
      md += `- Subject: **${p.emailDraft?.subject}**\n\n`;
      md += `> ${(p.emailDraft?.body ?? "").split("\n").join("\n> ")}\n\n`;
      md += `---\n\n`;
    }
  }

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.send(md);
});

export default router;
