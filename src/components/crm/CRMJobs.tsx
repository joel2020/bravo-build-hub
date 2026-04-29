import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";
import { asCurrency, asDate, createActivity, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";

const STATUSES = ["quoted", "scheduled", "in_progress", "completed", "cancelled"] as const;
type Job = { id: string; lead_id: string; title: string; description: string | null; status: string; address: string | null; scheduled_date: string | null; amount: number | null; notes: string | null; leads?: { name: string } | null };
type Lead = { id: string; name: string };

export const CRMJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]); const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState(""); const [filterStatus, setFilterStatus] = useState("all"); const [filterDate, setFilterDate] = useState("");
  const [open, setOpen] = useState(false); const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ lead_id: "", title: "", description: "", status: "quoted", address: "", scheduled_date: "", amount: "", notes: "" });

  const load = async () => {
    const [{ data: j }, { data: l }] = await Promise.all([
      supabase.from("jobs").select("*, leads(name)").order("created_at", { ascending: false }),
      supabase.from("leads").select("id,name").order("name"),
    ]);
    setJobs((j as Job[]) || []); setLeads((l as Lead[]) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.lead_id || !form.title.trim()) return toast({ title: "Lead and title required", variant: "destructive" });
    const payload = { ...form, title: form.title.trim(), amount: form.amount ? Number(form.amount) : null, description: form.description || null, address: form.address || null, notes: form.notes || null, scheduled_date: form.scheduled_date || null, status: form.status as any };
    if (editId) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", editId);
      if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
      await createActivity("Job updated", { jobId: editId, leadId: form.lead_id, details: form.title });
    } else {
      const { data, error } = await supabase.from("jobs").insert(payload).select("id").single();
      if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
      await createActivity("Job created", { jobId: data.id, leadId: form.lead_id, details: form.title });
    }
    setOpen(false); setEditId(null); setForm({ lead_id: "", title: "", description: "", status: "quoted", address: "", scheduled_date: "", amount: "", notes: "" }); load();
  };

  const updateStatus = async (job: Job, status: string) => {
    const { error } = await supabase.from("jobs").update({ status: status as any }).eq("id", job.id);
    if (error) return toast({ title: "Status update failed", description: error.message, variant: "destructive" });
    await createActivity("Job status updated", { jobId: job.id, leadId: job.lead_id, details: `${job.status} -> ${status}` });
    load();
  };

  const createInvoice = async (job: Job) => {
    const invoice_number = `INV-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from("invoices").insert({ job_id: job.id, invoice_number, amount: job.amount || 0, status: "draft" });
    if (error) return toast({ title: "Invoice create failed", description: error.message, variant: "destructive" });
    await createActivity("Invoice created from job", { jobId: job.id, leadId: job.lead_id, details: invoice_number });
    toast({ title: `Invoice ${invoice_number} created` });
  };

  const createFollowUp = async (job: Job) => {
    const due = new Date(); due.setDate(due.getDate() + 1);
    const { error } = await supabase.from("follow_ups").insert({ job_id: job.id, lead_id: job.lead_id, due_date: due.toISOString(), note: `Follow up on ${job.title}` });
    if (error) return toast({ title: "Follow-up failed", description: error.message, variant: "destructive" });
    await createActivity("Follow-up created", { jobId: job.id, leadId: job.lead_id, details: job.title });
  };

  const filtered = useMemo(() => jobs.filter((j) => {
    const q = search.toLowerCase();
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    if (filterDate && (j.scheduled_date || "").slice(0, 10) !== filterDate) return false;
    if (!q) return true;
    return [j.title, j.leads?.name || "", j.address || "", j.notes || ""].join(" ").toLowerCase().includes(q);
  }), [jobs, search, filterStatus, filterDate]);

  return <div>
    <div className="flex gap-2 mb-3 flex-wrap"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input className="pl-9" placeholder="Search title, lead, address, notes" value={search} onChange={e=>setSearch(e.target.value)} /></div>
      <Input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="w-[170px]" />
      <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[170px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{STATUSES.map(s=><SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1"/>Add Job</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{editId?"Edit":"New"} Job</DialogTitle></DialogHeader>
      <div className="grid gap-2"> <Label>Lead</Label><Select value={form.lead_id} onValueChange={v=>setForm({...form,lead_id:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{leads.map(l=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
      <Label>Title</Label><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><Label>Address</Label><Input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><Label>Scheduled</Label><Input type="date" value={form.scheduled_date} onChange={e=>setForm({...form,scheduled_date:e.target.value})}/><Label>Amount</Label><Input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/><Label>Status</Label><Select value={form.status} onValueChange={v=>setForm({...form,status:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STATUSES.map(s=><SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><Button onClick={save}>Save</Button></div></DialogContent></Dialog>
    </div>
    <div className="space-y-2">{filtered.map(j=><div key={j.id} className="border rounded p-3"><div className="flex justify-between gap-2"><div><p className="font-medium">{j.title}</p><p className="text-xs text-muted-foreground">{j.leads?.name || "—"} • {j.address || "—"}</p></div><span className={`px-2 py-1 rounded text-xs ${STATUS_BADGE_CLASS[j.status] || ""}`}>{JOB_STATUS_LABELS[j.status] || j.status}</span></div><p className="text-sm mt-1">{asDate(j.scheduled_date)} • {asCurrency(j.amount)}</p><p className="text-sm text-muted-foreground">{j.notes || ""}</p><div className="flex gap-1 mt-2 flex-wrap">{STATUSES.map(s=><Button key={s} size="sm" variant="outline" onClick={()=>updateStatus(j,s)}>{JOB_STATUS_LABELS[s]}</Button>)}<Button size="sm" onClick={()=>createInvoice(j)}>Create invoice</Button><Button size="sm" variant="secondary" onClick={()=>createFollowUp(j)}>Create follow-up</Button></div></div>)}</div>
  </div>;
};
