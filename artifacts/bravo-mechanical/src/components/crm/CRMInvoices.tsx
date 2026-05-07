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

  const save = async () => {
    const payload = {
      ...form,
      amount: Number(form.amount || 0),
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "New"} Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <Label>Job</Label>
              <Select
                value={form.job_id}
                onValueChange={(v) => {
                  const job = jobs.find((j) => j.id === v);
                  setForm({
                    ...form,
                    job_id: v,
                    amount: form.amount || String(job?.amount || 0),
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>Invoice #</Label>
              <Input
                value={form.invoice_number}
                onChange={(e) =>
                  setForm({ ...form, invoice_number: e.target.value })
                }
              />
              <Label>Amount</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />
              <Label>Due date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {INVOICE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />
              <Button onClick={save}>Save</Button>
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
              {asCurrency(i.amount)} • Due {asDate(i.due_date)}{" "}
              {isOverdue(i) ? "(Overdue)" : ""}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
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
