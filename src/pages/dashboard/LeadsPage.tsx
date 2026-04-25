import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.from("leads").select("id, full_name, phone, email, status, source, created_at, service_requested").order("created_at", { ascending: false }).then(({ data }) => {
      setLeads(data || []);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return leads.filter((l) => [l.full_name, l.email, l.phone, l.service_requested, l.status].some((x) => String(x || "").toLowerCase().includes(q)));
  }, [leads, query]);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">Lead inbox</h1>
      <Input placeholder="Search leads" value={query} onChange={(e) => setQuery(e.target.value)} className="mb-4 max-w-md" />
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-2">Name</th><th className="text-left p-2">Service</th><th className="text-left p-2">Status</th><th className="text-left p-2">Source</th><th className="text-left p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-t hover:bg-secondary/40">
                <td className="p-2"><Link className="text-primary underline" to={`/dashboard/leads/${lead.id}`}>{lead.full_name}</Link></td>
                <td className="p-2">{lead.service_requested || "-"}</td>
                <td className="p-2">{lead.status}</td>
                <td className="p-2">{lead.source}</td>
                <td className="p-2">{new Date(lead.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
