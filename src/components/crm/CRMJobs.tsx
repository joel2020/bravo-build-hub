import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Upload } from "lucide-react";
import { asCurrency, asDate, createActivity, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";

const STATUSES = ["quoted", "scheduled", "in_progress", "completed", "cancelled"] as const;
const PHOTO_BUCKET = "job-photos";

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
  leads?: { name: string } | null;
};

type Lead = { id: string; name: string };
type JobNote = { id: string; job_id: string; note: string; created_at: string };
type JobPhoto = { id: string; job_id: string; public_url: string | null; storage_path: string; created_at: string };

export const CRMJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]); const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState(""); const [filterStatus, setFilterStatus] = useState("all"); const [filterDate, setFilterDate] = useState("");
  const [open, setOpen] = useState(false); const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ lead_id: "", title: "", description: "", status: "quoted", address: "", scheduled_date: "", amount: "", notes: "" });
  const [jobNotes, setJobNotes] = useState<Record<string, JobNote[]>>({});
  const [jobPhotos, setJobPhotos] = useState<Record<string, JobPhoto[]>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNoteFor, setSavingNoteFor] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const load = async () => {
    const [{ data: jobData, error: jobError }, { data: leadData }, { data: photoData }] = await Promise.all([
      supabase.from("jobs").select("*, leads(name)").order("created_at", { ascending: false }),
      supabase.from("leads").select("id,name").order("name"),
      supabase.from("job_photos").select("id, job_id, public_url, storage_path, created_at, uploaded_by").order("created_at", { ascending: false }),
    ]);
    const loadedJobs = (j as Job[]) || [];
    setJobs(loadedJobs); setLeads((l as Lead[]) || []);
    if (loadedJobs.length) {
      await Promise.all([loadNotes(loadedJobs.map((job) => job.id)), loadPhotos(loadedJobs.map((job) => job.id))]);
    }
  };

  const loadNotes = async (jobIds: string[]) => {
    const { data, error } = await supabase
      .from("job_notes")
      .select("id, job_id, note, created_at")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load job notes", description: error.message, variant: "destructive" });
      return;
    }

    const grouped = (data || []).reduce<Record<string, JobNote[]>>((acc, note) => {
      const key = note.job_id;
      acc[key] = acc[key] || [];
      acc[key].push(note as JobNote);
      return acc;
    }, {});

    setJobNotes(grouped);
  };

  const loadPhotos = async (jobIds: string[]) => {
    const { data, error } = await supabase
      .from("job_photos")
      .select("id, job_id, public_url, storage_path, created_at")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load job photos", description: error.message, variant: "destructive" });
      return;
    }

    const grouped = (data || []).reduce<Record<string, JobPhoto[]>>((acc, photo) => {
      const key = photo.job_id;
      acc[key] = acc[key] || [];
      acc[key].push(photo as JobPhoto);
      return acc;
    }, {});

    setJobPhotos(grouped);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.lead_id || !form.title.trim()) return toast({ title: "Lead and title required", variant: "destructive" });

    const payload = {
      lead_id: form.lead_id,
      title: form.title.trim(),
      amount: form.amount ? Number(form.amount) : null,
      description: form.description || null,
      address: form.address || null,
      notes: form.notes || null,
      scheduled_date: form.scheduled_date || null,
      status: form.status as any,
    };

    if (editId) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", editId);
      if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
      await createActivity("Job updated", { jobId: editId, leadId: form.lead_id, details: form.title });
      toast({ title: "Job updated" });
    } else {
      const { data, error } = await supabase.from("jobs").insert(payload).select("id").single();
      if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
      await createActivity("Job created", { jobId: data.id, leadId: form.lead_id, details: form.title });
      toast({ title: "Job created" });
    }

    setOpen(false);
    resetForm();
    load();
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
    });
    setOpen(true);
  };

  const addNote = async (job: Job) => {
    const note = (noteDrafts[job.id] || "").trim();
    if (!note) {
      toast({ title: "Note cannot be empty", variant: "destructive" });
      return;
    }

    setSavingNoteFor(job.id);
    const { error } = await supabase.from("job_notes").insert({ job_id: job.id, note });
    setSavingNoteFor(null);

    if (error) {
      toast({ title: "Failed to save note", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Job note added", { jobId: job.id, leadId: job.lead_id, details: note.slice(0, 80) });
    setNoteDrafts((prev) => ({ ...prev, [job.id]: "" }));
    await loadNotes(jobs.map((row) => row.id));
    toast({ title: "Note added" });
  };

  const uploadPhoto = async (job: Job, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFor(job.id);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${job.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("job-photos").upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });

    if (uploadError) {
      setUploadingFor(null);
      toast({ title: "Photo upload failed", description: uploadError.message, variant: "destructive" });
      event.target.value = "";
      return;
    }

    const { data: publicData } = supabase.storage.from("job-photos").getPublicUrl(path);
    const { error: saveError } = await supabase.from("job_photos").insert({ job_id: job.id, storage_path: path, public_url: publicData.publicUrl });

    setUploadingFor(null);
    event.target.value = "";

    if (saveError) {
      toast({ title: "Failed to save photo record", description: saveError.message, variant: "destructive" });
      return;
    }

    await createActivity("Job photo uploaded", { jobId: job.id, leadId: job.lead_id, details: path });
    await loadPhotos(jobs.map((row) => row.id));
    toast({ title: "Photo uploaded" });
  };

  const updateStatus = async (job: Job, status: string) => {
    if (job.status === status) return;
    const { error } = await supabase.from("jobs").update({ status: status as any }).eq("id", job.id);
    if (error) return toast({ title: "Status update failed", description: error.message, variant: "destructive" });
    await createActivity("Job status updated", { jobId: job.id, leadId: job.lead_id, details: `${job.status} -> ${status}` });
    toast({ title: `Job marked ${JOB_STATUS_LABELS[status] || status}` });
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
    const due = new Date();
    due.setDate(due.getDate() + 1);
    const { error } = await supabase.from("follow_ups").insert({ job_id: job.id, lead_id: job.lead_id, due_date: due.toISOString(), note: `Follow up on ${job.title}` });
    if (error) return toast({ title: "Follow-up failed", description: error.message, variant: "destructive" });
    await createActivity("Follow-up created", { jobId: job.id, leadId: job.lead_id, details: job.title });
    toast({ title: "Follow-up created for tomorrow" });
  };

  const addTechnicianNote = async (job: Job) => {
    const newNote = (jobNoteDrafts[job.id] || "").trim();
    if (!newNote) return toast({ title: "Add a note before saving", variant: "destructive" });
    setSavingNoteJobId(job.id);
    const timestamp = new Date().toLocaleString();
    const existingNotes = job.notes?.trim() ? job.notes.trim() : "";
    const updatedNotes = `${existingNotes}${existingNotes ? "\n\n" : ""}[${timestamp}] ${newNote}`;
    const { error } = await supabase.from("jobs").update({ notes: updatedNotes }).eq("id", job.id);
    setSavingNoteJobId(null);
    if (error) return toast({ title: "Note save failed", description: error.message, variant: "destructive" });
    await createActivity("Technician job note added", { jobId: job.id, leadId: job.lead_id, details: newNote.slice(0, 160) });
    setJobNoteDrafts((current) => ({ ...current, [job.id]: "" }));
    toast({ title: "Job note added" });
    load();
  };

  const uploadJobPhoto = async (job: Job, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Please upload an image file", variant: "destructive" });

    setUploadingJobId(job.id);
    const extension = file.name.split(".").pop() || "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const storagePath = `${job.id}/${safeName}`;

    const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file, { upsert: false });
    if (uploadError) {
      setUploadingJobId(null);
      toast({ title: "Photo upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
    const { error: insertError } = await supabase.from("job_photos").insert({
      job_id: job.id,
      storage_path: storagePath,
      public_url: publicUrlData.publicUrl,
    });

    setUploadingJobId(null);

    if (insertError) {
      toast({ title: "Photo saved to storage but not linked to job", description: insertError.message, variant: "destructive" });
      return;
    }

    await createActivity("Job photo uploaded", { jobId: job.id, leadId: job.lead_id, details: storagePath });
    toast({ title: "Job photo uploaded" });
    load();
  };

  const filtered = useMemo(() => jobs.filter((job) => {
    const q = search.toLowerCase();
    if (filterStatus !== "all" && job.status !== filterStatus) return false;
    if (filterDate && (job.scheduled_date || "").slice(0, 10) !== filterDate) return false;
    if (!q) return true;
    return [job.title, job.leads?.name || "", job.address || "", job.notes || ""].join(" ").toLowerCase().includes(q);
  }), [jobs, search, filterStatus, filterDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search title, lead, address, notes" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} className="lg:w-[170px]" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="lg:w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All jobs</SelectItem>{STATUSES.map((status) => <SelectItem key={status} value={status}>{JOB_STATUS_LABELS[status]}</SelectItem>)}</SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" />Add Job</Button></DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Job</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div><Label>Lead</Label><Select value={form.lead_id} onValueChange={(value) => setForm({ ...form, lead_id: value })}><SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger><SelectContent>{leads.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
              <div className="grid gap-3 md:grid-cols-3">
                <div><Label>Scheduled</Label><Input type="date" value={form.scheduled_date} onChange={(event) => setForm({ ...form, scheduled_date: event.target.value })} /></div>
                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div>
                <div><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{JOB_STATUS_LABELS[status]}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
              <Button onClick={save}>Save Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No jobs found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const photos = photosByJob[job.id] || [];
            return (
              <div key={job.id} className="rounded-xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-base font-semibold">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.leads?.name || "No lead"} • {job.address || "No address"}</p>
                    <p className="mt-1 text-sm">{asDate(job.scheduled_date)} • {asCurrency(job.amount)}</p>
                  </div>
                  <span className={`w-fit rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[job.status] || "bg-secondary"}`}>{JOB_STATUS_LABELS[job.status] || job.status}</span>
                </div>

                {job.notes && <pre className="mt-3 max-h-40 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{job.notes}</pre>}

                <div className="mt-3 flex flex-wrap gap-1">
                  {STATUSES.map((status) => <Button key={status} size="sm" variant="outline" onClick={() => updateStatus(job, status)}>{JOB_STATUS_LABELS[status]}</Button>)}
                  <Button size="sm" onClick={() => createInvoice(job)}>Create invoice</Button>
                  <Button size="sm" variant="secondary" onClick={() => createFollowUp(job)}>Create follow-up</Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(job)}>Edit</Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4" />Technician note</div>
                    <Textarea placeholder="Add work performed, parts used, customer notes, next steps..." value={jobNoteDrafts[job.id] || ""} onChange={(event) => setJobNoteDrafts((current) => ({ ...current, [job.id]: event.target.value }))} rows={3} />
                    <Button className="mt-2" size="sm" onClick={() => addTechnicianNote(job)} disabled={savingNoteJobId === job.id}>{savingNoteJobId === job.id ? "Saving…" : "Add note"}</Button>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold"><Camera className="h-4 w-4" />Job photos</div>
                      <label className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                        {uploadingJobId === job.id ? "Uploading…" : "Upload"}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingJobId === job.id} onChange={(event) => uploadJobPhoto(job, event)} />
                      </label>
                    </div>
                    {photos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No photos yet. Upload before/after or equipment photos.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
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
    <div className="space-y-2">{filtered.map(j=><div key={j.id} className="border rounded p-3"><div className="flex justify-between gap-2"><div><p className="font-medium">{j.title}</p><p className="text-xs text-muted-foreground">{j.leads?.name || "—"} • {j.address || "—"}</p></div><span className={`px-2 py-1 rounded text-xs ${STATUS_BADGE_CLASS[j.status] || ""}`}>{JOB_STATUS_LABELS[j.status] || j.status}</span></div><p className="text-sm mt-1">{asDate(j.scheduled_date)} • {asCurrency(j.amount)}</p><p className="text-sm text-muted-foreground">{j.notes || ""}</p><div className="flex gap-1 mt-2 flex-wrap">{STATUSES.map(s=><Button key={s} size="sm" variant="outline" onClick={()=>updateStatus(j,s)}>{JOB_STATUS_LABELS[s]}</Button>)}<Button size="sm" onClick={()=>createInvoice(j)}>Create invoice</Button><Button size="sm" variant="secondary" onClick={()=>createFollowUp(j)}>Create follow-up</Button></div>
      <div className="mt-4 border-t pt-3">
        <p className="text-sm font-medium mb-2">Activity</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
            <div className="space-y-1 max-h-40 overflow-auto pr-1">
              {(jobNotes[j.id] || []).map((note) => (
                <div key={note.id} className="rounded-md border bg-muted/40 px-2 py-1 text-sm">
                  <p>{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">{asDate(note.created_at)}</p>
                </div>
              ))}
              {(jobNotes[j.id] || []).length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input value={noteDrafts[j.id] || ""} onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [j.id]: e.target.value }))} placeholder="Add note for technician updates" />
              <Button onClick={() => addNote(j)} disabled={savingNoteFor === j.id}>{savingNoteFor === j.id ? "Saving..." : "Submit note"}</Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Photos</p>
            <label className="inline-flex">
              <input className="hidden" type="file" accept="image/*" onChange={(e) => uploadPhoto(j, e)} />
              <Button type="button" variant="outline" asChild disabled={uploadingFor === j.id}>
                <span><Upload className="h-4 w-4 mr-1"/>{uploadingFor === j.id ? "Uploading..." : "Upload photo"}</span>
              </Button>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(jobPhotos[j.id] || []).map((photo) => (
                <a key={photo.id} href={photo.public_url || "#"} target="_blank" rel="noreferrer" className="block overflow-hidden rounded border bg-muted/30">
                  <img src={photo.public_url || ""} alt="Job upload" className="h-24 w-full object-cover" loading="lazy" />
                </a>
              ))}
            </div>
            {(jobPhotos[j.id] || []).length === 0 && <p className="text-sm text-muted-foreground mt-2">No photos yet.</p>}
          </div>
        </div>
      </div>
      </div>)}</div>
  </div>;
};
