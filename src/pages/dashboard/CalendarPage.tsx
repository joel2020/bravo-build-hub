import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("appointments" as any).select("id, starts_at, ends_at, status, notes").order("starts_at", { ascending: true }).then(({ data }) => setAppointments(data || []));
  }, []);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <div className="space-y-2">
        {appointments.map((a) => (
          <div key={a.id} className="rounded-lg border p-3 bg-card text-sm">
            <div className="font-semibold">{new Date(a.starts_at).toLocaleString()} {a.ends_at ? `- ${new Date(a.ends_at).toLocaleString()}` : ""}</div>
            <div>Status: {a.status}</div>
            <div className="text-muted-foreground">{a.notes || "No notes"}</div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
