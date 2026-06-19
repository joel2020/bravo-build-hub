import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { asCurrency, asDate, createActivity, ensureRevenueLoopForCompletedJob, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";
import { Camera, CheckCircle2, ClipboardList, MapPin, MessageSquare, Phone, PlayCircle, RefreshCw, UserRound, Wrench } from "lucide-react";

const PHOTO_BUCKET = "job-photos";

type Technician = {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
};

type Job = {
  id: string;
  lead_id: string | null;
  title: string | null;
  description: string | null;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  scheduled_date: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  amount: number | null;
  total_amount: number | null;
  notes: string | null;
  dispatch_notes: string | null;
  completion_summary: string | null;
  technician_id: string | null;
  created_at: string;
  leads?: { name: string; phone?: string | null; email?: string | null } | null;
};

type JobPhoto = {
  id: string;
  job_id: string;
  storage_path: string;
  public_url: string | null;
  caption: string | null;
  created_at: string;
};

const getSchedule = (job: Job) => job.scheduled_at || job.scheduled_date;
const getAmount = (job: Job) => Number(job.total_amount ?? job.amount ?? 0);
const getCustomerName = (job: Job) => job.customer_name || (job.leads?.name || [job.leads?.first_name, job.leads?.last_name].filter(Boolean).join(' ') || 'Unknown') || "Customer";
const getPhone = (job: Job) => job.customer_phone || job.leads?.phone || "";
const getEmail = (job: Job) => job.customer_email || job.leads?.email || "";

export const CRMMyJobs = () => {
  const [loading, setLoading] = useState(true);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [photosByJobId, setPhotosByJobId] = useState<Record<string, JobPhoto[]>>({});
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const loadPhotos = async (jobIds: string[]) => {
    if (jobIds.length === 0) {
      setPhotosByJobId({});
      return;
    }

    const { data, error } = await supabase
      .from("job_photos" as any)
      .select("id,job_id,storage_path,public_url,caption,created_at")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Photo load failed", description: error.message, variant: "destructive" });
      return;
    }

    const grouped = ((data as unknown as JobPhoto[]) || []).reduce<Record<string, JobPhoto[]>>((acc, photo) => {
      if (!acc[photo.job_id]) acc[photo.job_id] = [];
      acc[photo.job_id].push(photo);
      return acc;
    }, {});
    setPhotosByJobId(grouped);
  };

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const [{ data: roleRows }, { data: techRows }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", session.user.id),
      supabase.from("technicians" as any).select("id,user_id,name,email,phone,active").eq("user_id", session.user.id).maybeSingle(),
    ]);

    const admin = ((roleRows as { role: string }[]) || []).some((row) => row.role === "admin");
    const tech = (techRows as Technician | null) || null;
    setIsAdmin(admin);
    setTechnician(tech);

    let query = supabase
      .from("jobs" as any)
      .select("id,lead_id,title,description,status,customer_name,customer_email,customer_phone,address,scheduled_date,scheduled_at,started_at,completed_at,amount,total_amount,notes,dispatch_notes,completion_summary,technician_id,created_at,leads(name,phone,email)")
      .neq("status", "cancelled")
      .order("scheduled_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (tech?.id) {
      query = query.eq("technician_id", tech.id);
    } else if (!admin) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Failed to load assigned jobs", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const nextJobs = ((data as unknown as Job[]) || []).sort((a, b) => {
      const aTime = getSchedule(a) ? new Date(getSchedule(a) as string).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = getSchedule(b) ? new Date(getSchedule(b) as string).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

    setJobs(nextJobs);
    await loadPhotos(nextJobs.map((job) => job.id));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => job.status !== "completed" || new Date(job.completed_at || job.created_at).toDateString() === new Date().toDateString());
  }, [jobs]);

  const startJob = async (job: Job) => {
    setSavingJobId(job.id);
    const now = new Date().toISOString();
    const { error } = await supabase.from("jobs" as any).update({ status: "in_progress", started_at: job.started_at || now }).eq("id", job.id);
    setSavingJobId(null);

    if (error) {
      toast({ title: "Could not start job", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Technician started job", { jobId: job.id, leadId: job.lead_id || undefined, details: job.title || "Job started" });
    toast({ title: "Job started" });
    await load();
  };

  const completeJob = async (job: Job) => {
    const summary = (summaries[job.id] || job.completion_summary || "").trim();
    setSavingJobId(job.id);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("jobs" as any)
      .update({ status: "completed", completed_at: now, completion_summary: summary || null })
      .eq("id", job.id);
    setSavingJobId(null);

    if (error) {
      toast({ title: "Could not complete job", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Technician completed job", { jobId: job.id, leadId: job.lead_id || undefined, details: summary || job.title || "Job completed" });
    await ensureRevenueLoopForCompletedJob({
      id: job.id,
      lead_id: job.lead_id,
      title: job.title,
      amount: job.amount,
      total_amount: job.total_amount,
      customer_name: job.customer_name,
      customer_phone: job.customer_phone,
      customer_email: job.customer_email,
      leads: job.leads ? { name: job.leads.name, phone: job.leads.phone || null, email: job.leads.email || null } : null,
    });
    toast({ title: "Job completed" });
    await load();
  };

  const addNote = async (job: Job) => {
    const text = (notes[job.id] || "").trim();
    if (!text) {
      toast({ title: "Add a note before saving", variant: "destructive" });
      return;
    }

    setSavingJobId(job.id);
    const timestamp = new Date().toLocaleString();
    const current = job.notes?.trim() || "";
    const updated = `${current}${current ? "\n\n" : ""}[${timestamp}] ${text}`;
    const { error } = await supabase.from("jobs" as any).update({ notes: updated }).eq("id", job.id);
    setSavingJobId(null);

    if (error) {
      toast({ title: "Note failed", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Technician note added", { jobId: job.id, leadId: job.lead_id || undefined, details: text.slice(0, 160) });
    setNotes((currentNotes) => ({ ...currentNotes, [job.id]: "" }));
    toast({ title: "Note added" });
    await load();
  };

  const uploadPhoto = async (job: Job, type: "before" | "after" | "general", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image", variant: "destructive" });
      return;
    }

    const key = `${job.id}-${type}`;
    setUploadingKey(key);
    const ext = file.name.split(".").pop() || "jpg";
    const storagePath = `${job.id}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setUploadingKey(null);
      toast({ title: "Photo upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
    const { error: insertError } = await supabase.from("job_photos" as any).insert({
      job_id: job.id,
      lead_id: job.lead_id,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      caption: type,
    });
    setUploadingKey(null);

    if (insertError) {
      toast({ title: "Photo link failed", description: insertError.message, variant: "destructive" });
      return;
    }

    await createActivity("Technician photo uploaded", { jobId: job.id, leadId: job.lead_id || undefined, details: `${type} photo` });
    toast({ title: `${type === "general" ? "Job" : type} photo uploaded` });
    await loadPhotos(jobs.map((currentJob) => currentJob.id));
  };

  const emptyMessage = technician
    ? "No assigned jobs found. Assigned jobs will appear here as dispatch schedules them."
    : isAdmin
      ? "No technician mapping found for your user. Showing all active jobs when available."
      : "Your user is not mapped to a technician record yet.";

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">Field mode</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Mobile Technician Jobs</h2>
            <p className="text-sm text-slate-600">
              {technician ? `Signed in as ${technician.name}` : isAdmin ? "Admin fallback: viewing active jobs." : "Technician access pending."}
            </p>
          </div>
          <Button variant="outline" className="h-12 rounded-2xl bg-white" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-sm text-slate-500">Loading technician jobs…</div>
      ) : visibleJobs.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600"><UserRound className="h-6 w-6" /></div>
          <div className="font-black text-slate-950">No jobs to show</div>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleJobs.map((job) => {
            const phone = getPhone(job);
            const email = getEmail(job);
            const photos = photosByJobId[job.id] || [];
            const beforePhotos = photos.filter((photo) => photo.caption === "before");
            const afterPhotos = photos.filter((photo) => photo.caption === "after");
            const generalPhotos = photos.filter((photo) => !["before", "after"].includes(photo.caption || ""));
            const schedule = getSchedule(job);
            const isSaving = savingJobId === job.id;

            return (
              <div key={job.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="border-b bg-gradient-to-br from-slate-950 to-blue-950 p-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="mb-3 rounded-full bg-white/15 text-white hover:bg-white/15">{schedule ? asDate(schedule) : "Unscheduled"}</Badge>
                      <h3 className="text-xl font-black leading-tight">{job.title || "Service Job"}</h3>
                      <p className="mt-1 text-sm text-blue-100">{getCustomerName(job)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${STATUS_BADGE_CLASS[job.status] || "bg-white/20 text-white"}`}>
                      {JOB_STATUS_LABELS[job.status] || job.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid gap-2 text-sm">
                    {job.address && (
                      <a className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 font-semibold text-slate-800" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`} target="_blank" rel="noreferrer">
                        <MapPin className="h-4 w-4 text-blue-600" />{job.address}
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-xs font-bold uppercase text-slate-400">Ticket</div>
                        <div className="font-black text-slate-950">{asCurrency(getAmount(job))}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-xs font-bold uppercase text-slate-400">Started</div>
                        <div className="font-black text-slate-950">{job.started_at ? asDate(job.started_at) : "Not yet"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-14 rounded-2xl text-base font-black" onClick={() => startJob(job)} disabled={isSaving || job.status === "in_progress" || job.status === "completed"}>
                      <PlayCircle className="mr-2 h-5 w-5" />Start
                    </Button>
                    <Button className="h-14 rounded-2xl bg-emerald-600 text-base font-black hover:bg-emerald-700" onClick={() => completeJob(job)} disabled={isSaving || job.status === "completed"}>
                      <CheckCircle2 className="mr-2 h-5 w-5" />Complete
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="h-12 rounded-2xl bg-white font-bold" disabled={!phone}>
                      <a href={phone ? `tel:${phone}` : undefined}><Phone className="mr-2 h-4 w-4" />Call</a>
                    </Button>
                    <Button asChild variant="outline" className="h-12 rounded-2xl bg-white font-bold" disabled={!phone && !email}>
                      <a href={phone ? `sms:${phone}` : `mailto:${email}`}><MessageSquare className="mr-2 h-4 w-4" />Text/Email</a>
                    </Button>
                  </div>

                  {job.dispatch_notes && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                      <div className="mb-1 text-xs font-black uppercase tracking-wide text-blue-700">Dispatch notes</div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">{job.dispatch_notes}</p>
                    </div>
                  )}

                  <div className="rounded-2xl border p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950"><ClipboardList className="h-4 w-4 text-blue-600" />Add technician note</div>
                    <Textarea rows={3} placeholder="Work performed, parts used, customer notes..." value={notes[job.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [job.id]: event.target.value }))} />
                    <Button className="mt-2 h-11 w-full rounded-xl" onClick={() => addNote(job)} disabled={isSaving}>Add Note</Button>
                  </div>

                  <div className="rounded-2xl border p-3">
                    <div className="mb-2 text-sm font-black text-slate-950">Completion summary</div>
                    <Textarea rows={3} placeholder="Final summary before marking complete..." value={summaries[job.id] ?? job.completion_summary ?? ""} onChange={(event) => setSummaries((current) => ({ ...current, [job.id]: event.target.value }))} />
                  </div>

                  <div className="rounded-2xl border p-3">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><Camera className="h-4 w-4 text-blue-600" />Photos</div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["before", "after", "general"] as const).map((type) => (
                        <label key={type} className="flex h-12 cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-2 text-center text-xs font-black capitalize text-white">
                          {uploadingKey === `${job.id}-${type}` ? "Uploading" : `${type}`}
                          <input type="file" accept="image/*" capture="environment" className="hidden" disabled={Boolean(uploadingKey)} onChange={(event) => uploadPhoto(job, type, event)} />
                        </label>
                      ))}
                    </div>

                    {photos.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {[
                          ["Before", beforePhotos],
                          ["After", afterPhotos],
                          ["General", generalPhotos],
                        ].map(([label, group]) => Array.isArray(group) && group.length > 0 ? (
                          <div key={label as string}>
                            <div className="mb-1 text-xs font-black uppercase tracking-wide text-slate-400">{label as string}</div>
                            <div className="grid grid-cols-3 gap-2">
                              {(group as JobPhoto[]).map((photo) => (
                                <a key={photo.id} href={photo.public_url || "#"} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border bg-slate-100">
                                  <img src={photo.public_url || ""} alt={`${label} job upload`} className="h-24 w-full object-cover" loading="lazy" />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null)}
                      </div>
                    )}
                  </div>

                  {job.notes && (
                    <details className="rounded-2xl border bg-slate-50 p-3">
                      <summary className="cursor-pointer text-sm font-black text-slate-950">View job notes</summary>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{job.notes}</pre>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
