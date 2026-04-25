import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { JobPhotoUploader } from "@/components/dashboard/JobPhotoUploader";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [note, setNote] = useState("");

  const load = async () => {
    if (!id) return;
    const [{ data: jobData }, { data: photosData }] = await Promise.all([
      supabase.from("jobs" as any).select("*").eq("id", id).maybeSingle(),
      supabase.from("job_photos" as any).select("*").eq("job_id", id).order("created_at", { ascending: false }),
    ]);
    setJob(jobData);
    const normalized = (photosData || []).map((p: any) => ({
      ...p,
      signedUrl: null,
    }));
    for (const p of normalized) {
      const { data } = await supabase.storage.from("job-photos").createSignedUrl(p.file_path, 3600);
      p.signedUrl = data?.signedUrl || null;
    }
    setPhotos(normalized);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    await supabase.from("jobs" as any).update({ status }).eq("id", id);
    await supabase.from("activities" as any).insert({ job_id: id, customer_id: job?.customer_id || null, activity_type: "job_status_change", summary: `Job status -> ${status}` });
    load();
  };

  const addTechNote = async () => {
    if (!id || !note.trim()) return;
    await supabase.from("notes" as any).insert({
      job_id: id,
      customer_id: job?.customer_id || null,
      body: note,
      note_type: "service_note",
      follow_up_needed: /follow up/i.test(note),
      replacement_opportunity: /replace|replacement/i.test(note),
      parts_needed: /part/i.test(note),
    });
    await supabase.from("activities" as any).insert({ job_id: id, customer_id: job?.customer_id || null, activity_type: "tech_note", summary: note });
    setNote("");
  };

  if (!job) return <DashboardShell><div>Loading...</div></DashboardShell>;

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border p-4 bg-card space-y-1">
            <p><b>Status:</b> {job.status}</p>
            <p><b>Service type:</b> {job.service_type || "-"}</p>
            <p><b>Scheduled:</b> {job.scheduled_at ? new Date(job.scheduled_at).toLocaleString() : "-"}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["open", "in_progress", "completed", "cancelled"].map((s) => (
                <button key={s} onClick={() => updateStatus(s)} className="border rounded px-2 py-1 text-sm hover:bg-secondary">{s}</button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-semibold mb-2">Photo gallery</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {photos.map((p) => (
                <figure key={p.id} className="border rounded p-2">
                  {p.signedUrl ? <img src={p.signedUrl} alt={p.caption || p.photo_type} className="h-40 w-full object-cover rounded" /> : <div className="h-40 bg-muted rounded" />}
                  <figcaption className="text-xs mt-2">{p.photo_type} {p.caption ? `— ${p.caption}` : ""}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <JobPhotoUploader jobId={job.id} customerId={job.customer_id} onUploaded={load} />
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-semibold mb-2">Tech note</h2>
            <textarea className="w-full border rounded p-2 h-24 bg-background" placeholder="Include follow up needed, parts needed, replacement opportunity..." value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={addTechNote} className="mt-2 px-3 py-2 rounded bg-primary text-primary-foreground">Save note</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
