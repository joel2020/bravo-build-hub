import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Phone, Mail, MapPin, Briefcase, ArrowRight, MessageSquare, CalendarClock } from "lucide-react";

const STATUSES = ["new", "contacted", "qualified", "quoted", "won", "lost"] as const;
const SOURCES = ["contact_form", "rebate_estimator", "phone", "referral", "google", "other"] as const;

type Lead = {
  id: string; name: string; email: string | null; phone: string | null;
  address: string | null; source: string; status: string; notes: string | null;
  created_at: string; updated_at: string;
};
type LinkedJob = { id: string; title: string; status: string; amount: number | null; scheduled_date: string | null };
type LinkedInvoice = { id: string; invoice_number: string; amount: number; status: string };
type LinkedFollowUp = { id: string; note: string; due_date: string; completed: boolean };
type ParsedLeadMeta = { service?: string; urgency?: string; city?: string };

const statusColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-slate-200 text-slate-800",
  quoted: "bg-purple-100 text-purple-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const jobStatusColor: Record<string, string> = {
  quoted: "bg-purple-100 text-purple-800", scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800", completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const CRMLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", source: "other" as string, status: "new" as string, notes: "" });

  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [linkedJobs, setLinkedJobs] = useState<LinkedJob[]>([]);
  const [linkedInvoices, setLinkedInvoices] = useState<LinkedInvoice[]>([]);
  const [linkedFollowUps, setLinkedFollowUps] = useState<LinkedFollowUp[]>([]);
  const [jobForm, setJobForm] = useState({ title: "", description: "", status: "quoted", scheduled_date: "", amount: "", notes: "" });
  const [followUpForm, setFollowUpForm] = useState({ note: "", due_date: "", completed: false });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: "", email: "", phone: "", address: "", source: "other", status: "new", notes: "" }); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const payload = { name: form.name, email: form.email || null, phone: form.phone || null, address: form.address || null, source: form.source as any, status: form.status as any, notes: form.notes };
    if (editId) {
      const { error } = await supabase.from("leads").update(payload).eq("id", editId);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      await logActivity("Lead updated", editId, null, `Status: ${form.status}`);
      toast({ title: "Lead updated" });
    } else {
      const { data: newLead, error } = await supabase.from("leads").insert(payload).select("id").single();
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
      if (newLead) await logActivity("Lead created", newLead.id, null, `Source: ${form.source}`);
      toast({ title: "Lead created" });
    }
    setOpen(false); resetForm(); load();
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lead deleted" });
    setDetailLead(null);
    load();
  };

  const startEdit = (l: Lead) => {
    setForm({ name: l.name, email: l.email || "", phone: l.phone || "", address: l.address || "", source: l.source, status: l.status, notes: l.notes || "" });
    setEditId(l.id); setOpen(true);
  };

  const openDetail = async (l: Lead) => {
    setDetailLead(l);
    const [{ data: jobs }, { data: followUps }] = await Promise.all([
      supabase.from("jobs").select("id, title, status, amount, scheduled_date").eq("lead_id", l.id).order("created_at", { ascending: false }),
      supabase.from("follow_ups").select("id, note, due_date, completed").eq("lead_id", l.id).order("due_date", { ascending: true }),
    ]);
    setLinkedJobs((jobs as LinkedJob[]) || []);
    setLinkedFollowUps((followUps as LinkedFollowUp[]) || []);
    const jobIds = (jobs || []).map((j: any) => j.id);
    if (jobIds.length > 0) {
      const { data: inv } = await supabase.from("invoices").select("id, invoice_number, amount, status").in("job_id", jobIds);
      setLinkedInvoices((inv as LinkedInvoice[]) || []);
    } else {
      setLinkedInvoices([]);
    }
  };

  const updateLeadStatus = async (lead: Lead, status: string) => {
    const { error } = await supabase.from("leads").update({ status: status as any }).eq("id", lead.id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }
    await logActivity("Lead status updated", lead.id, null, `Status: ${status}`);
    setDetailLead({ ...lead, status });
    load();
    toast({ title: `Lead marked ${status}` });
  };

  const markContacted = async (lead: Lead) => {
    await updateLeadStatus(lead, "contacted");
  };

  const createJobFromLead = async () => {
    if (!detailLead) return;
    if (!jobForm.title.trim()) {
      toast({ title: "Job title required", variant: "destructive" });
      return;
    }
    const { data: job, error } = await supabase.from("jobs").insert({
      lead_id: detailLead.id,
      title: jobForm.title.trim(),
      description: jobForm.description || null,
      status: jobForm.status as any,
      address: detailLead.address || null,
      scheduled_date: jobForm.scheduled_date || null,
      amount: jobForm.amount ? Number(jobForm.amount) : 0,
      notes: jobForm.notes || null,
    }).select("id").single();
    if (error) {
      toast({ title: "Job creation failed", description: error.message, variant: "destructive" });
      return;
    }
    await logActivity("Job created from lead", detailLead.id, job?.id || null, jobForm.title.trim());
    toast({ title: "Job created" });
    setJobForm({ title: "", description: "", status: "quoted", scheduled_date: "", amount: "", notes: "" });
    openDetail(detailLead);
  };

  const quickCreateJob = async (lead: Lead) => {
    const { error } = await supabase.from("jobs").insert({
      lead_id: lead.id,
      title: `HVAC Service - ${lead.name}`,
      description: lead.notes || null,
      status: "quoted",
      address: lead.address || null,
      amount: 0,
      notes: lead.notes || null,
    });
    if (error) {
      toast({ title: "Quick job creation failed", description: error.message, variant: "destructive" });
      return;
    }
    await logActivity("Job created from lead", lead.id, null, "Quick create");
    toast({ title: "Job created" });
  };

  const createFollowUpFromLead = async () => {
    if (!detailLead) return;
    if (!followUpForm.note.trim() || !followUpForm.due_date) {
      toast({ title: "Follow-up note and due date are required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("follow_ups").insert({
      lead_id: detailLead.id,
      note: followUpForm.note.trim(),
      due_date: followUpForm.due_date,
      completed: followUpForm.completed,
    });
    if (error) {
      toast({ title: "Follow-up creation failed", description: error.message, variant: "destructive" });
      return;
    }
    await logActivity("Follow-up created", detailLead.id, null, followUpForm.note.trim());
    toast({ title: "Follow-up created" });
    setFollowUpForm({ note: "", due_date: "", completed: false });
    openDetail(detailLead);
  };

  const filtered = useMemo(() => leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (
      search
      && !l.name.toLowerCase().includes(search.toLowerCase())
      && !(l.email || "").toLowerCase().includes(search.toLowerCase())
      && !(l.phone || "").toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  }), [leads, filterStatus, search]);

  const pipelineCounts = STATUSES.map((s) => ({ status: s, count: leads.filter((l) => l.status === s).length }));

  const showNoLeadsYet = !loading && leads.length === 0;
  const showNoResults = !loading && leads.length > 0 && filtered.length === 0;

  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {pipelineCounts.map((p) => (
          <button key={p.status} onClick={() => setFilterStatus(filterStatus === p.status ? "all" : p.status)}
            className={`flex-1 min-w-[90px] px-3 py-2 rounded-md text-center transition-colors border ${filterStatus === p.status ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>
            <div className="text-lg font-bold">{p.count}</div>
            <div className="text-xs capitalize">{p.status}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, phone, email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="min-h-11"><Plus className="h-4 w-4 mr-1" />Add Lead</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Source</Label>
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
              <Button onClick={save}>{editId ? "Update" : "Create"} Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">Loading leads…</div>
      ) : showNoLeadsYet ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="font-medium">No leads yet</p>
          <p className="text-sm text-muted-foreground mt-1">New form submissions and calls will appear here.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block border border-border rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Service</th>
                  <th className="text-left p-3 font-medium">Created</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showNoResults ? (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No results found</td></tr>
                ) : filtered.map((l) => {
                  const leadMeta = parseLeadMeta(l.notes);
                  return (
                    <tr key={l.id} className="border-t border-border hover:bg-secondary/40" onClick={() => openDetail(l)}>
                      <td className="p-3 font-medium">{l.name}</td>
                      <td className="p-3 text-primary">
                        {l.phone ? <a href={`tel:${l.phone}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{l.phone}</a> : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-3 text-muted-foreground">{leadMeta.service || "General HVAC"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[l.status] || ""}`}>{l.status}</span></td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                          {l.phone && <Button size="sm" variant="outline" className="h-9" asChild><a href={`tel:${l.phone}`}>Call</a></Button>}
                          {l.phone && <Button size="sm" variant="outline" className="h-9" asChild><a href={`sms:${l.phone}`}>Text</a></Button>}
                          {l.email && <Button size="sm" variant="outline" className="h-9" asChild><a href={`mailto:${l.email}`}>Email</a></Button>}
                          <Button size="sm" variant="outline" className="h-9" onClick={() => markContacted(l)}>Mark Contacted</Button>
                          <Button size="sm" className="h-9" onClick={() => quickCreateJob(l)}>Create Job</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {showNoResults ? (
              <div className="rounded-lg border p-6 text-center text-muted-foreground">No results found</div>
            ) : filtered.map((l) => {
              const leadMeta = parseLeadMeta(l.notes);
              return (
                <div key={l.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button className="text-left font-semibold hover:underline" onClick={() => openDetail(l)}>{l.name}</button>
                      <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</p>
                    </div>
                    <Badge className={`capitalize ${statusColor[l.status] || ""}`}>{l.status}</Badge>
                  </div>
                  <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {l.phone ? <a className="text-primary hover:underline" href={`tel:${l.phone}`}>{l.phone}</a> : "-"}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Service:</span> {leadMeta.service || "General HVAC"}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {l.phone && <Button className="min-h-11" size="sm" variant="outline" asChild><a href={`tel:${l.phone}`}>Call</a></Button>}
                    {l.phone && <Button className="min-h-11" size="sm" variant="outline" asChild><a href={`sms:${l.phone}`}>Text</a></Button>}
                    {l.email && <Button className="min-h-11" size="sm" variant="outline" asChild><a href={`mailto:${l.email}`}>Email</a></Button>}
                    <Button className="min-h-11" size="sm" variant="outline" onClick={() => markContacted(l)}>Mark Contacted</Button>
                    <Button className="min-h-11 col-span-2" size="sm" onClick={() => quickCreateJob(l)}>Create Job</Button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-2">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</p>
        </>
      )}

      <Sheet open={!!detailLead} onOpenChange={(o) => { if (!o) setDetailLead(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto pb-24">
          {detailLead && (
            <>
              {(() => {
                const leadMeta = parseLeadMeta(detailLead.notes);
                return (
                  <>
                    <SheetHeader>
                      <SheetTitle className="text-xl">{detailLead.name}</SheetTitle>
                    </SheetHeader>

                    <div className="mt-4 space-y-4">
                      <div className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{detailLead.name}</p>
                          <Badge className={`capitalize ${statusColor[detailLead.status] || ""}`}>{detailLead.status}</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>{detailLead.phone ? <a href={`tel:${detailLead.phone}`} className="text-primary hover:underline">{detailLead.phone}</a> : "No phone"}</p>
                          <p>{detailLead.email ? <a href={`mailto:${detailLead.email}`} className="text-primary hover:underline">{detailLead.email}</a> : "No email"}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {detailLead.phone && <Button size="sm" variant="outline" className="min-h-11" asChild><a href={`tel:${detailLead.phone}`}><Phone className="h-4 w-4 mr-1" />Call</a></Button>}
                          {detailLead.phone && <Button size="sm" variant="outline" className="min-h-11" asChild><a href={`sms:${detailLead.phone}`}><MessageSquare className="h-4 w-4 mr-1" />Text</a></Button>}
                          {detailLead.email && <Button size="sm" variant="outline" className="min-h-11" asChild><a href={`mailto:${detailLead.email}`}><Mail className="h-4 w-4 mr-1" />Email</a></Button>}
                        </div>
                      </div>

                      {detailLead.address && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" /> {detailLead.address}
                        </p>
                      )}

                      <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                        <Badge variant="outline">{detailLead.source.replace(/_/g, " ")}</Badge>
                        <span>Created {new Date(detailLead.created_at).toLocaleString()}</span>
                        {leadMeta.service && <Badge variant="outline">Service: {leadMeta.service}</Badge>}
                        {leadMeta.city && <Badge variant="outline">City: {leadMeta.city}</Badge>}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Quick status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={detailLead.status === status ? "default" : "outline"}
                              onClick={() => updateLeadStatus(detailLead, status)}
                              className="capitalize"
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                        <Textarea
                          rows={4}
                          placeholder="Add notes about this lead..."
                          value={detailLead.notes || ""}
                          onChange={(e) => setDetailLead({ ...detailLead, notes: e.target.value })}
                        />
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            const { error } = await supabase.from("leads").update({ notes: detailLead.notes || "" }).eq("id", detailLead.id);
                            if (error) {
                              toast({ title: "Notes update failed", description: error.message, variant: "destructive" });
                              return;
                            }
                            await logActivity("Lead notes updated", detailLead.id, null, "Notes edited");
                            toast({ title: "Notes saved" });
                            load();
                          }}
                        >
                          Save Notes
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => { startEdit(detailLead); setDetailLead(null); }}>Edit Lead</Button>
                        <Button size="sm" variant="outline" className="min-h-11" onClick={() => setFollowUpForm((prev) => ({ ...prev, note: `Follow up with ${detailLead.name}` }))}>
                          <CalendarClock className="h-4 w-4 mr-1" /> Follow-up
                        </Button>
                        <Button size="sm" variant="outline" className="min-h-11" onClick={() => {
                          setJobForm((prev) => ({ ...prev, title: `HVAC Service - ${detailLead.name}`, description: detailLead.notes || "", status: "quoted", notes: detailLead.notes || "" }));
                        }}>
                          <Briefcase className="h-4 w-4 mr-1" /> Create Job
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete "{detailLead.name}" and cannot be undone. Linked jobs and invoices will remain.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteLead(detailLead.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Create job from lead</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2"><Label>Job Title *</Label><Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} /></div>
                          <div><Label>Status</Label>
                            <Select value={jobForm.status} onValueChange={(v) => setJobForm({ ...jobForm, status: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><Label>Scheduled</Label><Input type="date" value={jobForm.scheduled_date} onChange={(e) => setJobForm({ ...jobForm, scheduled_date: e.target.value })} /></div>
                          <div><Label>Amount ($)</Label><Input type="number" value={jobForm.amount} onChange={(e) => setJobForm({ ...jobForm, amount: e.target.value })} /></div>
                          <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /></div>
                          <div className="col-span-2"><Button size="sm" onClick={createJobFromLead}><ArrowRight className="h-4 w-4 mr-1" />Create Job</Button></div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Create follow-up</h3>
                        <div><Label>Note *</Label><Textarea rows={2} value={followUpForm.note} onChange={(e) => setFollowUpForm({ ...followUpForm, note: e.target.value })} /></div>
                        <div><Label>Due date/time *</Label><Input type="datetime-local" value={followUpForm.due_date} onChange={(e) => setFollowUpForm({ ...followUpForm, due_date: e.target.value })} /></div>
                        <div className="flex items-center gap-2 text-sm">
                          <input id="fu-completed" type="checkbox" checked={followUpForm.completed} onChange={(e) => setFollowUpForm({ ...followUpForm, completed: e.target.checked })} />
                          <Label htmlFor="fu-completed">Completed</Label>
                        </div>
                        <Button size="sm" onClick={createFollowUpFromLead}>Create Follow-up</Button>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1"><Briefcase className="h-4 w-4" /> Jobs ({linkedJobs.length})</h3>
                        {linkedJobs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No jobs linked</p>
                        ) : (
                          <ul className="space-y-2">
                            {linkedJobs.map((j) => (
                              <li key={j.id} className="bg-secondary p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{j.title}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${jobStatusColor[j.status] || ""}`}>{j.status.replace(/_/g, " ")}</span>
                                </div>
                                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                  {j.amount != null && <span>${Number(j.amount).toLocaleString()}</span>}
                                  {j.scheduled_date && <span>{j.scheduled_date}</span>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {linkedInvoices.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Invoices ({linkedInvoices.length})</h3>
                          <ul className="space-y-2">
                            {linkedInvoices.map((inv) => (
                              <li key={inv.id} className="bg-secondary p-3 rounded-md flex items-center justify-between">
                                <span className="text-sm">{inv.invoice_number} — ${Number(inv.amount).toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  inv.status === "paid" ? "bg-green-100 text-green-800" : inv.status === "overdue" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                }`}>{inv.status}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {linkedFollowUps.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Follow-ups ({linkedFollowUps.length})</h3>
                          <ul className="space-y-2">
                            {linkedFollowUps.map((fu) => (
                              <li key={fu.id} className={`bg-secondary p-3 rounded-md ${fu.completed ? "opacity-60" : ""}`}>
                                <p className={`text-sm ${fu.completed ? "line-through" : ""}`}>{fu.note}</p>
                                <p className={`text-xs mt-1 ${!fu.completed && new Date(fu.due_date) < new Date() ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                  {new Date(fu.due_date).toLocaleString()}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {detailLead.phone && (
                      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-3 mt-4 -mx-6">
                        <Button className="w-full min-h-12" asChild>
                          <a href={`tel:${detailLead.phone}`}><Phone className="h-4 w-4 mr-2" />Call {detailLead.name}</a>
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

async function logActivity(action: string, leadId: string | null, jobId: string | null, details: string | null) {
  await supabase.from("activity_log").insert({ action, lead_id: leadId, job_id: jobId, details });
}

function parseLeadMeta(notes: string | null): ParsedLeadMeta {
  if (!notes) return {};
  const parts = notes.split("|").map((p) => p.trim());
  const findValue = (label: string) => {
    const item = parts.find((p) => p.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    return item?.split(":").slice(1).join(":").trim();
  };
  return {
    service: findValue("Service requested") || findValue("Service"),
    urgency: findValue("Urgency"),
    city: findValue("City"),
  };
}
