import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function JobsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("jobs" as any).select("id,title,status,service_type,scheduled_at,customer_id").order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  }, []);

  const filtered = useMemo(() => rows.filter((j) => `${j.title} ${j.status} ${j.service_type || ""}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>
      <Input placeholder="Search jobs" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-md" />
      <div className="space-y-2">
        {filtered.map((job) => (
          <Link key={job.id} to={`/dashboard/jobs/${job.id}`} className="block rounded-lg border p-3 bg-card hover:border-primary">
            <div className="font-semibold">{job.title}</div>
            <div className="text-sm text-muted-foreground">{job.status} • {job.service_type || "General"}</div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
