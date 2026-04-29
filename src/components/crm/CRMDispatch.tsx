import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const CRMDispatch = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, status, scheduled_date, assigned_to")
      .order("scheduled_date", { ascending: true });

    setJobs(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("jobs").update({ status }).eq("id", id);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);

  const buckets = {
    today: jobs.filter(j => j.scheduled_date?.slice(0,10) === today && j.status !== "completed"),
    upcoming: jobs.filter(j => j.scheduled_date?.slice(0,10) > today && j.status !== "completed"),
    unscheduled: jobs.filter(j => !j.scheduled_date),
    completed: jobs.filter(j => j.status === "completed")
  };

  const Column = ({ title, items }: any) => (
    <div className="flex-1 border rounded p-3">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((job: any) => (
          <div key={job.id} className="border rounded p-2 text-sm">
            <div className="font-medium">{job.title}</div>
            <div className="text-xs text-muted-foreground">{job.scheduled_date?.slice(0,10) || "No date"}</div>
            <div className="flex gap-1 mt-2">
              <Button size="sm" onClick={() => updateStatus(job.id, "in_progress")}>Start</Button>
              <Button size="sm" onClick={() => updateStatus(job.id, "completed")}>Done</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto">
      <Column title="Today" items={buckets.today} />
      <Column title="Upcoming" items={buckets.upcoming} />
      <Column title="Unscheduled" items={buckets.unscheduled} />
      <Column title="Completed" items={buckets.completed} />
    </div>
  );
};