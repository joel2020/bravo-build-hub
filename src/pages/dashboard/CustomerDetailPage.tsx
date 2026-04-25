import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from("customers" as any).select("*").eq("id", id).maybeSingle().then(({ data }) => setCustomer(data));
    supabase.from("jobs" as any).select("id,title,status,scheduled_at").eq("customer_id", id).order("created_at", { ascending: false }).then(({ data }) => setJobs(data || []));
  }, [id]);

  if (!customer) return <DashboardShell><div>Loading...</div></DashboardShell>;

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">{customer.full_name}</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border p-4 bg-card space-y-1">
          <p><b>Phone:</b> {customer.phone || "-"}</p>
          <p><b>Email:</b> {customer.email || "-"}</p>
          <p><b>Source:</b> {customer.source || "-"}</p>
          <p><b>Disposition:</b> {customer.disposition || "-"}</p>
          <p><b>Next follow-up:</b> {customer.next_follow_up_at ? new Date(customer.next_follow_up_at).toLocaleString() : "-"}</p>
          <p><b>Call summary:</b> {customer.call_summary || "-"}</p>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <h2 className="font-semibold mb-2">Jobs</h2>
          <ul className="space-y-2 text-sm">
            {jobs.map((j) => <li key={j.id} className="border rounded p-2">{j.title} — {j.status}</li>)}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
