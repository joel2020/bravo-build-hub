import { Router, type IRouter } from "express";
import { batchProcess } from "@workspace/integrations-anthropic-ai/batch";
import {
  getProspects,
  updateProspects,
  getMentions,
  updateMentions,
  getRuns,
  updateRuns,
  getSettings,
  updateSettings,
  TERMINAL_STATUSES,
  type Prospect,
  type Mention,
  type Run,
  type ProspectStatus,
  type Settings,
} from "../lib/storage";
import { PROSPECT_SEED } from "../lib/prospects-seed";
import { scanUrlForBravo, discoverContactEmail } from "../lib/backlink-scanner";
import { draftOutreachEmail, type DraftKind } from "../lib/email-drafter";
import { isResendConfigured, sendEmail, getResendFromEmail } from "../lib/resend-client";
import { BRAVO } from "../lib/site-config";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function nowIso(): string { return new Date().toISOString(); }

async function ensureSeeded(): Promise<Prospect[]> {
  return updateProspects((existing) => {
    const byId = new Map(existing.map((p) => [p.id, p]));
    let changed = false;
    // Add new seeds
    for (const seed of PROSPECT_SEED) {
      if (!byId.has(seed.id)) {
        byId.set(seed.id, {
          id: seed.id,
          category: seed.category,
          name: seed.name,
          url: seed.url,
          contactUrl: seed.contactUrl,
          notes: seed.notes,
          status: "pending",
          history: [{ at: nowIso(), event: "seeded" }],
        });
        changed = true;
      } else {
        // Patch contactUrl if it was added later
        const p = byId.get(seed.id)!;
        if (!p.contactUrl && seed.contactUrl) {
          p.contactUrl = seed.contactUrl;
          changed = true;
        }
      }
    }
    // Remove prospects no longer in the curated dofollow seed (and not contacted/won)
    const seedIds = new Set(PROSPECT_SEED.map((s) => s.id));
    for (const [id, p] of byId) {
      if (!seedIds.has(id) && !TERMINAL_STATUSES.has(p.status)) {
        byId.delete(id);
        changed = true;
      }
    }
    return changed ? Array.from(byId.values()) : existing;
  });
}

router.get("/backlinks/data", async (_req, res) => {
  const [prospects, mentions, runs, settings, resendReady, fromEmail] = await Promise.all([
    ensureSeeded(),
    getMentions(),
    getRuns(),
    getSettings(),
    isResendConfigured(),
    getResendFromEmail(),
  ]);
  res.json({
    prospects,
    mentions,
    runs: runs.slice(-10).reverse(),
    site: BRAVO,
    settings,
    resend: { configured: resendReady, fromEmail },
  });
});

router.post("/backlinks/settings", async (req, res) => {
  const patch = req.body as Partial<Settings>;
  const next = await updateSettings(patch);
  res.json(next);
});

router.post("/backlinks/scan", async (_req, res) => {
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
      prospectsLinkedNofollow: 0,
      prospectsUnreachable: 0,
      mentionsScanned: 0,
      draftsGenerated: 0,
      emailsDiscovered: 0,
      emailsSent: 0,
      emailsFailed: 0,
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
  hasDofollow: boolean;
  hasNofollow: boolean;
  brandMentioned: boolean;
  at: string;
}

async function runScan(run: Run): Promise<void> {
  const settings = await getSettings();
  const initialProspects = await ensureSeeded();
  const initialMentions = await getMentions();

  // === 1. Scan prospects for backlinks ===
  const checkable = initialProspects.filter((p) => !TERMINAL_STATUSES.has(p.status));
  const prospectOutcomes: ScanOutcome[] = await batchProcess(
    checkable,
    async (p: Prospect): Promise<ScanOutcome> => {
      const result = await scanUrlForBravo(p.url);
      return {
        id: p.id,
        reachable: result.reachable,
        hasDofollow: result.hasDofollowBacklink,
        hasNofollow: result.hasNofollowBacklink,
        brandMentioned: result.brandMentioned,
        at: nowIso(),
      };
    },
    { concurrency: 5, retries: 1 },
  );

  await updateProspects((items) => {
    const map = new Map(items.map((p) => [p.id, p]));
    for (const o of prospectOutcomes) {
      const p = map.get(o.id);
      if (!p || TERMINAL_STATUSES.has(p.status)) continue;
      p.lastCheckedAt = o.at;
      p.hasBacklink = o.hasDofollow || o.hasNofollow;
      p.hasDofollowBacklink = o.hasDofollow;
      p.brandMentioned = o.brandMentioned;
      run.summary.prospectsScanned += 1;
      if (!o.reachable) {
        p.status = "unreachable";
        run.summary.prospectsUnreachable += 1;
        p.history.push({ at: o.at, event: "scan", detail: "unreachable" });
      } else if (o.hasDofollow) {
        p.status = "linked";
        run.summary.prospectsLinked += 1;
        p.history.push({ at: o.at, event: "scan", detail: "dofollow backlink found" });
      } else if (o.hasNofollow && settings.dofollowOnly) {
        // Only nofollow link present; treat as still-needed
        p.status = "linked-nofollow";
        run.summary.prospectsLinkedNofollow += 1;
        p.history.push({ at: o.at, event: "scan", detail: "nofollow link only — keep pursuing dofollow" });
      } else if (o.hasNofollow) {
        p.status = "linked";
        run.summary.prospectsLinked += 1;
        p.history.push({ at: o.at, event: "scan", detail: "nofollow link found (counted as linked)" });
      } else {
        p.status = "unlinked";
        run.summary.prospectsUnlinked += 1;
        p.history.push({
          at: o.at, event: "scan",
          detail: o.brandMentioned ? "brand mentioned, no link" : "no link",
        });
      }
    }
    return Array.from(map.values());
  });

  // === 2. Scan existing mentions ===
  const mentionOutcomes: ScanOutcome[] = await batchProcess(
    initialMentions.filter((m) => !TERMINAL_STATUSES.has(m.status)),
    async (m: Mention): Promise<ScanOutcome> => {
      const r = await scanUrlForBravo(m.url);
      return {
        id: m.id,
        reachable: r.reachable,
        hasDofollow: r.hasDofollowBacklink,
        hasNofollow: r.hasNofollowBacklink,
        brandMentioned: r.brandMentioned,
        at: nowIso(),
      };
    },
    { concurrency: 5, retries: 1 },
  );

  await updateMentions((items) => {
    const map = new Map(items.map((m) => [m.id, m]));
    for (const o of mentionOutcomes) {
      const m = map.get(o.id);
      if (!m || TERMINAL_STATUSES.has(m.status)) continue;
      m.lastCheckedAt = o.at;
      m.hasBacklink = o.hasDofollow || o.hasNofollow;
      m.hasDofollowBacklink = o.hasDofollow;
      run.summary.mentionsScanned += 1;
      if (!o.reachable) m.status = "unreachable";
      else if (o.hasDofollow) m.status = "linked";
      else if (o.hasNofollow && settings.dofollowOnly) m.status = "linked-nofollow";
      else if (o.hasNofollow) m.status = "linked";
      else m.status = "unlinked";
    }
    return Array.from(map.values());
  });

  // === 3. Discover contact emails for prospects we'll outreach ===
  const afterScanProspects = await getProspects();
  const needEmail = afterScanProspects.filter(
    (p) =>
      (p.status === "unlinked" || p.status === "linked-nofollow") &&
      !p.contactEmail,
  );
  const discovered = await batchProcess(
    needEmail,
    async (p: Prospect) => {
      const email = await discoverContactEmail(p.url, p.contactUrl);
      return { id: p.id, email };
    },
    { concurrency: 4, retries: 1 },
  );
  await updateProspects((items) => {
    const map = new Map(items.map((p) => [p.id, p]));
    for (const d of discovered) {
      const p = map.get(d.id);
      if (!p) continue;
      if (d.email && !p.contactEmail) {
        p.contactEmail = d.email;
        run.summary.emailsDiscovered += 1;
        p.history.push({ at: nowIso(), event: "email-discovered", detail: d.email });
      }
    }
    return Array.from(map.values());
  });

  // === 4. Draft emails for items missing a draft ===
  const afterEmailProspects = await getProspects();
  const afterScanMentions = await getMentions();

  type DraftJob =
    | { kind: DraftKind; targetKind: "prospect"; id: string; name: string; url: string; category?: string; notes?: string }
    | { kind: DraftKind; targetKind: "mention"; id: string; name: string; url: string; context?: string };
  const jobs: DraftJob[] = [];
  for (const p of afterEmailProspects) {
    if ((p.status === "unlinked" || p.status === "linked-nofollow") && !p.emailDraft) {
      jobs.push({
        kind: "outreach",
        targetKind: "prospect",
        id: p.id, name: p.name, url: p.url,
        category: p.category, notes: p.notes,
      });
    }
  }
  for (const m of afterScanMentions) {
    if ((m.status === "unlinked" || m.status === "linked-nofollow") && !m.emailDraft) {
      jobs.push({
        kind: "unlinked-mention", targetKind: "mention",
        id: m.id, name: safeHostname(m.url), url: m.url, context: m.context,
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

  // === 5. Auto-send emails (if enabled and Resend configured) ===
  if (settings.autoSend && (await isResendConfigured())) {
    const sendableProspects = (await getProspects()).filter(
      (p) =>
        (p.status === "unlinked" || p.status === "linked-nofollow") &&
        p.emailDraft &&
        p.contactEmail &&
        !TERMINAL_STATUSES.has(p.status),
    );
    const sendableMentions = (await getMentions()).filter(
      (m) =>
        (m.status === "unlinked" || m.status === "linked-nofollow") &&
        m.emailDraft &&
        m.contactEmail &&
        !TERMINAL_STATUSES.has(m.status),
    );

    const sendResults = await batchProcess(
      [
        ...sendableProspects.map((p) => ({ kind: "prospect" as const, id: p.id, to: p.contactEmail!, subject: p.emailDraft!.subject, body: p.emailDraft!.body })),
        ...sendableMentions.map((m) => ({ kind: "mention" as const, id: m.id, to: m.contactEmail!, subject: m.emailDraft!.subject, body: m.emailDraft!.body })),
      ],
      async (job) => {
        const result = await sendEmail({
          to: job.to,
          subject: job.subject,
          body: appendSignature(job.body),
          replyTo: BRAVO.email,
        });
        return { job, result };
      },
      { concurrency: 2, retries: 1 },
    );

    await updateProspects((items) => {
      const map = new Map(items.map((p) => [p.id, p]));
      for (const r of sendResults) {
        if (r.job.kind !== "prospect") continue;
        const p = map.get(r.job.id);
        if (!p || TERMINAL_STATUSES.has(p.status)) continue;
        const sent = {
          to: r.job.to, subject: r.job.subject, body: r.job.body,
          sentAt: nowIso(),
          ...(("error" in r.result) ? { error: r.result.error } : { resendId: r.result.id }),
        };
        p.sent = [...(p.sent ?? []), sent];
        if ("error" in r.result) {
          run.summary.emailsFailed += 1;
          p.history.push({ at: sent.sentAt, event: "send-failed", detail: r.result.error });
        } else {
          run.summary.emailsSent += 1;
          p.status = "contacted";
          p.contactedAt = sent.sentAt;
          p.history.push({ at: sent.sentAt, event: "sent", detail: `→ ${r.job.to}` });
        }
      }
      return Array.from(map.values());
    });
    await updateMentions((items) => {
      const map = new Map(items.map((m) => [m.id, m]));
      for (const r of sendResults) {
        if (r.job.kind !== "mention") continue;
        const m = map.get(r.job.id);
        if (!m || TERMINAL_STATUSES.has(m.status)) continue;
        const sent = {
          to: r.job.to, subject: r.job.subject, body: r.job.body,
          sentAt: nowIso(),
          ...(("error" in r.result) ? { error: r.result.error } : { resendId: r.result.id }),
        };
        m.sent = [...(m.sent ?? []), sent];
        if ("error" in r.result) run.summary.emailsFailed += 1;
        else { run.summary.emailsSent += 1; m.status = "contacted"; m.contactedAt = sent.sentAt; }
      }
      return Array.from(map.values());
    });
  }

  run.status = "completed";
  run.finishedAt = nowIso();
  await updateRuns((all) => {
    const idx = all.findIndex((r) => r.id === run.id);
    if (idx >= 0) all[idx] = run; else all.push(run);
    return all;
  });
  logger.info({ summary: run.summary }, "Scan completed");
}

function appendSignature(body: string): string {
  const sig = `\n\n— ${BRAVO.ownerName}\n${BRAVO.brand}\n${BRAVO.phone}\n${BRAVO.siteUrl}`;
  return body.includes(BRAVO.phone) ? body : body + sig;
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

router.post("/backlinks/mentions", async (req, res) => {
  const { url, context, contactEmail } = req.body as { url?: string; context?: string; contactEmail?: string };
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
    url, source: "manual", context, contactEmail,
    status: "pending", addedAt: nowIso(),
  };
  try {
    const result = await scanUrlForBravo(url);
    m.lastCheckedAt = nowIso();
    m.hasBacklink = result.hasBacklink;
    m.hasDofollowBacklink = result.hasDofollowBacklink;
    if (!result.reachable) m.status = "unreachable";
    else if (result.hasDofollowBacklink) m.status = "linked";
    else if (result.hasNofollowBacklink) m.status = "linked-nofollow";
    else {
      m.status = "unlinked";
      try {
        m.emailDraft = await draftOutreachEmail({
          kind: "unlinked-mention",
          prospectName: safeHostname(url),
          prospectUrl: url,
          contextSnippet: context,
        });
      } catch (err) { logger.error({ err }, "Inline draft failed"); }
    }
  } catch (err) { logger.error({ err }, "Inline mention scan failed"); }
  await updateMentions((all) => [...all, m]);
  res.json(m);
});

router.post("/backlinks/prospects/:id", async (req, res) => {
  const { id } = req.params;
  const patch = req.body as Partial<Pick<Prospect, "contactEmail" | "notes">>;
  let updated: Prospect | undefined;
  await updateProspects((items) => {
    const p = items.find((x) => x.id === id);
    if (!p) return items;
    if (typeof patch.contactEmail === "string") p.contactEmail = patch.contactEmail || undefined;
    if (typeof patch.notes === "string") p.notes = patch.notes;
    updated = p;
    return items;
  });
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(updated);
});

router.post("/backlinks/prospects/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: ProspectStatus };
  const allowed: ProspectStatus[] = [
    "pending","linked","linked-nofollow","unlinked","contacted","responded","won","skipped","unreachable",
  ];
  if (!status || !allowed.includes(status)) { res.status(400).json({ error: "invalid status" }); return; }
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
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(updated);
});

router.post("/backlinks/mentions/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: ProspectStatus };
  if (!status) { res.status(400).json({ error: "missing status" }); return; }
  let updated: Mention | undefined;
  await updateMentions((items) => {
    const m = items.find((x) => x.id === id);
    if (!m) return items;
    m.status = status;
    if (status === "contacted") m.contactedAt = nowIso();
    updated = m;
    return items;
  });
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(updated);
});

router.post("/backlinks/prospects/:id/redraft", async (req, res) => {
  const { id } = req.params;
  const items = await getProspects();
  const target = items.find((x) => x.id === id);
  if (!target) { res.status(404).json({ error: "not found" }); return; }
  try {
    const draft = await draftOutreachEmail({
      kind: "outreach",
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

router.post("/backlinks/prospects/:id/send", async (req, res) => {
  const { id } = req.params;
  const list = await getProspects();
  const p = list.find((x) => x.id === id);
  if (!p) { res.status(404).json({ error: "not found" }); return; }
  if (!p.contactEmail) { res.status(400).json({ error: "no contactEmail set" }); return; }
  if (!p.emailDraft) { res.status(400).json({ error: "no draft to send" }); return; }
  if (!(await isResendConfigured())) { res.status(400).json({ error: "Resend not configured" }); return; }
  const result = await sendEmail({
    to: p.contactEmail,
    subject: p.emailDraft.subject,
    body: appendSignature(p.emailDraft.body),
    replyTo: BRAVO.email,
  });
  await updateProspects((items) => {
    const t = items.find((x) => x.id === id);
    if (!t) return items;
    const sent = {
      to: t.contactEmail!, subject: t.emailDraft!.subject, body: appendSignature(t.emailDraft!.body),
      sentAt: nowIso(),
      ...(("error" in result) ? { error: result.error } : { resendId: result.id }),
    };
    t.sent = [...(t.sent ?? []), sent];
    if (!("error" in result)) {
      t.status = "contacted";
      t.contactedAt = sent.sentAt;
      t.history.push({ at: sent.sentAt, event: "sent", detail: `→ ${t.contactEmail}` });
    } else {
      t.history.push({ at: sent.sentAt, event: "send-failed", detail: result.error });
    }
    return items;
  });
  res.json(result);
});

router.get("/backlinks/digest", async (_req, res) => {
  const [prospects, mentions, runs] = await Promise.all([
    getProspects(), getMentions(), getRuns(),
  ]);
  const lastRun = runs[runs.length - 1];
  const linked = prospects.filter((p) => p.status === "linked");
  const linkedNofollow = prospects.filter((p) => p.status === "linked-nofollow");
  const contacted = prospects.filter((p) => p.status === "contacted");
  const won = prospects.filter((p) => p.status === "won");
  const unlinked = prospects.filter((p) => p.status === "unlinked");
  const newDrafts = unlinked.filter((p) => p.emailDraft).slice(0, 10);

  let md = `# Bravo Mechanical — Weekly Backlink Digest\n\nGenerated: ${nowIso()}\n\n`;
  if (lastRun) {
    md += `## Latest scan\n`;
    md += `- Started: ${lastRun.startedAt}\n- Status: ${lastRun.status}\n`;
    md += `- Prospects scanned: ${lastRun.summary.prospectsScanned}\n`;
    md += `- Dofollow backlinks confirmed: ${lastRun.summary.prospectsLinked}\n`;
    md += `- Nofollow-only (still pursuing dofollow): ${lastRun.summary.prospectsLinkedNofollow}\n`;
    md += `- Unlinked: ${lastRun.summary.prospectsUnlinked}\n`;
    md += `- Unreachable: ${lastRun.summary.prospectsUnreachable}\n`;
    md += `- Drafts generated: ${lastRun.summary.draftsGenerated}\n`;
    md += `- Emails discovered: ${lastRun.summary.emailsDiscovered}\n`;
    md += `- Emails auto-sent: ${lastRun.summary.emailsSent}\n`;
    md += `- Send failures: ${lastRun.summary.emailsFailed}\n\n`;
  }
  md += `## Pipeline totals\n`;
  md += `- Live dofollow backlinks: **${linked.length}**\n`;
  md += `- Nofollow-only links: **${linkedNofollow.length}**\n`;
  md += `- Contacted, awaiting response: **${contacted.length}**\n`;
  md += `- Won: **${won.length}**\n`;
  md += `- Drafts queued: **${newDrafts.length}**\n`;
  md += `- Manual mentions tracked: **${mentions.length}**\n\n`;

  if (newDrafts.length > 0) {
    md += `## Top ${newDrafts.length} drafts\n\n`;
    for (const p of newDrafts) {
      md += `### ${p.name} _(${p.category})_\n`;
      md += `- URL: ${p.url}\n`;
      md += `- Email: ${p.contactEmail ?? "(not yet discovered)"}\n`;
      md += `- Subject: **${p.emailDraft?.subject}**\n\n`;
      md += `> ${(p.emailDraft?.body ?? "").split("\n").join("\n> ")}\n\n---\n\n`;
    }
  }
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.send(md);
});

export default router;
