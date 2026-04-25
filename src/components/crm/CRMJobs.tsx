import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Camera } from "lucide-react";

const STATUSES = ["quoted", "scheduled", "in_progress", "completed", "cancelled"] as const;

type Job = {
  id: string; lead_id: string; title: string; description: string | null;
  status: string; address: string | null; scheduled_date: string | null;
  completed_date: string | null; amount: number; notes: string | null;
  created_at: string; leads?: { name: string } | null;
};

type LeadOption = { id: string; name: string };
type JobPhoto = {
  id: string;
  job_id: string;
  storage_path: string;
  public_url: string | null;
  uploaded_by: string | null;
  created_at: string;
};

const statusColor: Record<string, string> = {
  quoted: "bg-orange-100 text-orange-800", scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800", completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const CRMJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leadOptions, setLeadOptions] = useState<LeadOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ lead_id: "", title: "", description: "", status: "quoted" as string, address: "", scheduled_date: "", completed_date: "", amount: "", notes: "" });
  const [jobPhotos, setJobPhotos] = useState<JobPhoto[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<JobPhoto | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const load = async () => {
    const [{ data: j }, { data: l }] = await Promise.all([
      supabase.from("jobs").select("*, leads(name)").order("created_at", { ascending: false }),
      supabase.from("leads").select("id, name").order("name"),
    ]);
    setJobs((j as Job[]) || []);
    setLeadOptions((l as LeadOption[]) || []);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ lead_id: "", title: "", description: "", status: "quoted", address: "", scheduled_date: "", completed_date: "", amount: "", notes: "" }); setEditId(null); };
  const resetDialog = () => {
    resetForm();
    setJobPhotos([]);
    setPreviewPhoto(null);
  };

  const loadJobPhotos = async (jobId: string) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setJobPhotos([]);
      return;
    }
    const { data, error } = await supabase
      .from("job_photos")
      .select("id, job_id, storage_path, public_url, uploaded_by, created_at")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Unable to load job photos", description: error.message, variant: "destructive" });
      return;
    }
    setJobPhotos((data as JobPhoto[]) || []);
  };

  const save = async () => {
    if (!form.title.trim() || !form.lead_id) { toast({ title: "Title and lead required", variant: "destructive" }); return; }
    const payload = {
      lead_id: form.lead_id, title: form.title, description: form.description || null,
      status: form.status as any, address: form.address || null,
      scheduled_date: form.scheduled_date || null, completed_date: form.completed_date || null,
      amount: form.amount ? parseFloat(form.amount) : 0, notes: form.notes || null,
    };
    if (editId) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", editId);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      await supabase.from("activity_log").insert({ action: "Job updated", job_id: editId, lead_id: form.lead_id, details: `Status: ${form.status}` });
      toast({ title: "Job updated" });
    } else {
      const { data: newJob, error } = await supabase.from("jobs").insert(payload).select("id").single();
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
      if (newJob) await supabase.from("activity_log").insert({ action: "Job created", job_id: newJob.id, lead_id: form.lead_id, details: form.title });
      toast({ title: "Job created" });
    }
    setOpen(false); resetForm(); load();
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Job deleted" }); load();
  };

  const startEdit = (j: Job) => {
    setForm({ lead_id: j.lead_id, title: j.title, description: j.description || "", status: j.status, address: j.address || "", scheduled_date: j.scheduled_date || "", completed_date: j.completed_date || "", amount: String(j.amount || ""), notes: j.notes || "" });
    setEditId(j.id);
    setOpen(true);
    loadJobPhotos(j.id);
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!editId) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({ title: "Authentication required", description: "Please sign in to upload photos.", variant: "destructive" });
      return;
    }

    setUploadingPhotos(true);
    let uploaded = 0;
    const failedFiles: string[] = [];

    for (const [index, file] of Array.from(files).entries()) {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `jobs/${editId}/${Date.now()}-${index}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage.from("job-photos").upload(storagePath, file, {
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        failedFiles.push(file.name);
        continue;
      }

      const { data: publicData } = supabase.storage.from("job-photos").getPublicUrl(storagePath);
      const { data: signedData } = await supabase.storage.from("job-photos").createSignedUrl(storagePath, 60 * 60 * 24 * 365);
      const urlToStore = signedData?.signedUrl || publicData.publicUrl || null;

      const { error: insertError } = await supabase.from("job_photos").insert({
        job_id: editId,
        storage_path: storagePath,
        public_url: urlToStore,
        uploaded_by: authData.user.id,
      });

      if (insertError) {
        failedFiles.push(file.name);
        continue;
      }

      uploaded += 1;
    }

    setUploadingPhotos(false);
    event.target.value = "";
    await loadJobPhotos(editId);

    if (uploaded > 0) {
      toast({ title: `Uploaded ${uploaded} photo${uploaded === 1 ? "" : "s"}` });
    }
    if (failedFiles.length > 0) {
      toast({ title: "Some photos failed to upload", description: failedFiles.join(", "), variant: "destructive" });
    }
  };

  const filtered = jobs.filter((j) => {
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !(j.leads?.name || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetDialog(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add Job</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit Job" : "New Job"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label>Lead *</Label>
                <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                  <SelectContent>{leadOptions.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Scheduled</Label><Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} /></div>
                <div><Label>Completed</Label><Input type="date" value={form.completed_date} onChange={(e) => setForm({ ...form, completed_date: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              {editId && (
                <div className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Job Photos</p>
                      <p className="text-xs text-muted-foreground">Take or upload photos from mobile for this job.</p>
                    </div>
                    <Label htmlFor="job-photo-upload" className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-primary-foreground text-sm min-h-11">
                        <Camera className="h-4 w-4" />
                        Upload / Take Photos
                      </span>
                    </Label>
                    <Input
                      id="job-photo-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhotos}
                    />
                  </div>

                  {uploadingPhotos && <p className="text-sm text-muted-foreground">Uploading photos…</p>}

                  {jobPhotos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {jobPhotos.map((photo) => (
                        <button
                          type="button"
                          key={photo.id}
                          className="text-left rounded-md border overflow-hidden hover:border-primary transition-colors"
                          onClick={() => setPreviewPhoto(photo)}
                        >
                          <img
                            src={photo.public_url || ""}
                            alt="Job upload"
                            className="w-full h-28 object-cover bg-secondary"
                            loading="lazy"
                          />
                          <div className="p-2">
                            <p className="text-xs text-muted-foreground">Uploaded {new Date(photo.created_at).toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Button onClick={save}>{editId ? "Update" : "Create"} Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!previewPhoto} onOpenChange={(openState) => { if (!openState) setPreviewPhoto(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Job Photo</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="space-y-3">
              <img src={previewPhoto.public_url || ""} alt="Expanded job photo" className="w-full max-h-[70vh] object-contain rounded-md bg-secondary" />
              <p className="text-xs text-muted-foreground">Uploaded {new Date(previewPhoto.created_at).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="border border-border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Lead</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Amount</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Scheduled</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No jobs found</td></tr>
            ) : filtered.map((j) => (
              <tr key={j.id} className="border-t border-border hover:bg-secondary/50 cursor-pointer" onClick={() => startEdit(j)}>
                <td className="p-3 font-medium">{j.title}</td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{j.leads?.name}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[j.status] || ""}`}>{j.status.replace(/_/g, " ")}</span></td>
                <td className="p-3 hidden md:table-cell">${Number(j.amount).toLocaleString()}</td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{j.scheduled_date || "—"}</td>
                <td className="p-3 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); startEdit(j); }}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-3 w-3" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete job?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{j.title}". Linked invoices may be affected.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJob(j.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{filtered.length} job{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
};
