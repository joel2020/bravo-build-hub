import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

const statuses = ["new_lead", "contact_attempted", "qualified", "estimate_scheduled", "estimate_sent", "won", "lost", "no_response", "maintenance_customer"];

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  const load = async () => {
    if (!id) return;
    const [{ data: leadData }, { data: actData }] = await Promise.all([
      supabase.from("leads").select("*").eq("id", id).maybeSingle(),
      supabase.from("activities" as any).select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    ]);
    setLead(leadData);
    setActivities(actData || []);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    await supabase.from("leads").update({ status }).eq("id", id);
    await supabase.from("activities" as any).insert({ lead_id: id, activity_type: "status_change", summary: `Lead moved to ${status}` });
    load();
  };

  const addNote = async () => {
    if (!id || !note.trim()) return;
    await supabase.from("notes" as any).insert({ lead_id: id, body: note.trim(), note_type: "manual" });
    await supabase.from("activities" as any).insert({ lead_id: id, activity_type: "manual_note", summary: note.trim() });
    setNote("");
    load();
  };

  if (!lead) return <DashboardShell><div>Loading...</div></DashboardShell>;

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">{lead.full_name}</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border p-4 bg-card space-y-2">
            <p><b>Status:</b> {lead.status}</p>
            <p><b>Phone:</b> {lead.phone || "-"}</p>
            <p><b>Email:</b> {lead.email || "-"}</p>
            <p><b>Service:</b> {lead.service_requested || "-"}</p>
            <p><b>Urgency:</b> {lead.urgency}</p>
            <p><b>Source:</b> {lead.source}</p>
          </div>

          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-semibold mb-2">Activity timeline</h2>
            <ul className="space-y-2 text-sm">
              {activities.map((a) => (
                <li key={a.id} className="border rounded p-2">
                  <div className="font-medium">{a.activity_type}</div>
                  <div>{a.summary || "-"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="font-semibold mb-2">Pipeline</h2>
            <div className="space-y-2">
              {statuses.map((s) => <button key={s} onClick={() => updateStatus(s)} className="block w-full text-left border rounded px-2 py-1 hover:bg-secondary">{s}</button>)}
            </div>
          </div>
          <div className="rounded-lg border p-4 bg-card space-y-2">
            <h2 className="font-semibold">Add note</h2>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded p-2 h-24 bg-background" />
            <button onClick={addNote} className="px-3 py-2 rounded bg-primary text-primary-foreground">Save note</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
