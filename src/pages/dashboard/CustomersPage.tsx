import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("customers" as any).select("id, full_name, phone, email, maintenance_plan_status, created_at").order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  }, []);

  const filtered = useMemo(() => rows.filter((r) => `${r.full_name} ${r.email || ""} ${r.phone || ""}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <Input placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-md" />
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <Link key={c.id} to={`/dashboard/customers/${c.id}`} className="rounded-lg border p-4 bg-card hover:border-primary">
            <div className="font-semibold">{c.full_name}</div>
            <div className="text-sm text-muted-foreground">{c.phone || "-"} • {c.email || "-"}</div>
            <div className="text-xs mt-2">Plan: {c.maintenance_plan_status || "none"}</div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
