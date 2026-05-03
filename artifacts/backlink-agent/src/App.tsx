import { useEffect, useMemo, useState } from "react";
import { api, type DataResponse, type Prospect, type Mention, type ProspectStatus } from "./lib/api";

type TabId = "overview" | "prospects" | "mentions" | "drafts" | "runs";

function StatusBadge({ status }: { status: ProspectStatus }) {
  const cls =
    status === "linked" || status === "won"
      ? "badge badge-good"
      : status === "contacted" || status === "responded"
        ? "badge badge-info"
        : status === "unreachable" || status === "skipped"
          ? "badge badge-bad"
          : status === "unlinked"
            ? "badge badge-warn"
            : "badge";
  return <span className={cls}>{status}</span>;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => undefined);
}

export default function App() {
  const [data, setData] = useState<DataResponse | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const d = await api.getData();
      setData(d);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Auto-refresh while scanning; stop when the latest run reports completed/failed.
  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [scanning]);

  useEffect(() => {
    if (!scanning || !data) return;
    const latest = data.runs[0];
    if (latest && latest.status !== "running") setScanning(false);
  }, [scanning, data]);

  const stats = useMemo(() => {
    if (!data) return null;
    const p = data.prospects;
    return {
      total: p.length,
      linked: p.filter((x) => x.status === "linked").length,
      unlinked: p.filter((x) => x.status === "unlinked").length,
      contacted: p.filter((x) => x.status === "contacted" || x.status === "responded").length,
      won: p.filter((x) => x.status === "won").length,
      drafts: p.filter((x) => x.emailDraft).length,
      unreachable: p.filter((x) => x.status === "unreachable").length,
      pending: p.filter((x) => x.status === "pending").length,
    };
  }, [data]);

  async function handleScan() {
    setScanning(true);
    try {
      await api.startScan();
      await refresh();
    } catch (err) {
      setError((err as Error).message);
      setScanning(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#22d3ee)" }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Backlink Outreach Agent</h1>
            <span className="badge badge-info">{data?.site.brand ?? "Bravo Mechanical"}</span>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Find directories, citations, and unlinked mentions for{" "}
            <a href={data?.site.siteUrl} target="_blank" rel="noopener noreferrer">
              {data?.site.domain}
            </a>{" "}
            — drafts personalized outreach, you press send.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a className="btn" href={api.digestUrl()} target="_blank" rel="noopener noreferrer">
            ↓ Weekly digest (.md)
          </a>
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning}>
            {scanning ? "Scanning…" : "Run scan now"}
          </button>
        </div>
      </header>

      {error && (
        <div className="panel" style={{ padding: 12, marginBottom: 16, borderColor: "var(--bad)", color: "var(--bad)" }}>
          {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
          <Stat label="Prospects" value={stats.total} />
          <Stat label="Live backlinks" value={stats.linked} accent="good" />
          <Stat label="Unlinked + ready" value={stats.unlinked} accent="warn" />
          <Stat label="Drafts ready" value={stats.drafts} accent="info" />
          <Stat label="Contacted" value={stats.contacted} accent="info" />
          <Stat label="Won" value={stats.won} accent="good" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {([
          ["overview", "Overview"],
          ["prospects", `Prospects (${data?.prospects.length ?? 0})`],
          ["drafts", `Outreach drafts (${stats?.drafts ?? 0})`],
          ["mentions", `Manual mentions (${data?.mentions.length ?? 0})`],
          ["runs", "Scan history"],
        ] as Array<[TabId, string]>).map(([id, label]) => (
          <div key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {label}
          </div>
        ))}
      </div>

      {/* Body */}
      {!data ? (
        <div className="muted">Loading…</div>
      ) : tab === "overview" ? (
        <Overview data={data} onScan={handleScan} scanning={scanning} />
      ) : tab === "prospects" ? (
        <ProspectsTable data={data} onChange={refresh} />
      ) : tab === "drafts" ? (
        <DraftsList data={data} onChange={refresh} />
      ) : tab === "mentions" ? (
        <MentionsPanel data={data} onChange={refresh} />
      ) : (
        <RunsList data={data} />
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "good" | "warn" | "info" }) {
  const color =
    accent === "good" ? "var(--good)" : accent === "warn" ? "var(--warn)" : accent === "info" ? "var(--accent)" : "var(--text)";
  return (
    <div className="panel" style={{ padding: "14px 16px" }}>
      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Overview({ data, onScan, scanning }: { data: DataResponse; onScan: () => void; scanning: boolean }) {
  const lastRun = data.runs[0];
  const categories = Array.from(new Set(data.prospects.map((p) => p.category)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div className="panel" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>How this agent works</h2>
        <ol className="muted" style={{ lineHeight: 1.7, fontSize: 13, paddingLeft: 18 }}>
          <li>It maintains a curated seed list of {data.prospects.length} legitimate prospects — directories, Westchester chambers of commerce, local press, HVAC trade associations, and NY clean-energy programs.</li>
          <li>When you run a scan, it fetches each prospect site, checks whether they already link to <span className="kbd">{data.site.domain}</span>, and labels each as <span className="badge badge-good">linked</span>, <span className="badge badge-warn">unlinked</span>, or <span className="badge badge-bad">unreachable</span>.</li>
          <li>For unlinked prospects, it drafts a short, specific outreach email with Anthropic's Claude — no spammy templates.</li>
          <li>You review each draft, copy/edit, and send it yourself. You can mark each as <span className="badge badge-info">contacted</span>, <span className="badge badge-good">won</span>, or <span className="badge">skipped</span>.</li>
          <li>You can paste in any URL where you've seen Bravo Mechanical mentioned — the agent will check for a link and draft a thank-you-please-link email.</li>
          <li>The "Weekly digest (.md)" button downloads a markdown report you can paste into email or share.</li>
        </ol>
        <div className="panel-2" style={{ padding: 12, marginTop: 14, fontSize: 12 }}>
          <strong>Schedule it weekly:</strong> in Replit Deployments, create a Scheduled Deployment that hits{" "}
          <span className="kbd">POST /api/backlinks/scan</span> once a week, then opens the digest URL.
        </div>
      </div>
      <div className="panel" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Latest scan</h2>
        {!lastRun ? (
          <div className="muted" style={{ fontSize: 13 }}>
            No scans yet. Click <strong>Run scan now</strong> in the header to run the first one.
            {scanning && " Scanning…"}
          </div>
        ) : (
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div className="muted">Started {new Date(lastRun.startedAt).toLocaleString()}</div>
            <div>Status: <span className={`badge ${lastRun.status === "completed" ? "badge-good" : lastRun.status === "running" ? "badge-info" : "badge-bad"}`}>{lastRun.status}</span></div>
            <hr style={{ borderColor: "var(--border)", margin: "10px 0" }} />
            <div>Scanned: <strong>{lastRun.summary.prospectsScanned}</strong></div>
            <div>Backlinks confirmed: <strong style={{ color: "var(--good)" }}>{lastRun.summary.prospectsLinked}</strong></div>
            <div>Unlinked: <strong style={{ color: "var(--warn)" }}>{lastRun.summary.prospectsUnlinked}</strong></div>
            <div>Unreachable: <strong style={{ color: "var(--bad)" }}>{lastRun.summary.prospectsUnreachable}</strong></div>
            <div>Drafts generated: <strong style={{ color: "var(--accent)" }}>{lastRun.summary.draftsGenerated}</strong></div>
            {lastRun.summary.error && <div style={{ color: "var(--bad)", marginTop: 6 }}>Error: {lastRun.summary.error}</div>}
          </div>
        )}
        <button className="btn btn-primary" style={{ marginTop: 12, width: "100%" }} onClick={onScan} disabled={scanning}>
          {scanning ? "Scanning…" : "Run scan now"}
        </button>
        <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
          Categories tracked: {categories.join(" · ")}
        </div>
      </div>
    </div>
  );
}

function ProspectsTable({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  const [filter, setFilter] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const categories = Array.from(new Set(data.prospects.map((p) => p.category)));

  const filtered = data.prospects.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (category !== "all" && p.category !== category) return false;
    return true;
  });

  return (
    <div className="panel">
      <div style={{ padding: 12, display: "flex", gap: 10, borderBottom: "1px solid var(--border)" }}>
        <select className="input" style={{ width: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="unlinked">Unlinked</option>
          <option value="linked">Linked</option>
          <option value="contacted">Contacted</option>
          <option value="responded">Responded</option>
          <option value="won">Won</option>
          <option value="unreachable">Unreachable</option>
          <option value="skipped">Skipped</option>
        </select>
        <select className="input" style={{ width: 280 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="muted" style={{ alignSelf: "center", fontSize: 12 }}>{filtered.length} of {data.prospects.length}</div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>
            <th style={{ padding: "10px 14px" }}>Name</th>
            <th style={{ padding: "10px 14px" }}>Category</th>
            <th style={{ padding: "10px 14px" }}>Status</th>
            <th style={{ padding: "10px 14px" }}>Last checked</th>
            <th style={{ padding: "10px 14px" }}>Draft</th>
            <th style={{ padding: "10px 14px" }}>Mark as</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 14px" }}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a>
                {p.notes && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{p.notes}</div>}
              </td>
              <td style={{ padding: "10px 14px" }} className="muted">{p.category}</td>
              <td style={{ padding: "10px 14px" }}><StatusBadge status={p.status} /></td>
              <td style={{ padding: "10px 14px" }} className="muted">
                {p.lastCheckedAt ? new Date(p.lastCheckedAt).toLocaleDateString() : "—"}
              </td>
              <td style={{ padding: "10px 14px" }}>
                {p.emailDraft ? <span className="badge badge-info">draft ready</span> : <span className="muted">—</span>}
              </td>
              <td style={{ padding: "10px 14px" }}>
                <select
                  className="input"
                  style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                  value={p.status}
                  onChange={async (e) => {
                    await api.setProspectStatus(p.id, e.target.value as ProspectStatus);
                    onChange();
                  }}
                >
                  {["pending","unlinked","linked","contacted","responded","won","skipped","unreachable"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DraftsList({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  const drafts: Array<{ p: Prospect; isMention?: false } | { m: Mention; isMention: true }> = [];
  for (const p of data.prospects) if (p.emailDraft && p.status !== "won") drafts.push({ p });
  for (const m of data.mentions) if (m.emailDraft && m.status !== "won") drafts.push({ m, isMention: true });

  if (drafts.length === 0) {
    return (
      <div className="panel" style={{ padding: 24, textAlign: "center" }}>
        <div className="muted">No drafts yet. Run a scan to generate them.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {drafts.map((d, i) => {
        const isMention = "isMention" in d && d.isMention;
        const target = isMention ? (d as { m: Mention }).m : (d as { p: Prospect }).p;
        const draft = target.emailDraft!;
        const name = isMention ? new URL(target.url).hostname : (target as Prospect).name;
        const cat = isMention ? "Manual mention" : (target as Prospect).category;
        return (
          <div key={i} className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{cat} · <a href={target.url} target="_blank" rel="noopener noreferrer">{target.url}</a></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <StatusBadge status={target.status} />
                <button
                  className="btn"
                  onClick={() => copyToClipboard(`Subject: ${draft.subject}\n\n${draft.body}`)}
                >
                  📋 Copy
                </button>
                {!isMention && (
                  <button className="btn" onClick={async () => { await api.redraft(target.id); onChange(); }}>
                    ↻ Redraft
                  </button>
                )}
                <button
                  className="btn btn-good"
                  onClick={async () => {
                    if (isMention) await api.setMentionStatus(target.id, "contacted");
                    else await api.setProspectStatus(target.id, "contacted");
                    onChange();
                  }}
                >
                  ✓ Mark sent
                </button>
              </div>
            </div>
            <div className="panel-2" style={{ padding: 12, marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Subject: {draft.subject}</div>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {draft.body}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MentionsPanel({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setErr(null);
    try {
      await api.addMention(url, context || undefined);
      setUrl("");
      setContext("");
      onChange();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="panel" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 15 }}>Add a manual mention</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>
          Paste a URL where you've seen "Bravo Mechanical" mentioned (article, forum post, vendor list, etc.). The agent will fetch the page, check whether it already links to {data.site.domain}, and if not, draft a polite ask-for-the-link email.
        </p>
        <input className="input" placeholder="https://example.com/article-mentioning-bravo" value={url} onChange={(e) => setUrl(e.target.value)} />
        <textarea className="textarea" style={{ marginTop: 8 }} placeholder="Optional: paste the snippet of context where the mention appears" value={context} onChange={(e) => setContext(e.target.value)} />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={add} disabled={busy || !url}>
            {busy ? "Working…" : "Add + scan + draft"}
          </button>
          {err && <span style={{ color: "var(--bad)", fontSize: 12, alignSelf: "center" }}>{err}</span>}
        </div>
      </div>

      <div className="panel">
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>
          Tracked mentions ({data.mentions.length})
        </div>
        {data.mentions.length === 0 ? (
          <div className="muted" style={{ padding: 16, fontSize: 13 }}>None yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>
                <th style={{ padding: "10px 14px" }}>URL</th>
                <th style={{ padding: "10px 14px" }}>Status</th>
                <th style={{ padding: "10px 14px" }}>Has link?</th>
                <th style={{ padding: "10px 14px" }}>Added</th>
                <th style={{ padding: "10px 14px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.mentions.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis" }}>
                    <a href={m.url} target="_blank" rel="noopener noreferrer">{m.url}</a>
                  </td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={m.status} /></td>
                  <td style={{ padding: "10px 14px" }}>
                    {m.hasBacklink === undefined ? "—" : m.hasBacklink ? <span className="badge badge-good">yes</span> : <span className="badge badge-warn">no</span>}
                  </td>
                  <td style={{ padding: "10px 14px" }} className="muted">{new Date(m.addedAt).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <select
                      className="input"
                      style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                      value={m.status}
                      onChange={async (e) => { await api.setMentionStatus(m.id, e.target.value as ProspectStatus); onChange(); }}
                    >
                      {["pending","unlinked","linked","contacted","responded","won","skipped","unreachable"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RunsList({ data }: { data: DataResponse }) {
  if (data.runs.length === 0) {
    return <div className="muted">No scans yet.</div>;
  }
  return (
    <div className="panel">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>
            <th style={{ padding: "10px 14px" }}>Started</th>
            <th style={{ padding: "10px 14px" }}>Status</th>
            <th style={{ padding: "10px 14px" }}>Scanned</th>
            <th style={{ padding: "10px 14px" }}>Linked</th>
            <th style={{ padding: "10px 14px" }}>Unlinked</th>
            <th style={{ padding: "10px 14px" }}>Unreachable</th>
            <th style={{ padding: "10px 14px" }}>Drafts</th>
          </tr>
        </thead>
        <tbody>
          {data.runs.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 14px" }}>{new Date(r.startedAt).toLocaleString()}</td>
              <td style={{ padding: "10px 14px" }}>
                <span className={`badge ${r.status === "completed" ? "badge-good" : r.status === "running" ? "badge-info" : "badge-bad"}`}>{r.status}</span>
              </td>
              <td style={{ padding: "10px 14px" }}>{r.summary.prospectsScanned}</td>
              <td style={{ padding: "10px 14px", color: "var(--good)" }}>{r.summary.prospectsLinked}</td>
              <td style={{ padding: "10px 14px", color: "var(--warn)" }}>{r.summary.prospectsUnlinked}</td>
              <td style={{ padding: "10px 14px", color: "var(--bad)" }}>{r.summary.prospectsUnreachable}</td>
              <td style={{ padding: "10px 14px", color: "var(--accent)" }}>{r.summary.draftsGenerated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
