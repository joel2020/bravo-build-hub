import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export const CRMMyJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);

    const { data } = await supabase
      .from("jobs")
      .select("id, title, status, scheduled_date, technician_id, notes")
      .eq("technician_id", session.user.id)
      .order("scheduled_date", { ascending: true });

    setJobs(data || []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (jobId: string, status: string) => {
    await supabase.from("jobs").update({ status }).eq("id", jobId);
    load();
  };

  const addNote = async (job: any) => {
    const text = notes[job.id];
    if (!text) return;
    const updated = (job.notes || "") + "\n" + text;
    await supabase.from("jobs").update({ notes: updated }).eq("id", job.id);
    setNotes({ ...notes, [job.id]: "" });
    toast({ title: "Note added" });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Jobs Today</h2>
      {jobs.map(job => (
        <div key={job.id} className="border rounded p-3">
          <div className="font-semibold">{job.title}</div>
          <div className="text-sm">{job.scheduled_date}</div>

          <div className="flex gap-2 mt-2">
            <Button onClick={() => updateStatus(job.id, "in_progress")}>Start</Button>
            <Button onClick={() => updateStatus(job.id, "completed")}>Complete</Button>
          </div>

          <Textarea
            value={notes[job.id] || ""}
            onChange={(e) => setNotes({ ...notes, [job.id]: e.target.value })}
            placeholder="Add job note..."
            className="mt-2"
          />
          <Button size="sm" onClick={() => addNote(job)}>Add Note</Button>
        </div>
      ))}
    </div>
  );
};