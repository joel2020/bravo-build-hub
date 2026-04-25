import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardHome() {
  const [counts, setCounts] = useState({ leads: 0, customers: 0, jobs: 0, tasks: 0 });

  useEffect(() => {
    const load = async () => {
      const [leads, customers, jobs, tasks] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("customers" as any).select("id", { count: "exact", head: true }),
        supabase.from("jobs" as any).select("id", { count: "exact", head: true }),
        supabase.from("tasks" as any).select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        leads: leads.count || 0,
        customers: customers.count || 0,
        jobs: jobs.count || 0,
        tasks: tasks.count || 0,
      });
    };
    load();
  }, []);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="rounded-lg border p-4 bg-card">
            <div className="text-sm text-muted-foreground uppercase">{k}</div>
            <div className="text-3xl font-bold">{v}</div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
