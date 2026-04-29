import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createActivity, LEAD_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";

const STATUSES = ["new", "contacted", "qualified", "quoted", "won", "lost"] as const;
type Lead = { id: string; name: string; phone: string | null; email: string | null; city: string | null; service: string | null; urgency: string | null; source: string; landing_url: string | null; referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; gclid: string | null; fbclid: string | null; notes: string | null; status: string; address: string | null };

export const CRMLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]); const [search, setSearch] = useState(""); const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null); const [noteDraft, setNoteDraft] = useState("");
  const [jobForm, setJobForm] = useState({ scheduled_date: "", amount: "", status: "quoted" });
  const load = async () => { const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }); setLeads((data as Lead[]) || []); };
  useEffect(() => { load(); }, []);

  const updateStatus = async (lead: Lead, status: string) => { await supabase.from("leads").update({ status: status as any }).eq("id", lead.id); await createActivity("Lead status updated", { leadId: lead.id, details: `${lead.status} -> ${status}` }); setSelected({ ...lead, status }); load(); };
  const saveNotes = async () => { if (!selected) return; await supabase.from("leads").update({ notes: noteDraft }).eq("id", selected.id); await createActivity("Lead notes updated", { leadId: selected.id, details: noteDraft.slice(0, 120) }); setSelected({ ...selected, notes: noteDraft }); load(); };
  const createFollowUp = async () => { if (!selected) return; const due = new Date(); due.setDate(due.getDate()+1); await supabase.from("follow_ups").insert({ lead_id: selected.id, note: `Follow up with ${selected.name}`, due_date: due.toISOString() }); await createActivity("Follow-up created", { leadId: selected.id, details: "From lead drawer" }); };
  const convertToJob = async () => { if (!selected) return; const { data, error } = await supabase.from("jobs").insert({ lead_id: selected.id, title: `HVAC Service - ${selected.name}`, address: selected.address, description: selected.notes, notes: selected.notes, scheduled_date: jobForm.scheduled_date || null, amount: jobForm.amount ? Number(jobForm.amount) : 0, status: jobForm.status as any }).select("id").single(); if (error) return toast({ title: "Convert failed", description: error.message, variant: "destructive" }); await createActivity("Job created from lead", { leadId: selected.id, jobId: data.id, details: `HVAC Service - ${selected.name}` }); };

  const filtered = useMemo(() => leads.filter(l => (filterStatus === "all" || l.status === filterStatus) && `${l.name} ${l.phone || ""} ${l.email || ""} ${l.city || ""} ${l.service || ""}`.toLowerCase().includes(search.toLowerCase())), [leads, search, filterStatus]);

  return <div><div className="flex gap-2 mb-3"><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads"/><Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[170px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{STATUSES.map(s=><SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select></div>
  <div className="space-y-2">{filtered.map(l=><button key={l.id} className="w-full border rounded p-3 text-left" onClick={()=>{ setSelected(l); setNoteDraft(l.notes || ""); }}><div className="flex justify-between"><p className="font-medium">{l.name}</p><span className={`text-xs px-2 py-1 rounded ${STATUS_BADGE_CLASS[l.status] || ""}`}>{LEAD_STATUS_LABELS[l.status]}</span></div><p className="text-xs text-muted-foreground">{l.phone} • {l.email}</p></button>)}</div>
  <Sheet open={!!selected} onOpenChange={o=>!o&&setSelected(null)}><SheetContent className="w-full sm:max-w-xl overflow-y-auto"><SheetHeader><SheetTitle>{selected?.name}</SheetTitle></SheetHeader>{selected && <div className="space-y-2 text-sm">
    {(["phone","email","city","service","urgency","source","landing_url","referrer","utm_source","utm_medium","utm_campaign","gclid","fbclid"] as const).map(k=><p key={k}><b>{k}:</b> {selected[k] || "—"}</p>)}
    <Textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} rows={4}/><Button onClick={saveNotes}>Save notes</Button>
    <div className="flex gap-1 flex-wrap"><Button size="sm" onClick={()=>window.open(`tel:${selected.phone || ""}`)}>Call</Button><Button size="sm" onClick={()=>window.open(`sms:${selected.phone || ""}`)}>Text</Button><Button size="sm" onClick={()=>window.open(`mailto:${selected.email || ""}`)}>Email</Button></div>
    <div className="flex gap-1 flex-wrap">{STATUSES.map(s=><Button key={s} size="sm" variant="outline" onClick={()=>updateStatus(selected, s)}>{`Mark ${LEAD_STATUS_LABELS[s]}`}</Button>)}</div>
    <div className="flex gap-1"><Button size="sm" onClick={createFollowUp}>Create follow-up</Button></div>
    <div className="grid grid-cols-3 gap-2"><Input type="date" value={jobForm.scheduled_date} onChange={e=>setJobForm({...jobForm,scheduled_date:e.target.value})}/><Input type="number" placeholder="Amount" value={jobForm.amount} onChange={e=>setJobForm({...jobForm,amount:e.target.value})}/><Select value={jobForm.status} onValueChange={v=>setJobForm({...jobForm,status:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["quoted","scheduled","in_progress","completed","cancelled"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div><Button onClick={convertToJob}>Convert to job</Button>
  </div>}</SheetContent></Sheet></div>;
};
