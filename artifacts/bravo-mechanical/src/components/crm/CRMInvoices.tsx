import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, MessageSquare } from "lucide-react";
import {
  asCurrency,
  asDate,
  createActivity,
  INVOICE_STATUS_LABELS,
  STATUS_BADGE_CLASS,
  sendInvoiceMessage,
  sendReviewRequest,
} from "@/lib/crm";

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

type Invoice = {
  id: string;
  job_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  jobs?: { title: string } | null;
  leads?: {
    name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
};

type Job = { id: string; title: string; amount: number | null };
type Lead = { name: string | null; phone: string | null; email: string | null };

export const CRMInvoices = () => {
  const [items, setItems] = useState<Invoice[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    job_id: "",
    invoice_number: "",
    amount: "",
    status: "draft",
    due_date: "",
    paid_date: "",
    notes: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState<number>(8.875);

  const load = async () => {
    const [{ data: a }, { data: j }] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, jobs(title), leads(name, phone, email)")
        .order("created_at", { ascending: false }),
      supabase.from("jobs").select("id,title,amount").order("title"),
    ]);
    setItems((a as unknown as Invoice[]) || []);
    setJobs((j as Job[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (i: Invoice) => {
    setEditId(i.id);
    setForm({
      job_id: i.job_id,
      invoice_number: i.invoice_number,
      amount: String(i.amount),
      status: i.status,
      due_date: i.due_date || "",
      paid_date: i.paid_date || "",
      notes: i.notes || "",
    });
    const items = Array.isArray((i as any).line_items) && (i as any).line_items.length
      ? (i as any).line_items
      : [{ description: i.jobs?.title || "", qty: 1, unitPrice: i.amount }];
    setLineItems(items);
    setTaxRate(Number((i as any).tax_rate) || 8.875);
    setOpen(true);
  };

    const subtotal = () => lineItems.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const total = () => subtotal() * (1 + taxRate / 100);

  const resetForm = () => {
    setForm({ job_id: "", invoice_number: "", amount: "", status: "draft", due_date: "", paid_date: "", notes: "" });
    setLineItems([{ description: "", qty: 1, unitPrice: 0 }]);
    setTaxRate(8.875);
    setEditId(null);
  };

  const save = async () => {
    const payload = {
      ...form,
      amount: total(),
      line_items: lineItems as any,
      tax_rate: taxRate,
      due_date: form.due_date || null,
      paid_date: form.paid_date || null,
      notes: form.notes || null,
      status: form.status as any,
    };
    if (editId) {
      await supabase.from("invoices").update(payload).eq("id", editId);
      await createActivity("Invoice updated", {
        jobId: form.job_id,
        details: form.invoice_number,
      });
    } else {
      await supabase.from("invoices").insert(payload);
      await createActivity("Invoice created", {
        jobId: form.job_id,
        details: form.invoice_number,
      });
    }
    setOpen(false);
    resetForm();
    load();
  };

  const setStatus = async (inv: Invoice, status: string) => {
    await supabase
      .from("invoices")
      .update({
        status: status as any,
        paid_date:
          status === "paid" ? new Date().toISOString().slice(0, 10) : inv.paid_date,
      })
      .eq("id", inv.id);
    await createActivity("Invoice status updated", {
      jobId: inv.job_id,
      details: `${inv.invoice_number}: ${status}`,
    });
    if (status === "paid") {
      await handleSendReview(inv);
    }
    load();
  };

  const handleSendInvoice = async (inv: Invoice) => {
    setSendingId(inv.id);
    const job = await supabase
      .from("jobs")
      .select("id, title, lead_id, customer_name, customer_phone, customer_email, leads(name, phone, email)")
      .eq("id", inv.job_id)
      .maybeSingle();

    const completedJob = {
      id: inv.job_id,
      lead_id: job.data?.lead_id || null,
      title: job.data?.title || null,
      customer_name: job.data?.customer_name || job.data?.leads?.name || null,
      customer_phone: job.data?.customer_phone || job.data?.leads?.phone || null,
      customer_email: job.data?.customer_email || job.data?.leads?.email || null,
      leads: job.data?.leads || null,
    };

    const result = await sendInvoiceMessage(completedJob, inv.invoice_number);

    await supabase.from("invoices").update({ status: "sent" }).eq("id", inv.id);
    await createActivity("Invoice sent via SMS/email", {
      jobId: inv.job_id,
      invoiceId: inv.id,
      details: `${inv.invoice_number} - SMS: ${result.sms}, Email: ${result.email}${result.errors.length ? ` | Errors: ${result.errors.join(", ")}` : ""}`,
    });

    setSendingId(null);
    load();
  };

  const handleSendReview = async (inv: Invoice) => {
    const job = await supabase
      .from("jobs")
      .select("id, title, lead_id, customer_name, customer_phone, customer_email, leads(name, phone, email)")
      .eq("id", inv.job_id)
      .maybeSingle();

    const completedJob = {
      id: inv.job_id,
      lead_id: job.data?.lead_id || null,
      title: job.data?.title || null,
      customer_name: job.data?.customer_name || job.data?.leads?.name || null,
      customer_phone: job.data?.customer_phone || job.data?.leads?.phone || null,
      customer_email: job.data?.customer_email || job.data?.leads?.email || null,
      leads: job.data?.leads || null,
    };

    const result = await sendReviewRequest(completedJob);
    await createActivity("Review request sent", {
      jobId: inv.job_id,
      invoiceId: inv.id,
      details: `${inv.invoice_number} - SMS: ${result.sms}, Email: ${result.email}`,
    });
    load();
  };

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (filterStatus === "all" || i.status === filterStatus) &&
          `${i.invoice_number} ${i.jobs?.title || ""} ${i.status}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [items, search, filterStatus],
  );

  const isOverdue = (i: Invoice) =>
    i.status !== "paid" && !!i.due_date && new Date(i.due_date) < new Date();

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Search invoice #, job, status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {INVOICE_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "New"} Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              {/* Job + Invoice # + Status row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-1 block">Job</Label>
                  <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j) => (<SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block">Invoice #</Label>
                  <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-001" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="mb-1 block">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (<SelectItem key={s} value={s}>{INVOICE_STATUS_LABELS[s]}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block">Due date</Label>
                  <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1 block">Tax rate %</Label>
                  <Input type="number" step="0.001" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label>Line Items</Label>
                  <button type="button" className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    onClick={() => setLineItems([...lineItems, { description: "", qty: 1, unitPrice: 0 }])}>
                    <PlusCircle className="h-3 w-3" /> Add row
                  </button>
                </div>
                <div className="rounded-md border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="px-2 py-1.5 text-left w-1/2">Description</th>
                        <th className="px-2 py-1.5 text-right w-16">Qty</th>
                        <th className="px-2 py-1.5 text-right w-24">Unit Price</th>
                        <th className="px-2 py-1.5 text-right w-24">Subtotal</th>
                        <th className="px-2 py-1.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((it, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="px-1 py-1">
                            <input className="w-full border-0 bg-transparent px-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 rounded"
                              value={it.description} placeholder="Labor, parts…"
                              onChange={(e) => { const n=[...lineItems]; n[idx]={...n[idx],description:e.target.value}; setLineItems(n); }} />
                          </td>
                          <td className="px-1 py-1">
                            <input className="w-full border-0 bg-transparent px-1 text-right text-sm outline-none focus:ring-1 focus:ring-blue-500 rounded"
                              type="number" min="1" value={it.qty}
                              onChange={(e) => { const n=[...lineItems]; n[idx]={...n[idx],qty:Number(e.target.value)}; setLineItems(n); }} />
                          </td>
                          <td className="px-1 py-1">
                            <input className="w-full border-0 bg-transparent px-1 text-right text-sm outline-none focus:ring-1 focus:ring-blue-500 rounded"
                              type="number" min="0" step="0.01" value={it.unitPrice}
                              onChange={(e) => { const n=[...lineItems]; n[idx]={...n[idx],unitPrice:Number(e.target.value)}; setLineItems(n); }} />
                          </td>
                          <td className="px-2 py-1 text-right font-medium">{asCurrency(it.qty * it.unitPrice)}</td>
                          <td className="px-1 py-1 text-center">
                            {lineItems.length > 1 && (
                              <button type="button" onClick={() => setLineItems(lineItems.filter((_,i)=>i!==idx))}
                                className="text-slate-400 hover:text-red-500">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 text-sm">
                      <tr className="border-t border-slate-200">
                        <td colSpan={3} className="px-2 py-1 text-right text-slate-500">Subtotal</td>
                        <td className="px-2 py-1 text-right font-medium">{asCurrency(subtotal())}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-2 py-1 text-right text-slate-500">Tax ({taxRate}%)</td>
                        <td className="px-2 py-1 text-right font-medium">{asCurrency(subtotal() * taxRate / 100)}</td>
                        <td></td>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <td colSpan={3} className="px-2 py-1.5 text-right font-bold text-slate-900">Total</td>
                        <td className="px-2 py-1.5 text-right font-bold text-blue-700">{asCurrency(total())}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <Label className="mb-1 block">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <Button onClick={save} disabled={!form.job_id || !form.invoice_number.trim()}>
                Save Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {filtered.map((i) => (
          <div
            key={i.id}
            className={`border rounded p-3 ${
              isOverdue(i) ? "border-red-400 bg-red-50" : ""
            }`}
          >
            <div className="flex justify-between">
              <p className="font-medium">
                {i.invoice_number} — {i.jobs?.title}
              </p>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  STATUS_BADGE_CLASS[i.status] || ""
                }`}
              >
                {INVOICE_STATUS_LABELS[i.status] || i.status}
              </span>
            </div>
            <p className="text-sm">
              {asCurrency(i.amount)} · Due {asDate(i.due_date)}{" "}
              {isOverdue(i) ? "(Overdue)" : ""}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => openEdit(i)}>Edit</Button>
              {["sent", "paid", "overdue"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus(i, s)}
                >
                  {INVOICE_STATUS_LABELS[s]}
                </Button>
              ))}
              {i.status !== "paid" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleSendInvoice(i)}
                  disabled={sendingId === i.id}
                >
                  <Send className="h-3 w-3 mr-1" />
                  {sendingId === i.id ? "Sending..." : "Send Invoice"}
                </Button>
              )}
              {i.status === "paid" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSendReview(i)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Request Review
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
