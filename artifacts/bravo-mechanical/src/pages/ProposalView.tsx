import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || "https://tzczkcvavudoyuuetwcr.supabase.co";
const PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() || "";
const FN_URL = `${SUPABASE_URL}/functions/v1/proposal-public`;

type LineItem = { description: string; item_type: string | null; quantity: number; unit_price: number; total: number };
type Proposal = {
  estimate_number: string; status: string; scope_of_work: string | null; customer_notes: string | null;
  subtotal: number | null; tax_rate: number | null; tax_amount: number | null; discount_amount: number | null; total: number | null;
  expiration_date: string | null; terms_and_conditions: string | null;
  approved_at: string | null; declined_at: string | null; signed_at: string | null; signer: string | null; decline_reason: string | null;
  expired: boolean; customer_name: string;
};

const money = (v: number | null | undefined) => (v == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v));

export default function ProposalView() {
  const { token } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signer, setSigner] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useSeo({ title: `Proposal | ${SITE.name}`, description: "View and approve your proposal.", canonical: `${SITE.siteUrl}/proposal`, noindex: true });

  const headers = { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${PUBLISHABLE_KEY}`, "Content-Type": "application/json" };

  const fetchProposal = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${FN_URL}?token=${encodeURIComponent(token || "")}`, { headers });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Proposal not found"); }
      else { setProposal(data.proposal); setItems(data.line_items || []); }
    } catch { setError("Could not load this proposal. Please check your link or contact us."); }
    setLoading(false);
  };
  useEffect(() => { fetchProposal(); /* eslint-disable-next-line */ }, [token]);

  const respond = async (action: "accept" | "decline") => {
    if (action === "accept" && !signer.trim()) { setError("Please type your full name to sign."); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch(FN_URL, { method: "POST", headers, body: JSON.stringify({ token, action, signerName: signer, declineReason }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); }
      else { await fetchProposal(); setShowDecline(false); }
    } catch { setError("Network error. Please try again."); }
    setSubmitting(false);
  };

  if (loading) return <Shell><p className="text-slate-600">Loading your proposal…</p></Shell>;
  if (error && !proposal) return <Shell><h1 className="text-xl font-bold">Proposal unavailable</h1><p className="mt-2 text-slate-600">{error}</p><p className="mt-4 text-sm text-slate-500">Call us at {SITE.phone} for help.</p></Shell>;
  if (!proposal) return null;

  const decided = proposal.status === "approved" || proposal.status === "declined";
  const canRespond = (proposal.status === "sent" || proposal.status === "viewed") && !proposal.expired;

  return (
    <Shell>
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="text-2xl font-extrabold text-[#005cb3]">{SITE.name}</div>
          <div className="text-sm text-slate-500">Proposal {proposal.estimate_number}</div>
        </div>
        <StatusBadge status={proposal.status} expired={proposal.expired} />
      </div>

      {proposal.customer_name && <p className="mt-4">Prepared for <strong>{proposal.customer_name}</strong></p>}
      {proposal.scope_of_work && (<div className="mt-4"><h2 className="font-bold">Scope of work</h2><p className="whitespace-pre-wrap text-slate-700">{proposal.scope_of_work}</p></div>)}

      <table className="mt-6 w-full text-sm">
        <thead><tr className="border-b text-left text-slate-500"><th className="py-2">Description</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Unit</th><th className="py-2 text-right">Total</th></tr></thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b"><td className="py-2">{it.description}</td><td className="py-2 text-right">{it.quantity}</td><td className="py-2 text-right">{money(it.unit_price)}</td><td className="py-2 text-right">{money(it.total ?? it.quantity * it.unit_price)}</td></tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-full max-w-xs text-sm">
        <Row label="Subtotal" value={money(proposal.subtotal)} />
        {proposal.discount_amount ? <Row label="Discount" value={`-${money(proposal.discount_amount)}`} /> : null}
        <Row label={`Tax (${proposal.tax_rate ?? 0}%)`} value={money(proposal.tax_amount)} />
        <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(proposal.total)}</span></div>
      </div>

      {proposal.customer_notes && (<div className="mt-6 rounded-md bg-slate-50 p-3 text-sm text-slate-700"><strong>Note:</strong> {proposal.customer_notes}</div>)}
      {proposal.expiration_date && <p className="mt-3 text-sm text-slate-500">Valid until {new Date(proposal.expiration_date).toLocaleDateString()}.</p>}

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {decided ? (
        <div className={`mt-6 rounded-md p-4 ${proposal.status === "approved" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {proposal.status === "approved"
            ? <p><strong>Accepted.</strong> Thank you{proposal.signer ? `, ${proposal.signer}` : ""}! Signed {proposal.signed_at ? new Date(proposal.signed_at).toLocaleString() : ""}. We'll be in touch to schedule.</p>
            : <p><strong>Declined.</strong>{proposal.decline_reason ? ` Reason: ${proposal.decline_reason}` : ""} If this was a mistake, call us at {SITE.phone}.</p>}
        </div>
      ) : proposal.expired ? (
        <div className="mt-6 rounded-md bg-amber-50 p-4 text-amber-800"><strong>This proposal has expired.</strong> Please contact us at {SITE.phone} for an updated quote.</div>
      ) : canRespond ? (
        <div className="mt-6 rounded-md border p-4">
          <h3 className="font-bold">Approve this proposal</h3>
          <p className="text-sm text-slate-600">Type your full name to sign and accept.</p>
          <div className="mt-3 grid gap-2">
            <Label htmlFor="signer">Full name (your signature)</Label>
            <Input id="signer" value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="e.g. Jane Smith" />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => respond("accept")} disabled={submitting} className="bg-green-600 hover:bg-green-700">{submitting ? "Submitting…" : "Accept & Sign"}</Button>
              <Button variant="outline" onClick={() => setShowDecline((s) => !s)} disabled={submitting}>Decline</Button>
            </div>
            {showDecline && (
              <div className="mt-2 grid gap-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea id="reason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                <Button variant="destructive" onClick={() => respond("decline")} disabled={submitting}>Confirm decline</Button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-center text-xs text-slate-400">{SITE.legalName} · {SITE.phone} · {SITE.email}</p>
    </Shell>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-100 px-4 py-10">
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-1"><span className="text-slate-500">{label}</span><span>{value}</span></div>
);

const StatusBadge = ({ status, expired }: { status: string; expired: boolean }) => {
  const s = expired && (status === "sent" || status === "viewed") ? "expired" : status;
  const map: Record<string, string> = { sent: "bg-blue-100 text-blue-700", viewed: "bg-indigo-100 text-indigo-700", approved: "bg-green-100 text-green-700", declined: "bg-red-100 text-red-700", expired: "bg-amber-100 text-amber-700", draft: "bg-slate-100 text-slate-700" };
  const label: Record<string, string> = { sent: "Awaiting your review", viewed: "Awaiting your review", approved: "Approved", declined: "Declined", expired: "Expired", draft: "Draft" };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[s] || "bg-slate-100"}`}>{label[s] || s}</span>;
};
