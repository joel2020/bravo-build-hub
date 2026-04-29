import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Check } from "lucide-react";
import { createActivity, asDateTime } from "@/lib/crm";

type FollowUp = {
  id: string; lead_id: string | null; job_id: string | null;
  due_date: string; note: string; completed: boolean; created_at: string;
  leads?: { name: string } | null; jobs?: { title: string } | null;
};

type LeadOption = { id: string; name: string };
type JobOption = { id: string; title: string };

export const CRMFollowUps = () => {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [leadOptions, setLeadOptions] = useState<LeadOption[]>([]);
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [filter, setFilter] = useState<"pending" | "completed" | "all">("pending");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ lead_id: "", job_id: "", due_date: "", note: "" });

  const load = async () => {
    const [{ data: f }, { data: l }, { data: j }] = await Promise.all([
      supabase.from("follow_ups").select("*, leads(name), jobs(title)").order("due_date", { ascending: true }),
      supabase.from("leads").select("id, name").order("name"),
      supabase.from("jobs").select("id, title").order("title"),
    ]);
    setItems((f as FollowUp[]) || []);
    setLeadOptions((l as LeadOption[]) || []);
    setJobOptions((j as JobOption[]) || []);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ lead_id: "", job_id: "", due_date: "", note: "" });

  const save = async () => {
    if (!form.due_date || !form.note.trim()) { toast({ title: "Date and note required", variant: "destructive" }); return; }
    if (!form.lead_id && !form.job_id) { toast({ title: "Link to a lead or job", variant: "destructive" }); return; }
    const { error } = await supabase.from("follow_ups").insert({
      lead_id: form.lead_id || null, job_id: form.job_id || null,
      due_date: form.due_date, note: form.note,
    });
    if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
    await createActivity("Follow-up created", { leadId: form.lead_id || null, jobId: form.job_id || null, details: form.note.trim() });
    toast({ title: "Follow-up created" }); setOpen(false); resetForm(); load();
  };

  const toggleComplete = async (id: string, current: boolean) => {
    const { error } = await supabase.from("follow_ups").update({ completed: !current }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { await createActivity(current ? "Follow-up reopened" : "Follow-up completed", { details: id }); load(); }
  };

  const filtered = items.filter((f) =>
    filter === "all" ? true : filter === "pending" ? !f.completed : f.completed,
  );

  const isOverdue = (f: FollowUp) => !f.completed && new Date(f.due_date) < new Date();

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="flex gap-2">
          {(["pending", "completed", "all"] as const).map((v) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-secondary"}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)} ({items.filter((f) => v === "all" ? true : v === "pending" ? !f.completed : f.completed).length})
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New Follow-up</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div><Label>Lead</Label>
                  <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{leadOptions.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Job</Label>
                  <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{jobOptions.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Due Date *</Label><Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                <div><Label>Note *</Label><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} /></div>
                <Button onClick={save}>Create Follow-up</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No follow-ups</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((f) => (
            <li key={f.id} className={`border border-border rounded-lg p-4 flex items-start gap-3 ${f.completed ? "opacity-60" : ""} ${isOverdue(f) ? "border-destructive/50 bg-destructive/5" : "bg-background"}`}>
              <button onClick={() => toggleComplete(f.id, f.completed)}
                className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 ${f.completed ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                {f.completed && <Check className="h-3 w-3" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${f.completed ? "line-through" : ""}`}>{f.note}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                  <span className={isOverdue(f) ? "text-destructive font-medium" : ""}>{asDateTime(f.due_date)}</span>
                  {f.leads?.name && <span>Lead: {f.leads.name}</span>}
                  {f.jobs?.title && <span>Job: {f.jobs.title}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};