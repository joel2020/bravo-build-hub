import { useEffect, useMemo, useState } from "react";
import { api, type DataResponse, type Prospect, type Mention, type ProspectStatus, type CitationsResponse, type CitationSite, type CitationStatus, type NapPackage, type SocialDataResponse, type SocialPost, type PlatformInfo } from "./lib/api";

type TabId = "overview" | "prospects" | "mentions" | "drafts" | "sent" | "citations" | "social" | "runs";

function StatusBadge({ status }: { status: ProspectStatus }) {
  const cls =
    status === "linked" || status === "won" ? "badge badge-good"
      : status === "contacted" || status === "responded" ? "badge badge-info"
      : status === "unreachable" || status === "skipped" ? "badge badge-bad"
      : status === "unlinked" || status === "linked-nofollow" ? "badge badge-warn"
      : "badge";
  return <span className={cls}>{status}</span>;
}

function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => undefined); }

export default function App() {
  const [data, setData] = useState<DataResponse | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try { setData(await api.getData()); setError(null); }
    catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { refresh(); }, []);
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
      linkedNofollow: p.filter((x) => x.status === "linked-nofollow").length,
      unlinked: p.filter((x) => x.status === "unlinked").length,
      contacted: p.filter((x) => x.status === "contacted" || x.status === "responded").length,
      won: p.filter((x) => x.status === "won").length,
      drafts: p.filter((x) => x.emailDraft).length,
      withEmail: p.filter((x) => x.contactEmail).length,
      sent: p.reduce((acc, x) => acc + (x.sent?.length ?? 0), 0),
    };
  }, [data]);

  async function handleScan() {
    setScanning(true);
    try { await api.startScan(); await refresh(); }
    catch (err) { setError((err as Error).message); setScanning(false); }
  }

  return (
    <div style={{ minHeight: "100%", padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#22d3ee)" }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Backlink Outreach Agent</h1>
            <span className="badge badge-info">{data?.site.brand ?? "Bravo Mechanical"}</span>
            <span className="badge badge-good">dofollow only</span>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Scans curated dofollow targets for{" "}
            <a href={data?.site.siteUrl} target="_blank" rel="noopener noreferrer">{data?.site.domain}</a>
            , discovers contact emails, drafts personalized outreach, and {data?.settings?.autoSend ? "sends them automatically" : "queues them for review"}.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a className="btn" href={api.digestUrl()} target="_blank" rel="noopener noreferrer">↓ Digest (.md)</a>
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning}>
            {scanning ? "Running…" : "Run agent now"}
          </button>
        </div>
      </header>

      {data && <SettingsBar data={data} onChange={refresh} />}

      {error && <div className="panel" style={{ padding: 12, marginBottom: 16, borderColor: "var(--bad)", color: "var(--bad)" }}>{error}</div>}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 20 }}>
          <Stat label="Targets" value={stats.total} />
          <Stat label="Dofollow live" value={stats.linked} accent="good" />
          <Stat label="Nofollow only" value={stats.linkedNofollow} accent="warn" />
          <Stat label="Drafts" value={stats.drafts} accent="info" />
          <Stat label="With email" value={stats.withEmail} accent="info" />
          <Stat label="Auto-sent" value={stats.sent} accent="info" />
          <Stat label="Won" value={stats.won} accent="good" />
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {([
          ["overview", "Overview"],
          ["prospects", `Targets (${data?.prospects.length ?? 0})`],
          ["drafts", `Drafts (${stats?.drafts ?? 0})`],
          ["sent", `Sent (${stats?.sent ?? 0})`],
          ["mentions", `Mentions (${data?.mentions.length ?? 0})`],
          ["citations", "Citations"],
          ["social", "Social"],
          ["runs", "Scan history"],
        ] as Array<[TabId, string]>).map(([id, label]) => (
          <div key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {!data ? <div className="muted">Loading…</div>
        : tab === "overview" ? <Overview data={data} onScan={handleScan} scanning={scanning} />
        : tab === "prospects" ? <ProspectsTable data={data} onChange={refresh} />
        : tab === "drafts" ? <DraftsList data={data} onChange={refresh} />
        : tab === "sent" ? <SentList data={data} />
        : tab === "mentions" ? <MentionsPanel data={data} onChange={refresh} />
        : tab === "citations" ? <CitationsPanel />
        : tab === "social" ? <SocialPanel />
        : <RunsList data={data} />}
    </div>
  );
}

function SettingsBar({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  return (
    <div className="panel" style={{ padding: 12, marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: data.resend.configured ? "var(--good)" : "var(--bad)" }} />
        <span style={{ fontSize: 13 }}>
          Email sender: <strong>{data.resend.configured ? `Resend (${data.resend.fromEmail})` : "Not configured"}</strong>
        </span>
      </div>
      <div style={{ flex: 1 }} />
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={data.settings.autoSend}
          onChange={async (e) => { await api.updateSettings({ autoSend: e.target.checked }); onChange(); }}
        />
        Auto-send drafts during scans
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={data.settings.dofollowOnly}
          onChange={async (e) => { await api.updateSettings({ dofollowOnly: e.target.checked }); onChange(); }}
        />
        Only count dofollow as "linked"
      </label>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "good" | "warn" | "info" }) {
  const color = accent === "good" ? "var(--good)" : accent === "warn" ? "var(--warn)" : accent === "info" ? "var(--accent)" : "var(--text)";
  return (
    <div className="panel" style={{ padding: "12px 14px" }}>
      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Overview({ data, onScan, scanning }: { data: DataResponse; onScan: () => void; scanning: boolean }) {
  const lastRun = data.runs[0];
  const categories = Array.from(new Set(data.prospects.map((p) => p.category)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div className="panel" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>How this agent works (fully autonomous)</h2>
        <ol className="muted" style={{ lineHeight: 1.7, fontSize: 13, paddingLeft: 18 }}>
          <li>Tracks {data.prospects.length} curated <strong>dofollow-only</strong> targets — Westchester chambers, regional press, HVAC trade associations, NY clean-energy programs, and community orgs. Generic citation directories that use rel="nofollow" (Yelp, BBB, Angi, YellowPages, etc.) are intentionally excluded.</li>
          <li>On each scan: fetches every target, parses the HTML, and only counts a backlink as <span className="badge badge-good">linked</span> if the <code>&lt;a&gt;</code> to {data.site.domain} is dofollow. Nofollow-only links are flagged <span className="badge badge-warn">linked-nofollow</span> so the agent keeps pursuing a dofollow.</li>
          <li>For each unlinked target, scrapes the contact page + homepage for a <code>mailto:</code> address.</li>
          <li>Drafts a short, specific outreach email with Claude — no spammy templates, no link-for-link offers.</li>
          <li>If <strong>Auto-send</strong> is on and a contact email was discovered, sends the email through Resend automatically and marks the target <span className="badge badge-info">contacted</span>. Otherwise the draft sits in the Drafts tab for one-click manual send.</li>
          <li>Manual brand mentions you paste in get the same treatment.</li>
        </ol>
        <div className="panel-2" style={{ padding: 12, marginTop: 14, fontSize: 12 }}>
          <strong>Schedule it weekly:</strong> in Replit Deployments, create a Scheduled Deployment that hits{" "}
          <span className="kbd">POST /api/backlinks/scan</span> once a week. With auto-send on, no human action needed between scans.
        </div>
      </div>
      <div className="panel" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Latest scan</h2>
        {!lastRun ? (
          <div className="muted" style={{ fontSize: 13 }}>No scans yet. Click <strong>Run agent now</strong>.</div>
        ) : (
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div className="muted">Started {new Date(lastRun.startedAt).toLocaleString()}</div>
            <div>Status: <span className={`badge ${lastRun.status === "completed" ? "badge-good" : lastRun.status === "running" ? "badge-info" : "badge-bad"}`}>{lastRun.status}</span></div>
            <hr style={{ borderColor: "var(--border)", margin: "10px 0" }} />
            <div>Scanned: <strong>{lastRun.summary.prospectsScanned}</strong></div>
            <div style={{ color: "var(--good)" }}>Dofollow links: <strong>{lastRun.summary.prospectsLinked}</strong></div>
            <div style={{ color: "var(--warn)" }}>Nofollow only: <strong>{lastRun.summary.prospectsLinkedNofollow}</strong></div>
            <div style={{ color: "var(--warn)" }}>Unlinked: <strong>{lastRun.summary.prospectsUnlinked}</strong></div>
            <div style={{ color: "var(--accent)" }}>Drafts: <strong>{lastRun.summary.draftsGenerated}</strong></div>
            <div style={{ color: "var(--accent)" }}>Emails discovered: <strong>{lastRun.summary.emailsDiscovered}</strong></div>
            <div style={{ color: "var(--good)" }}>Emails sent: <strong>{lastRun.summary.emailsSent}</strong></div>
            {lastRun.summary.emailsFailed > 0 && <div style={{ color: "var(--bad)" }}>Send failures: <strong>{lastRun.summary.emailsFailed}</strong></div>}
            {lastRun.summary.error && <div style={{ color: "var(--bad)", marginTop: 6 }}>Error: {lastRun.summary.error}</div>}
          </div>
        )}
        <button className="btn btn-primary" style={{ marginTop: 12, width: "100%" }} onClick={onScan} disabled={scanning}>
          {scanning ? "Running…" : "Run agent now"}
        </button>
        <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>Categories: {categories.join(" · ")}</div>
      </div>
    </div>
  );
}

function ProspectsTable({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  const [filter, setFilter] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const categories = Array.from(new Set(data.prospects.map((p) => p.category)));
  const filtered = data.prospects.filter((p) =>
    (filter === "all" || p.status === filter) && (category === "all" || p.category === category),
  );

  return (
    <div className="panel">
      <div style={{ padding: 12, display: "flex", gap: 10, borderBottom: "1px solid var(--border)" }}>
        <select className="input" style={{ width: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {["pending","unlinked","linked","linked-nofollow","contacted","responded","won","skipped","unreachable"].map((s) => <option key={s} value={s}>{s}</option>)}
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
            <th style={{ padding: "10px 14px" }}>Contact email</th>
            <th style={{ padding: "10px 14px" }}>Last checked</th>
            <th style={{ padding: "10px 14px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => <ProspectRow key={p.id} p={p} onChange={onChange} resendOk={data.resend.configured} />)}
        </tbody>
      </table>
    </div>
  );
}

function ProspectRow({ p, onChange, resendOk }: { p: Prospect; onChange: () => void; resendOk: boolean }) {
  const [emailDraft, setEmailDraft] = useState(p.contactEmail ?? "");
  useEffect(() => { setEmailDraft(p.contactEmail ?? ""); }, [p.contactEmail]);

  return (
    <tr style={{ borderTop: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 14px" }}>
        <a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a>
        {p.notes && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{p.notes}</div>}
      </td>
      <td style={{ padding: "10px 14px" }} className="muted">{p.category}</td>
      <td style={{ padding: "10px 14px" }}>
        <StatusBadge status={p.status} />
        {p.emailDraft && <div style={{ marginTop: 4 }}><span className="badge badge-info">draft ready</span></div>}
      </td>
      <td style={{ padding: "10px 14px" }}>
        <input
          className="input"
          style={{ padding: "4px 8px", fontSize: 12, width: 220 }}
          placeholder="not yet discovered"
          value={emailDraft}
          onChange={(e) => setEmailDraft(e.target.value)}
          onBlur={async () => {
            if ((emailDraft || "") !== (p.contactEmail || "")) {
              await api.patchProspect(p.id, { contactEmail: emailDraft });
              onChange();
            }
          }}
        />
      </td>
      <td style={{ padding: "10px 14px" }} className="muted">
        {p.lastCheckedAt ? new Date(p.lastCheckedAt).toLocaleDateString() : "—"}
      </td>
      <td style={{ padding: "10px 14px", display: "flex", gap: 6 }}>
        <select
          className="input"
          style={{ width: 110, padding: "4px 6px", fontSize: 11 }}
          value={p.status}
          onChange={async (e) => { await api.setProspectStatus(p.id, e.target.value as ProspectStatus); onChange(); }}
        >
          {["pending","unlinked","linked","linked-nofollow","contacted","responded","won","skipped","unreachable"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {p.emailDraft && p.contactEmail && resendOk && p.status !== "contacted" && p.status !== "won" && (
          <button
            className="btn btn-good"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={async () => {
              const r = await api.sendNow(p.id);
              if (r.error) alert(r.error);
              onChange();
            }}
          >Send</button>
        )}
      </td>
    </tr>
  );
}

function DraftsList({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  const items: Array<{ kind: "p"; p: Prospect } | { kind: "m"; m: Mention }> = [];
  for (const p of data.prospects) if (p.emailDraft && p.status !== "won" && p.status !== "contacted") items.push({ kind: "p", p });
  for (const m of data.mentions) if (m.emailDraft && m.status !== "won" && m.status !== "contacted") items.push({ kind: "m", m });

  if (items.length === 0) {
    return <div className="panel" style={{ padding: 24, textAlign: "center" }}><div className="muted">No drafts queued. Run the agent to generate them.</div></div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((it, i) => {
        const isMention = it.kind === "m";
        const target = isMention ? it.m : it.p;
        const draft = target.emailDraft!;
        const name = isMention ? new URL(target.url).hostname : (target as Prospect).name;
        const cat = isMention ? "Manual mention" : (target as Prospect).category;
        const email = target.contactEmail;
        return (
          <div key={i} className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {cat} · <a href={target.url} target="_blank" rel="noopener noreferrer">{target.url}</a>
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  To: <strong>{email ?? <span className="muted">no email yet</span>}</strong>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StatusBadge status={target.status} />
                <button className="btn" onClick={() => copyToClipboard(`Subject: ${draft.subject}\n\n${draft.body}`)}>📋 Copy</button>
                {!isMention && <button className="btn" onClick={async () => { await api.redraft((target as Prospect).id); onChange(); }}>↻ Redraft</button>}
                {!isMention && email && data.resend.configured && (
                  <button className="btn btn-primary" onClick={async () => { const r = await api.sendNow((target as Prospect).id); if (r.error) alert(r.error); onChange(); }}>
                    📤 Send now
                  </button>
                )}
                <button
                  className="btn btn-good"
                  onClick={async () => {
                    if (isMention) await api.setMentionStatus(target.id, "contacted");
                    else await api.setProspectStatus((target as Prospect).id, "contacted");
                    onChange();
                  }}
                >✓ Mark sent</button>
              </div>
            </div>
            <div className="panel-2" style={{ padding: 12, marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Subject: {draft.subject}</div>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{draft.body}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SentList({ data }: { data: DataResponse }) {
  const items: Array<{ name: string; cat: string; sent: NonNullable<Prospect["sent"]>[number] }> = [];
  for (const p of data.prospects) for (const s of p.sent ?? []) items.push({ name: p.name, cat: p.category, sent: s });
  for (const m of data.mentions) for (const s of m.sent ?? []) items.push({ name: new URL(m.url).hostname, cat: "Manual mention", sent: s });
  items.sort((a, b) => b.sent.sentAt.localeCompare(a.sent.sentAt));

  if (items.length === 0) {
    return <div className="panel" style={{ padding: 24, textAlign: "center" }}><div className="muted">No emails sent yet.</div></div>;
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} className="panel" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{it.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{it.cat} · to <strong>{it.sent.to}</strong> · {new Date(it.sent.sentAt).toLocaleString()}</div>
            </div>
            <div>{it.sent.error ? <span className="badge badge-bad">failed</span> : <span className="badge badge-good">sent</span>}</div>
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}><strong>Subject:</strong> {it.sent.subject}</div>
          {it.sent.error && <div style={{ color: "var(--bad)", fontSize: 12, marginTop: 4 }}>Error: {it.sent.error}</div>}
        </div>
      ))}
    </div>
  );
}

function MentionsPanel({ data, onChange }: { data: DataResponse; onChange: () => void }) {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setBusy(true); setErr(null);
    try { await api.addMention(url, context || undefined, email || undefined); setUrl(""); setContext(""); setEmail(""); onChange(); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="panel" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 15 }}>Add a manual mention</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>
          Paste a URL where you've seen "Bravo Mechanical" mentioned. The agent will check whether the mention links dofollow to {data.site.domain} and, if not, draft a polite ask-for-the-link email.
        </p>
        <input className="input" placeholder="https://example.com/article-mentioning-bravo" value={url} onChange={(e) => setUrl(e.target.value)} />
        <textarea className="textarea" style={{ marginTop: 8 }} placeholder="Optional: paste the snippet of context where the mention appears" value={context} onChange={(e) => setContext(e.target.value)} />
        <input className="input" style={{ marginTop: 8 }} placeholder="Optional: contact email at the publication" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={add} disabled={busy || !url}>{busy ? "Working…" : "Add + scan + draft"}</button>
          {err && <span style={{ color: "var(--bad)", fontSize: 12, alignSelf: "center" }}>{err}</span>}
        </div>
      </div>

      <div className="panel">
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>
          Tracked mentions ({data.mentions.length})
        </div>
        {data.mentions.length === 0 ? <div className="muted" style={{ padding: 16, fontSize: 13 }}>None yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>
                <th style={{ padding: "10px 14px" }}>URL</th>
                <th style={{ padding: "10px 14px" }}>Status</th>
                <th style={{ padding: "10px 14px" }}>Dofollow?</th>
                <th style={{ padding: "10px 14px" }}>Email</th>
                <th style={{ padding: "10px 14px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.mentions.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>
                    <a href={m.url} target="_blank" rel="noopener noreferrer">{m.url}</a>
                  </td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={m.status} /></td>
                  <td style={{ padding: "10px 14px" }}>
                    {m.hasDofollowBacklink ? <span className="badge badge-good">dofollow</span>
                      : m.hasBacklink ? <span className="badge badge-warn">nofollow</span>
                      : <span className="badge">none</span>}
                  </td>
                  <td style={{ padding: "10px 14px" }} className="muted">{m.contactEmail ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <select
                      className="input"
                      style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                      value={m.status}
                      onChange={async (e) => { await api.setMentionStatus(m.id, e.target.value as ProspectStatus); onChange(); }}
                    >
                      {["pending","unlinked","linked","linked-nofollow","contacted","responded","won","skipped","unreachable"].map((s) => <option key={s} value={s}>{s}</option>)}
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

function CitationsPanel() {
  const [data, setData] = useState<CitationsResponse | null>(null);
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try { setData(await api.getCitations()); setErr(null); }
    catch (e) { setErr((e as Error).message); }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(refresh, 5000);
    const stop = setTimeout(() => setScanning(false), 60000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [scanning]);

  if (!data) return <div className="muted">Loading citations…</div>;

  const stats = {
    total: data.sites.length,
    notStarted: data.sites.filter((s) => s.record.status === "not-started").length,
    claimed: data.sites.filter((s) => s.record.status === "claimed" || s.record.status === "in-progress").length,
    live: data.sites.filter((s) => s.record.status === "live" || s.record.status === "verified").length,
    detected: data.sites.filter((s) => s.record.detected).length,
  };

  const grouped: Record<string, CitationSite[]> = {};
  for (const s of data.sites) (grouped[s.category] ??= []).push(s);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="panel" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Business-profile citations</h2>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              These sites need real human signups (CAPTCHA, phone/postcard verification — auto-creating accounts violates their ToS and gets you banned). The agent prepares the consistent NAP package below, deep-links each claim page, and tracks status. A VA can knock all of these out in ~2 hours, one time.
            </div>
          </div>
          <button className="btn btn-primary" onClick={async () => { setScanning(true); await api.scanCitations(); }} disabled={scanning}>
            {scanning ? "Scanning…" : "Detect existing listings"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 14 }}>
          <Stat label="Total" value={stats.total} />
          <Stat label="Not started" value={stats.notStarted} accent="warn" />
          <Stat label="Claimed" value={stats.claimed} accent="info" />
          <Stat label="Live / verified" value={stats.live} accent="good" />
          <Stat label="Detected on web" value={stats.detected} accent="good" />
        </div>
        {err && <div style={{ color: "var(--bad)", fontSize: 12, marginTop: 8 }}>{err}</div>}
      </div>

      <NapPanel nap={data.nap} />

      {Object.entries(grouped).map(([cat, sites]) => (
        <div key={cat} className="panel">
          <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13 }}>{cat}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>
                <th style={{ padding: "10px 14px" }}>Site</th>
                <th style={{ padding: "10px 14px" }}>Status</th>
                <th style={{ padding: "10px 14px" }}>Detected</th>
                <th style={{ padding: "10px 14px" }}>Public URL</th>
                <th style={{ padding: "10px 14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => <CitationRow key={s.id} site={s} onChange={refresh} />)}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function CitationRow({ site, onChange }: { site: CitationSite; onChange: () => void }) {
  const [publicUrl, setPublicUrl] = useState(site.record.publicUrl ?? "");
  useEffect(() => { setPublicUrl(site.record.publicUrl ?? ""); }, [site.record.publicUrl]);
  const searchUrl = site.searchUrlTemplate.replace("{q}", encodeURIComponent("Bravo Mechanical"));

  return (
    <tr style={{ borderTop: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 14px" }}>
        <div style={{ fontWeight: 600 }}>{site.name}</div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{site.notes}</div>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <select
          className="input"
          style={{ width: 140, padding: "4px 8px", fontSize: 12 }}
          value={site.record.status}
          onChange={async (e) => {
            await api.setCitationStatus(site.id, { status: e.target.value as CitationStatus });
            onChange();
          }}
        >
          {(["not-started","in-progress","claimed","verified","live","needs-update","skipped"] as CitationStatus[]).map((s) =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        {site.record.lastCheckedAt && (
          <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>
            Checked {new Date(site.record.lastCheckedAt).toLocaleDateString()}
          </div>
        )}
      </td>
      <td style={{ padding: "10px 14px" }}>
        {site.record.detected ? <span className="badge badge-good">found</span> : <span className="badge">not seen</span>}
      </td>
      <td style={{ padding: "10px 14px" }}>
        <input
          className="input"
          style={{ width: 200, padding: "4px 8px", fontSize: 11 }}
          placeholder="https://…"
          value={publicUrl}
          onChange={(e) => setPublicUrl(e.target.value)}
          onBlur={async () => {
            if (publicUrl !== (site.record.publicUrl ?? "")) {
              await api.setCitationStatus(site.id, { status: site.record.status, publicUrl });
              onChange();
            }
          }}
        />
      </td>
      <td style={{ padding: "10px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <a className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11 }} href={site.signupUrl} target="_blank" rel="noopener noreferrer">
          Open claim page ↗
        </a>
        <a className="btn" style={{ padding: "4px 10px", fontSize: 11 }} href={searchUrl} target="_blank" rel="noopener noreferrer">
          Search site ↗
        </a>
      </td>
    </tr>
  );
}

function NapPanel({ nap }: { nap: NapPackage }) {
  const napText = useMemo(() => buildNapText(nap), [nap]);
  return (
    <div className="panel" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>NAP + business package (paste this into every signup form)</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => copyToClipboard(napText)}>📋 Copy all</button>
          <button className="btn" onClick={() => copyToClipboard(nap.shortDescription)}>📋 Short desc</button>
          <button className="btn" onClick={() => copyToClipboard(nap.longDescription)}>📋 Long desc</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
        <Field label="Business name" value={nap.businessName} />
        <Field label="Legal name" value={nap.legalName} />
        <Field label="Phone" value={nap.phone} />
        <Field label="Email" value={nap.email} />
        <Field label="Website" value={nap.website} />
        <Field label="Service area" value={nap.serviceArea} />
        <Field label="Address type" value="Service-area business (no public storefront address)" />
        <Field label="Hours" value="24/7 (emergency dispatch)" />
      </div>
      <div className="panel-2" style={{ padding: 10, marginTop: 10, fontSize: 12 }}>
        <strong>Categories:</strong> {nap.categories.join(" · ")}
      </div>
      <div className="panel-2" style={{ padding: 10, marginTop: 6, fontSize: 12 }}>
        <strong>Services:</strong> {nap.services.join(" · ")}
      </div>
      <div className="panel-2" style={{ padding: 10, marginTop: 6, fontSize: 12 }}>
        <strong>Service area cities:</strong> {nap.serviceAreaList.join(", ")}
      </div>
      <div className="panel-2" style={{ padding: 10, marginTop: 6, fontSize: 12 }}>
        <strong>Short description (≤200 chars):</strong> <span className="muted">{nap.shortDescription}</span>
      </div>
      <div className="panel-2" style={{ padding: 10, marginTop: 6, fontSize: 12 }}>
        <strong>Long description:</strong> <span className="muted">{nap.longDescription}</span>
      </div>
      <div className="panel-2" style={{ padding: 10, marginTop: 6, fontSize: 12 }}>
        <strong>Keywords:</strong> {nap.keywords.join(" · ")}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
      <span className="muted" style={{ fontSize: 11, minWidth: 100 }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
      <button className="btn" style={{ padding: "1px 6px", fontSize: 10 }} onClick={() => copyToClipboard(value)}>copy</button>
    </div>
  );
}

function buildNapText(nap: NapPackage): string {
  return [
    `Business name: ${nap.businessName}`,
    `Legal name: ${nap.legalName}`,
    `Phone: ${nap.phone}`,
    `Email: ${nap.email}`,
    `Website: ${nap.website}`,
    `Service area: ${nap.serviceArea}`,
    `Address: Service-area business (no public storefront)`,
    `Hours: 24/7 — emergency dispatch`,
    `Categories: ${nap.categories.join(", ")}`,
    `Services: ${nap.services.join(", ")}`,
    `Service area cities: ${nap.serviceAreaList.join(", ")}`,
    `Payment methods: ${nap.paymentMethods.join(", ")}`,
    `Licenses: ${nap.licenses.join(", ")}`,
    ``,
    `Short description:`,
    nap.shortDescription,
    ``,
    `Long description:`,
    nap.longDescription,
    ``,
    `Keywords: ${nap.keywords.join(", ")}`,
  ].join("\n");
}

function SocialPanel() {
  const [data, setData] = useState<SocialDataResponse | null>(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [cta, setCta] = useState("Call us at (914) 555-0100");
  const [imageUrl, setImageUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try { setData(await api.getSocial()); setErr(null); }
    catch (e) { setErr((e as Error).message); }
  }
  useEffect(() => { refresh(); }, []);

  async function generate() {
    if (topic.trim().length < 5) { setErr("Topic must be at least 5 characters"); return; }
    setGenerating(true); setErr(null);
    try {
      await api.generateSocial({ topic, notes, cta, imageUrl: imageUrl || undefined });
      setTopic(""); setNotes("");
      await refresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setGenerating(false); }
  }

  if (!data) return <div className="muted">Loading…</div>;

  // Group posts by briefId, newest brief first.
  const briefs = new Map<string, SocialPost[]>();
  for (const p of data.posts) {
    const arr = briefs.get(p.briefId) ?? [];
    arr.push(p);
    briefs.set(p.briefId, arr);
  }
  const platformById = new Map(data.platforms.map((p) => [p.id, p]));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <MetaConfigBanner meta={data.meta} />

      <div className="panel" style={{ padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, marginBottom: 4 }}>Generate this week's posts</h2>
        <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
          One topic in → 9 platform-tailored posts out (different copy per platform — Facebook gets the long form, X gets the punchy version, Nextdoor gets the neighborly local-tip framing). Auto-publishes to Facebook + Instagram if Meta is configured. Other platforms get one-click composer deep-links.
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <input className="input" placeholder="Weekly topic — e.g. 'Why Westchester boilers fail in February and how to spot it early'"
            value={topic} onChange={(e) => setTopic(e.target.value)} />
          <textarea className="input" placeholder="Optional notes / context (specifics, customer story, season, etc.)"
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input className="input" placeholder="Call to action"
              value={cta} onChange={(e) => setCta(e.target.value)} />
            <input className="input" placeholder="Image URL (required for Instagram + Pinterest auto-post)"
              value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <button className="btn btn-primary" onClick={generate} disabled={generating}>
              {generating ? "Generating…" : "✨ Generate posts"}
            </button>
          </div>
          {err && <div style={{ color: "var(--bad)", fontSize: 12 }}>{err}</div>}
        </div>
      </div>

      {[...briefs.entries()].map(([briefId, posts]) => (
        <BriefCard key={briefId} briefId={briefId} posts={posts} platformById={platformById} meta={data.meta} onChange={refresh} />
      ))}

      {briefs.size === 0 && <div className="muted" style={{ fontSize: 13, padding: 16 }}>No posts yet. Add a topic above and generate.</div>}
    </div>
  );
}

function MetaConfigBanner({ meta }: { meta: SocialDataResponse["meta"] }) {
  if (meta.facebookConfigured && meta.instagramConfigured) {
    return (
      <div className="panel" style={{ padding: 12, borderColor: "var(--good)" }}>
        <div style={{ fontSize: 13 }}>
          ✅ Meta connected: <strong>{meta.pageName}</strong> (Facebook) + <strong>@{meta.igUsername}</strong> (Instagram). Posts will auto-publish.
        </div>
      </div>
    );
  }
  if (meta.facebookConfigured) {
    return (
      <div className="panel" style={{ padding: 12, borderColor: "var(--warn)" }}>
        <div style={{ fontSize: 13 }}>
          ✅ Facebook connected: <strong>{meta.pageName}</strong>. Instagram not linked — set <code>META_IG_USER_ID</code> to enable IG auto-post.
        </div>
      </div>
    );
  }
  return (
    <div className="panel" style={{ padding: 14, borderColor: "var(--warn)" }}>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        ⚠️ <strong>Meta not configured.</strong> The agent will still generate posts for every platform, but Facebook + Instagram won't auto-publish until you connect Meta. {meta.error && <span className="muted">({meta.error})</span>}
      </div>
      <details style={{ fontSize: 12, marginTop: 8 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Setup guide (~30 minutes, one time)</summary>
        <ol className="muted" style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">developers.facebook.com/apps</a> → Create App → Business type.</li>
          <li>In your new app, add the <strong>Facebook Login for Business</strong> and <strong>Instagram Graph API</strong> products.</li>
          <li>Open <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">Graph API Explorer</a>, select your app, and request these permissions: <code>pages_manage_posts</code>, <code>pages_read_engagement</code>, <code>pages_show_list</code>, <code>instagram_basic</code>, <code>instagram_content_publish</code>.</li>
          <li>Generate a User Access Token, then exchange it for a <strong>long-lived Page Access Token</strong> using the <code>/me/accounts</code> endpoint (60-day expiry — refresh quarterly).</li>
          <li>Find your Page ID in Page Settings → About. Find your Instagram Business Account ID by querying <code>/{`{page-id}`}?fields=instagram_business_account</code> in the Graph Explorer.</li>
          <li>Set these as Replit Secrets on this project: <code>META_PAGE_ACCESS_TOKEN</code>, <code>META_PAGE_ID</code>, and (optional) <code>META_IG_USER_ID</code>. Then restart the API server workflow.</li>
        </ol>
      </details>
    </div>
  );
}

function BriefCard({ briefId, posts, platformById, meta, onChange }: {
  briefId: string;
  posts: SocialPost[];
  platformById: Map<string, PlatformInfo>;
  meta: SocialDataResponse["meta"];
  onChange: () => void;
}) {
  const topic = posts[0]?.topic ?? "";
  const created = posts[0]?.createdAt ?? "";
  const draftAutoPostable = posts.filter((p) => {
    const pl = platformById.get(p.platform);
    return p.status === "draft" && pl?.autoPost
      && (p.platform === "facebook" ? meta.facebookConfigured : meta.instagramConfigured);
  });
  return (
    <div className="panel">
      <div style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{topic}</div>
          <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{new Date(created).toLocaleString()} · {posts.length} platforms</div>
        </div>
        {draftAutoPostable.length > 0 && (
          <button className="btn btn-good" onClick={async () => {
            await api.publishBrief(briefId);
            setTimeout(onChange, 3000);
          }}>
            🚀 Publish all to Meta ({draftAutoPostable.length})
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12, padding: 12 }}>
        {posts.map((p) => (
          <SocialPostCard key={p.id} post={p} platform={platformById.get(p.platform)} meta={meta} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}

function SocialPostCard({ post, platform, meta, onChange }: {
  post: SocialPost;
  platform: PlatformInfo | undefined;
  meta: SocialDataResponse["meta"];
  onChange: () => void;
}) {
  const [text, setText] = useState(post.text);
  const [hashtagsStr, setHashtagsStr] = useState(post.hashtags.join(" "));
  const [imageUrl, setImageUrl] = useState(post.imageUrl ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setText(post.text); }, [post.text]);
  useEffect(() => { setHashtagsStr(post.hashtags.join(" ")); }, [post.hashtags]);
  useEffect(() => { setImageUrl(post.imageUrl ?? ""); }, [post.imageUrl]);

  const fullText = useMemo(() => {
    const tags = hashtagsStr.trim().split(/\s+/).filter(Boolean).map((h) => h.startsWith("#") ? h : `#${h}`).join(" ");
    return tags ? `${text}\n\n${tags}` : text;
  }, [text, hashtagsStr]);

  const charCount = fullText.length;
  const overLimit = platform && charCount > platform.charLimit;

  async function save() {
    const hashtags = hashtagsStr.trim().split(/\s+/).filter(Boolean).map((h) => h.replace(/^#/, ""));
    await api.patchSocialPost(post.id, { text, hashtags, imageUrl });
    onChange();
  }

  async function publish() {
    setBusy(true);
    try {
      await save();
      const r = await api.publishSocialPost(post.id);
      if (!r.ok) alert(`Publish failed: ${r.error}`);
      await onChange();
    } finally { setBusy(false); }
  }

  const composerUrl = platform?.prefillsText
    ? composerUrlFor(post.platform, fullText)
    : composerUrlFor(post.platform, "");

  const canAutoPost = platform?.autoPost && (
    post.platform === "facebook" ? meta.facebookConfigured
      : post.platform === "instagram" ? meta.instagramConfigured && Boolean(imageUrl)
      : false
  );

  const statusBadge =
    post.status === "posted" ? <span className="badge badge-good">posted ✓</span>
    : post.status === "failed" ? <span className="badge badge-bad">failed</span>
    : post.status === "posting" ? <span className="badge badge-info">posting…</span>
    : <span className="badge">{post.status}</span>;

  return (
    <div className="panel-2" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 13 }}>{platform?.label ?? post.platform}</strong>
          {platform?.autoPost && <span className="badge badge-good">auto-post</span>}
        </div>
        {statusBadge}
      </div>
      <textarea className="input" rows={6} value={text} onChange={(e) => setText(e.target.value)} style={{ fontSize: 12 }} />
      {(platform?.hashtagBudget ?? 0) > 0 && (
        <input className="input" placeholder="Hashtags (space-separated)" value={hashtagsStr} onChange={(e) => setHashtagsStr(e.target.value)} style={{ fontSize: 12 }} />
      )}
      {(platform?.requiresImage || imageUrl) && (
        <input className="input" placeholder="Image URL (required for IG)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ fontSize: 11 }} />
      )}
      <div className="muted" style={{ fontSize: 11, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: overLimit ? "var(--bad)" : undefined }}>{charCount} / {platform?.charLimit ?? "?"} chars</span>
        {post.publicUrl && <a href={post.publicUrl} target="_blank" rel="noopener noreferrer">View live ↗</a>}
        {post.error && <span style={{ color: "var(--bad)" }} title={post.error}>error</span>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => copyToClipboard(fullText)}>📋 Copy</button>
        <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={save}>💾 Save edits</button>
        {canAutoPost ? (
          <button className="btn btn-good" style={{ padding: "4px 10px", fontSize: 11 }} onClick={publish} disabled={busy || post.status === "posted"}>
            🚀 {post.status === "posted" ? "Posted" : "Auto-post now"}
          </button>
        ) : (
          <a className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11 }} href={composerUrl} target="_blank" rel="noopener noreferrer"
            onClick={async () => {
              if (platform?.prefillsText) return; // already in URL
              await navigator.clipboard.writeText(fullText).catch(() => undefined);
            }}>
            {platform?.prefillsText ? "Open with text ↗" : "Copy + open ↗"}
          </a>
        )}
        <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={async () => {
          if (!confirm("Delete this post?")) return;
          await api.deleteSocialPost(post.id); onChange();
        }}>🗑</button>
      </div>
    </div>
  );
}

function composerUrlFor(platformId: string, text: string): string {
  switch (platformId) {
    case "linkedin": return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    case "x": return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    case "threads": return `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
    case "facebook": return "https://www.facebook.com/?sk=composer";
    case "instagram": return "https://www.instagram.com/";
    case "nextdoor": return "https://nextdoor.com/news_feed/";
    case "google-business": return "https://business.google.com/posts";
    case "pinterest": return "https://www.pinterest.com/pin-creation-tool/";
    case "youtube-community": return "https://studio.youtube.com/";
    default: return "#";
  }
}

function RunsList({ data }: { data: DataResponse }) {
  if (data.runs.length === 0) return <div className="muted">No scans yet.</div>;
  return (
    <div className="panel">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>
            <th style={{ padding: "10px 14px" }}>Started</th>
            <th style={{ padding: "10px 14px" }}>Status</th>
            <th style={{ padding: "10px 14px" }}>Scanned</th>
            <th style={{ padding: "10px 14px" }}>Dofollow</th>
            <th style={{ padding: "10px 14px" }}>Nofollow</th>
            <th style={{ padding: "10px 14px" }}>Unlinked</th>
            <th style={{ padding: "10px 14px" }}>Drafts</th>
            <th style={{ padding: "10px 14px" }}>Sent</th>
            <th style={{ padding: "10px 14px" }}>Failed</th>
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
              <td style={{ padding: "10px 14px", color: "var(--warn)" }}>{r.summary.prospectsLinkedNofollow}</td>
              <td style={{ padding: "10px 14px", color: "var(--warn)" }}>{r.summary.prospectsUnlinked}</td>
              <td style={{ padding: "10px 14px", color: "var(--accent)" }}>{r.summary.draftsGenerated}</td>
              <td style={{ padding: "10px 14px", color: "var(--good)" }}>{r.summary.emailsSent}</td>
              <td style={{ padding: "10px 14px", color: "var(--bad)" }}>{r.summary.emailsFailed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
