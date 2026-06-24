import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail, openMailtoFallback } from "@/lib/email";
import { asCurrency, createActivity } from "@/lib/crm";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Send, Copy } from "lucide-react";

type Lead = { id: string; name: string | null; phone: string | null; email: string | null; address: string | null; city: string | null };
type LineItem = { description: string; qty: number; unitPrice: number };
type Proposal = {
  id: string; estimate_number: string; status: string; total: number | null;
  sent_at: string | null; created_at: string; share_token: string; lead_id: string | null; expiration_date: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", sent: "Sent", viewed: "Viewed", approved: "Approved",
  declined: "Declined", expired: "Expired", converted_to_job: "Converted",
};
const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-700", viewed: "bg-indigo-100 text-indigo-700",
  approved: "bg-green-100 text-green-700", declined: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-700", converted_to_job: "bg-emerald-100 text-emerald-700",
};

const emptyForm = { lead_id: "", scope_of_work: "", customer_notes: "", expiration_date: "" };

export const CRMProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [taxRate, setTaxRate] = useState(8.875);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", qty: 1, unitPrice: 0 }]);

  const leadMap = useMemo(() => Object.fromEntries(leads.map((l) => [l.id, l])), [leads]);

  const load = async () => {
    const [{ data: e }, { data: l }] = await Promise.all([
      supabase.from("estimates" as any).select("id,estimate_number,status,total,sent_at,created_at,share_token,lead_id,expiration_date").order("created_at", { ascending: false }),
      supabase.from("leads" as any).select("id,name,phone,email,address,city").order("name"),
    ]);
    setProposals((e as any) || []);
    setLeads((l as any) || []);
  };
  useEffect(() => { load(); }, []);

  const subtotal = () => lineItems.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const taxAmount = () => subtotal() * (taxRate / 100);
  const total = () => subtotal() + taxAmount();

  const setLine = (i: number, patch: Partial<LineItem>) => setLineItems((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addLine = () => setLineItems((rows) => [...rows, { description: "", qty: 1, unitPrice: 0 }]);
  const removeLine = (i: number) => setLineItems((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const reset = () => { setForm(emptyForm); setTaxRate(8.875); setLineItems([{ description: "", qty: 1, unitPrice: 0 }]); };

  const ensureCustomer = async (lead: Lead): Promise<string> => {
    const { data: existing } = await supabase.from("customers" as any).select("id").eq("created_from_lead_id", lead.id).maybeSingle();
    if ((existing as any)?.id) return (existing as any).id;
    const { data: created, error } = await supabase.from("customers" as any).insert({
      name: lead.name, email: lead.email || null, primary_phone: lead.phone || null,
      service_address: lead.address || null, service_city: lead.city || null,
      created_from_lead_id: lead.id, is_active: true,
    }).select("id").single();
    if (error || !created) throw new Error(error?.message || "Could not create customer record");
    return (created as any).id;
  };

  const save = async () => {
    const lead = leadMap[form.lead_id];
    if (!lead) { toast({ title: "Select a customer", variant: "destructive" }); return; }
    if (!lineItems.some((it) => it.description.trim())) { toast({ title: "Add at least one line item", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const customerId = await ensureCustomer(lead);
      const { data: { user } } = await supabase.auth.getUser();
      const sub = subtotal();
      const num = `P-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: est, error } = await supabase.from("estimates" as any).insert({
        estimate_number: num, customer_id: customerId, lead_id: lead.id,
        service_address: lead.address || null, service_city: lead.city || null,
        scope_of_work: form.scope_of_work || null, customer_notes: form.customer_notes || null,
        status: "draft", subtotal: sub, tax_rate: taxRate, tax_amount: sub * (taxRate / 100), discount_amount: 0,
        total: sub * (1 + taxRate / 100), expiration_date: form.expiration_date || null, created_by: user?.id || null,
      }).select("id").single();
      if (error || !est) throw new Error(error?.message || "Failed to create proposal");
      const estId = (est as any).id;
      const { error: liErr } = await supabase.from("estimate_line_items" as any).insert(
        lineItems.filter((it) => it.description.trim()).map((it, idx) => ({
          estimate_id: estId, description: it.description.trim(), item_type: "service",
          quantity: Number(it.qty) || 1, unit_price: Number(it.unitPrice) || 0,
          sort_order: idx,
        })),
      );
      if (liErr) throw new Error(liErr.message);
      await createActivity("Proposal created", { leadId: lead.id, details: num });
      toast({ title: "Proposal created", description: `${num} saved as draft. Click Send to email it.` });
      setOpen(false); reset(); await load();
    } catch (e: any) {
      toast({ title: "Failed to create proposal", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const proposalLink = (p: Proposal) => `${(typeof window !== "undefined" ? window.location.origin : SITE.siteUrl)}/proposal/${p.share_token}`;

  const copyLink = async (p: Proposal) => {
    try { await navigator.clipboard.writeText(proposalLink(p)); toast({ title: "Link copied" }); }
    catch { toast({ title: "Copy failed", description: proposalLink(p), variant: "destructive" }); }
  };

  const sendProposal = async (p: Proposal) => {
    const lead = p.lead_id ? leadMap[p.lead_id] : null;
    const to = lead?.email;
    if (!to) { toast({ title: "No email on file", description: "Add an email to this customer first.", variant: "destructive" }); return; }
    setSendingId(p.id);
    const link = proposalLink(p);
    const amount = p.total != null ? asCurrency(p.total) : "";
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <h2 style="color:#005cb3">Your proposal from ${SITE.name}</h2>
        <p>Hi ${lead?.name || "there"},</p>
        <p>Thank you for the opportunity. Your proposal <strong>${p.estimate_number}</strong>${amount ? ` for <strong>${amount}</strong>` : ""} is ready to review.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#005cb3;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:bold">View &amp; Approve Proposal</a>
        </p>
        <p style="font-size:13px;color:#475569">Or paste this link into your browser:<br>${link}</p>
        <p style="font-size:13px;color:#475569">Questions? Call us at ${SITE.phone}.</p>
        <p style="font-size:13px;color:#475569">— ${SITE.legalName}</p>
      </div>`;
    const res = await sendEmail({ to, subject: `Your proposal from ${SITE.name} (${p.estimate_number})`, html, text: `View your proposal from ${SITE.name}: ${link}`, leadId: p.lead_id || undefined });
    if (res.success && !("fallback" in res && res.fallback)) {
      await supabase.from("estimates" as any).update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", p.id);
      await createActivity("Proposal sent", { leadId: p.lead_id || undefined, details: p.estimate_number });
      toast({ title: "Proposal sent", description: `Emailed to ${to}` });
      await load();
    } else {
      toast({ title: "Email failed — opening your mail app", description: "error" in res ? res.error : undefined, variant: "destructive" });
      openMailtoFallback(to, `Your proposal from ${SITE.name} (${p.estimate_number})`, `View your proposal: ${link}`);
    }
    setSendingId(null);
  };

  const filtered = useMemo(
    () => proposals.filter((p) => {
      const lead = p.lead_id ? leadMap[p.lead_id] : null;
      return `${p.estimate_number} ${lead?.name || ""}`.toLowerCase().includes(search.toLowerCase());
    }),
    [proposals, leadMap, search],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input placeholder="Search proposals" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" />New Proposal</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader><DialogTitle>New Proposal</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Customer</Label>
                <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent>{leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name || "Unnamed"}{l.email ? ` — ${l.email}` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label>Scope of work</Label>
                <Textarea placeholder="What the job covers…" value={form.scope_of_work} onChange={(e) => setForm({ ...form, scope_of_work: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Line items</Label>
                {lineItems.map((it, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="flex-1" placeholder="Description" value={it.description} onChange={(e) => setLine(i, { description: e.target.value })} />
                    <Input className="w-16" type="number" placeholder="Qty" value={it.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
                    <Input className="w-24" type="number" placeholder="Unit $" value={it.unitPrice} onChange={(e) => setLine(i, { unitPrice: Number(e.target.value) })} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="mr-1 h-4 w-4" />Add line</Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Tax rate %</Label>
                <Input className="w-24" type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
              <div className="grid gap-1">
                <Label>Expiration date (optional)</Label>
                <Input type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Note to customer (optional)</Label>
                <Textarea placeholder="Appears on the proposal…" value={form.customer_notes} onChange={(e) => setForm({ ...form, customer_notes: e.target.value })} />
              </div>
              <div className="rounded-md border bg-slate-50 p-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{asCurrency(subtotal())}</span></div>
                <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>{asCurrency(taxAmount())}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{asCurrency(total())}</span></div>
              </div>
              <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Create proposal"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {filtered.length === 0 && <p className="text-sm text-slate-500">No proposals yet. Create one to send a customer a quote they can approve online.</p>}
        {filtered.map((p) => {
          const lead = p.lead_id ? leadMap[p.lead_id] : null;
          return (
            <div key={p.id} className="rounded-2xl border bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold">{lead?.name || "Customer"} <span className="text-xs font-normal text-slate-500">· {p.estimate_number}</span></div>
                  <div className="text-xs text-slate-600">{p.total != null ? asCurrency(p.total) : "—"}{p.sent_at ? ` · sent ${new Date(p.sent_at).toLocaleDateString()}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[p.status] || "bg-slate-100"}`}>{STATUS_LABELS[p.status] || p.status}</span>
                  <Button variant="outline" size="sm" onClick={() => copyLink(p)}><Copy className="mr-1 h-3 w-3" />Link</Button>
                  <Button size="sm" onClick={() => sendProposal(p)} disabled={sendingId === p.id}><Send className="mr-1 h-3 w-3" />{sendingId === p.id ? "Sending…" : p.status === "draft" ? "Send" : "Resend"}</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
