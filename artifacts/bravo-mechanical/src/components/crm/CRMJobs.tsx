import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Camera, ClipboardList, Plus, Search } from "lucide-react";
import { asCurrency, asDate, createActivity, ensureRevenueLoopForCompletedJob, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";
import { ensureFollowUp } from "@/lib/followUps";
import { detectJobType } from "@/lib/jobType";
import { getSmsTemplate } from "@/lib/smsTemplates";

const STATUSES = ["quoted", "scheduled", "in_progress", "completed", "cancelled"] as const;
const PHOTO_BUCKET = "job-photos";

const EMPTY_FORM = {
  lead_id: "",
  title: "",
  description: "",
  status: "quoted",
  address: "",
  scheduled_date: "",
  amount: "",
  notes: "",
  job_type: "",
};

type Job = {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  status: string;
  address: string | null;
  scheduled_date: string | null;
  amount: number | null;
  notes: string | null;
  job_type?: string | null;
  created_at: string;
  leads?: { name: string | null; first_name?: string | null; last_name?: string | null } | null;
};

type Lead = { id: string; name: string | null; first_name?: string | null; last_name?: string | null };
type JobPhoto = {
  id: string;
  job_id: string;
  lead_id: string | null;
  storage_path: string;
  public_url: string | null;
  created_at: string;
};

export const CRMJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [photosByJobId, setPhotosByJobId] = useState<Record<string, JobPhoto[]>>({});

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [noteDraftByJobId, setNoteDraftByJobId] = useState<Record<string, string>>({});
  const [savingNoteJobId, setSavingNoteJobId] = useState<string | null>(null);
  const [uploadingJobId, setUploadingJobId] = useState<string | null>(null);

  const loadJobsAndLeads = async () => {
    const [{ data: jobData, error: jobError }, { data: leadData, error: leadError }] = await Promise.all([
      supabase.from("jobs").select("id, lead_id, title, description, status, address, scheduled_date, amount, notes, created_at, leads(name,first_name,last_name)").order("created_at", { ascending: false }),
      supabase.from("leads").select("id,name,first_name,last_name").order("created_at", { ascending: false }),
    ]);

    if (jobError) {
      toast({ title: "Failed to load jobs", description: jobError.message, variant: "destructive" });
      return;
    }
    if (leadError) {
      toast({ title: "Failed to load leads", description: leadError.message, variant: "destructive" });
      return;
    }

    const nextJobs = (jobData || []) as unknown as Job[];
    setJobs(nextJobs);
    setLeads((leadData || []) as unknown as Lead[]);

    if (nextJobs.length > 0) {
      await loadPhotos(nextJobs.map((job) => job.id));
    } else {
      setPhotosByJobId({});
    }
  };

  const loadPhotos = async (jobIds: string[]) => {
    const { data, error } = await supabase
      .from("job_photos")
      .select("id, job_id, lead_id, storage_path, public_url, created_at")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load job photos", description: error.message, variant: "destructive" });
      return;
    }

    const grouped = (data || []).reduce<Record<string, JobPhoto[]>>((acc, photo) => {
      if (!acc[photo.job_id]) acc[photo.job_id] = [];
      acc[photo.job_id].push(photo as JobPhoto);
      return acc;
    }, {});

    setPhotosByJobId(grouped);
  };

  useEffect(() => {
  const handler = () => setOpen(true);
  window.addEventListener('crm:open-new-job', handler);
  return () => window.removeEventListener('crm:open-new-job', handler);
}, []);

useEffect(() => {
    loadJobsAndLeads();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const saveJob = async () => {
    if (!form.lead_id || !form.title.trim()) {
      toast({ title: "Lead and title required", variant: "destructive" });
      return;
    }

    const payload = {
      lead_id: form.lead_id,
      title: form.title.trim(),
      description: form.description || null,
      status: form.status as "quoted" | "scheduled" | "in_progress" | "completed" | "cancelled",
      address: form.address || null,
      scheduled_date: form.scheduled_date || null,
      amount: form.amount ? Number(form.amount) : null,
      notes: form.notes || null,
      job_type: form.job_type || detectJobType(`${form.title} ${form.description} ${form.notes}`) || null,
    };

    if (editId) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", editId);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      await createActivity("Job updated", { jobId: editId, leadId: form.lead_id, details: form.title });
      toast({ title: "Job updated" });
    } else {
      const { data, error } = await supabase.from("jobs").insert(payload).select("id").single();
      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
        return;
      }
      await createActivity("Job created", { jobId: data?.id, leadId: form.lead_id, details: form.title });
      const due = new Date();
      due.setDate(due.getDate() + 1);
      if (data?.id) {
        await ensureFollowUp({ leadId: form.lead_id, jobId: data.id, dueAt: due, reason: `1-day follow-up for ${form.title}`, windowHours: 24 });
      }
      toast({ title: "Job created" });
    }

    setOpen(false);
    resetForm();
    await loadJobsAndLeads();
  };

  const startEdit = (job: Job) => {
    setEditId(job.id);
    setForm({
      lead_id: job.lead_id,
      title: job.title,
      description: job.description || "",
      status: job.status,
      address: job.address || "",
      scheduled_date: job.scheduled_date ? job.scheduled_date.slice(0, 10) : "",
      amount: job.amount == null ? "" : String(job.amount),
      notes: job.notes || "",
      job_type: job.job_type || "",
    });
    setOpen(true);
  };

  const updateStatus = async (job: Job, status: string) => {
    if (job.status === status) return;
    const { error } = await supabase
      .from("jobs")
      .update({ status: status as "quoted" | "scheduled" | "in_progress" | "completed" | "cancelled" })
      .eq("id", job.id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Job status updated", { jobId: job.id, leadId: job.lead_id, details: `${job.status} -> ${status}` });
    if (status === "quoted" || status === "new") {
      const due = new Date();
      due.setDate(due.getDate() + 3);
      await ensureFollowUp({ leadId: job.lead_id, jobId: job.id, dueAt: due, reason: `3-day check-in for ${job.title}`, windowHours: 72 });
    }
    toast({ title: `Job marked ${JOB_STATUS_LABELS[status] || status}` });
    await loadJobsAndLeads();
  };
  const completeAndSendInvoice = async (job: Job) => {
    await updateStatus(job, "completed");
    const result = await ensureRevenueLoopForCompletedJob(job as any);
    const sms = getSmsTemplate("day_1", (job.leads?.name || [job.leads?.first_name, job.leads?.last_name].filter(Boolean).join(' ') || 'Unknown'), `https://pay.bravomechanical.com/invoice/${result.invoiceId}`);
    window.open(`sms:?&body=${encodeURIComponent(sms)}`, "_self");
  };

  const createInvoice = async (job: Job) => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from("invoices").insert({
      job_id: job.id,
      lead_id: job.lead_id,
      invoice_number: invoiceNumber,
      amount: job.amount || 0,
      status: "draft",
    });

    if (error) {
      toast({ title: "Invoice create failed", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Invoice created from job", { jobId: job.id, leadId: job.lead_id, details: invoiceNumber });
    toast({ title: `Invoice ${invoiceNumber} created` });
  };

  const createFollowUp = async (job: Job) => {
    const due = new Date();
    due.setDate(due.getDate() + 1);

    const { error } = await supabase.from("follow_ups").insert({
      job_id: job.id,
      lead_id: job.lead_id,
      due_date: due.toISOString(),
      note: `Follow up on ${job.title}`,
    });

    if (error) {
      toast({ title: "Follow-up failed", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Follow-up created", { jobId: job.id, leadId: job.lead_id, details: job.title });
    toast({ title: "Follow-up created for tomorrow" });
  };

  const addTechnicianNote = async (job: Job) => {
    const note = (noteDraftByJobId[job.id] || "").trim();
    if (!note) {
      toast({ title: "Add a note before saving", variant: "destructive" });
      return;
    }

    setSavingNoteJobId(job.id);
    const timestamp = new Date().toLocaleString();
    const existingNotes = job.notes?.trim() ? job.notes.trim() : "";
    const updatedNotes = `${existingNotes}${existingNotes ? "\n\n" : ""}[${timestamp}] ${note}`;
    const { error } = await supabase.from("jobs").update({ notes: updatedNotes }).eq("id", job.id);
    setSavingNoteJobId(null);

    if (error) {
      toast({ title: "Note save failed", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Technician job note added", { jobId: job.id, leadId: job.lead_id, details: note.slice(0, 160) });
    setNoteDraftByJobId((current) => ({ ...current, [job.id]: "" }));
    toast({ title: "Job note added" });
    await loadJobsAndLeads();
  };

  const uploadJobPhoto = async (job: Job, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    setUploadingJobId(job.id);
    const ext = file.name.split(".").pop() || "jpg";
    const random = Math.random().toString(36).slice(2);
    const storagePath = `${job.id}/${Date.now()}-${random}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file, {
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      setUploadingJobId(null);
      toast({ title: "Photo upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
    const { error: insertError } = await supabase.from("job_photos").insert({
      job_id: job.id,
      lead_id: job.lead_id,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
    });

    setUploadingJobId(null);

    if (insertError) {
      toast({ title: "Photo linked failed", description: insertError.message, variant: "destructive" });
      return;
    }

    await createActivity("Job photo uploaded", { jobId: job.id, leadId: job.lead_id, details: storagePath });
    toast({ title: "Job photo uploaded" });
    await loadPhotos(jobs.map((currentJob) => currentJob.id));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase();
      if (filterStatus !== "all" && job.status !== filterStatus) return false;
      if (filterDate && (job.scheduled_date || "").slice(0, 10) !== filterDate) return false;
      if (!q) return true;
      return [job.title, (job.leads?.name || [job.leads?.first_name, job.leads?.last_name].filter(Boolean).join(' ') || 'Unknown') || "", job.address || "", job.notes || ""].join(" ").toLowerCase().includes(q);
    });
  }, [jobs, search, filterStatus, filterDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search title, lead, address, notes" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Input type="date" min="2020-01-01" max="2035-12-31" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} className="lg:w-[170px]" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="lg:w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            {STATUSES.map((status) => <SelectItem key={status} value={status}>{JOB_STATUS_LABELS[status]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" />Add Job</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Job</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div>
                <Label>Lead</Label>
                <Select value={form.lead_id} onValueChange={(value) => setForm({ ...form, lead_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                  <SelectContent>{leads.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.name || [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.id}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-3">
                <div><Label>Scheduled</Label><Input type="date" value={form.scheduled_date} onChange={(event) => setForm({ ...form, scheduled_date: event.target.value })} /></div>
                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{JOB_STATUS_LABELS[status]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
              <div><Label>Job Type</Label><Input value={form.job_type} onChange={(event) => setForm({ ...form, job_type: event.target.value })} placeholder="auto-detected if blank" /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
              <Button onClick={saveJob}>Save Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No jobs found.</div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const photos = photosByJobId[job.id] || [];
            return (
              <div key={job.id} className="rounded-xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-base font-semibold">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{(job.leads?.name || [job.leads?.first_name, job.leads?.last_name].filter(Boolean).join(' ') || 'Unknown') || "No lead"} • {job.address || "No address"}</p>
                    <p className="mt-1 text-sm">{asDate(job.scheduled_date)} • {asCurrency(job.amount)}</p>
                  </div>
                  <span className={`w-fit rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[job.status] || "bg-secondary"}`}>
                    {JOB_STATUS_LABELS[job.status] || job.status}
                  </span>
                </div>

                {job.notes && <pre className="mt-3 max-h-40 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{job.notes}</pre>}

                <div className="mt-3 flex flex-wrap gap-1">
                  {STATUSES.map((status) => <Button key={status} size="sm" variant="outline" onClick={() => updateStatus(job, status)}>{JOB_STATUS_LABELS[status]}</Button>)}
                  <Button size="sm" onClick={() => createInvoice(job)}>Create invoice</Button>
                  <Button size="sm" onClick={() => completeAndSendInvoice(job)}>Complete Job & Send Invoice</Button>
                  <Button size="sm" variant="secondary" onClick={() => createFollowUp(job)}>Create follow-up</Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(job)}>Edit</Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4" />Technician note</div>
                    <Textarea
                      placeholder="Add work performed, parts used, customer notes, next steps..."
                      value={noteDraftByJobId[job.id] || ""}
                      onChange={(event) => setNoteDraftByJobId((current) => ({ ...current, [job.id]: event.target.value }))}
                      rows={3}
                    />
                    <Button className="mt-2" size="sm" onClick={() => addTechnicianNote(job)} disabled={savingNoteJobId === job.id}>
                      {savingNoteJobId === job.id ? "Saving…" : "Add note"}
                    </Button>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold"><Camera className="h-4 w-4" />Job photos</div>
                      <label className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                        {uploadingJobId === job.id ? "Uploading..." : "Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingJobId === job.id}
                          onChange={(event) => uploadJobPhoto(job, event)}
                        />
                      </label>
                    </div>
                    {photos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No photos yet. Upload before/after or equipment photos.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {photos.map((photo) => (
                          <a key={photo.id} href={photo.public_url || "#"} target="_blank" rel="noreferrer" className="block overflow-hidden rounded border bg-slate-100">
                            <img src={photo.public_url || ""} alt="Job upload" className="h-24 w-full object-cover" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
