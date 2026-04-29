import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createActivity, LEAD_STATUS_LABELS, STATUS_BADGE_CLASS, JOB_STATUS_LABELS } from "@/lib/crm";

const LEAD_STATUSES = ["new", "contacted", "qualified", "quoted", "won", "lost"] as const;
const JOB_STATUSES = ["quoted", "scheduled", "in_progress", "completed", "cancelled"] as const;

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  service: string | null;
  urgency: string | null;
  source: string;
  landing_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gclid: string | null;
  fbclid: string | null;
  notes: string | null;
  status: string;
  address: string | null;
  created_at?: string;
};

const emptyJobForm = { scheduled_date: "", amount: "", status: "quoted" };

export const CRMLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [jobForm, setJobForm] = useState(emptyJobForm);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data as Lead[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const selectLead = (lead: Lead) => {
    setSelected(lead);
    setNoteDraft(lead.notes || "");
    setJobForm(emptyJobForm);
  };

  const updateStatus = async (lead: Lead, status: string) => {
    if (lead.status === status) return;
    const { error } = await supabase.from("leads").update({ status: status as any }).eq("id", lead.id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Lead status updated", { leadId: lead.id, details: `${lead.status} -> ${status}` });
    const updated = { ...lead, status };
    setSelected(updated);
    setLeads((current) => current.map((item) => (item.id === lead.id ? updated : item)));
    toast({ title: `Lead marked ${LEAD_STATUS_LABELS[status] || status}` });
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase.from("leads").update({ notes: noteDraft }).eq("id", selected.id);
    if (error) {
      toast({ title: "Notes update failed", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Lead notes updated", { leadId: selected.id, details: noteDraft.slice(0, 120) || "Notes cleared" });
    const updated = { ...selected, notes: noteDraft };
    setSelected(updated);
    setLeads((current) => current.map((item) => (item.id === selected.id ? updated : item)));
    toast({ title: "Lead notes saved" });
  };

  const createFollowUp = async () => {
    if (!selected) return;
    const due = new Date();
    due.setDate(due.getDate() + 1);
    const { error } = await supabase.from("follow_ups").insert({
      lead_id: selected.id,
      note: `Follow up with ${selected.name}`,
      due_date: due.toISOString(),
    });
    if (error) {
      toast({ title: "Follow-up failed", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Follow-up created", { leadId: selected.id, details: "From lead drawer" });
    toast({ title: "Follow-up created for tomorrow" });
  };

  const convertToJob = async () => {
    if (!selected) return;
    const title = `HVAC Service - ${selected.name}`;
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        lead_id: selected.id,
        title,
        address: selected.address,
        description: selected.notes,
        notes: selected.notes,
        scheduled_date: jobForm.scheduled_date || null,
        amount: jobForm.amount ? Number(jobForm.amount) : 0,
        status: jobForm.status as any,
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Convert failed", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Job created from lead", { leadId: selected.id, jobId: data.id, details: title });
    toast({ title: "Lead converted to job" });
    setJobForm(emptyJobForm);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((lead) => {
      if (filterStatus !== "all" && lead.status !== filterStatus) return false;
      if (!q) return true;
      return [lead.name, lead.phone, lead.email, lead.city, lead.service, lead.urgency, lead.source]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, search, filterStatus]);

  const openExternal = (href: string, fallbackMessage: string) => {
    if (!href.endsWith(":")) window.location.href = href;
    else toast({ title: fallbackMessage, variant: "destructive" });
  };

  const fieldRows: Array<[keyof Lead, string]> = [
    ["phone", "Phone"],
    ["email", "Email"],
    ["city", "City"],
    ["service", "Service"],
    ["urgency", "Urgency"],
    ["source", "Source"],
    ["landing_url", "Landing URL"],
    ["referrer", "Referrer"],
    ["utm_source", "UTM Source"],
    ["utm_medium", "UTM Medium"],
    ["utm_campaign", "UTM Campaign"],
    ["gclid", "GCLID"],
    ["fbclid", "FBCLID"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, email, city, service" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="md:w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((status) => <SelectItem key={status} value={status}>{LEAD_STATUS_LABELS[status]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">Loading leads…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No leads found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <button key={lead.id} className="w-full rounded-lg border p-4 text-left hover:bg-secondary/40" onClick={() => selectLead(lead)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone || "No phone"} • {lead.email || "No email"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{lead.service || "General HVAC"}{lead.city ? ` • ${lead.city}` : ""}{lead.urgency ? ` • ${lead.urgency}` : ""}</p>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[lead.status] || "bg-secondary"}`}>
                  {LEAD_STATUS_LABELS[lead.status] || lead.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <SheetContent className="w-full overflow-y-auto pb-24 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selected?.name || "Lead"}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-5 space-y-5 text-sm">
              <div className="grid gap-2 rounded-lg border p-4">
                {fieldRows.map(([key, label]) => (
                  <div key={key} className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className="break-words">{selected[key] || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={() => openExternal(`tel:${selected.phone || ""}`, "No phone number on this lead")}>Call</Button>
                <Button size="sm" variant="outline" onClick={() => openExternal(`sms:${selected.phone || ""}`, "No phone number on this lead")}>Text</Button>
                <Button size="sm" variant="outline" onClick={() => openExternal(`mailto:${selected.email || ""}`, "No email on this lead")}>Email</Button>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={5} />
                <Button className="mt-2" size="sm" onClick={saveNotes}>Save notes</Button>
              </div>

              <div>
                <Label>Lead status</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEAD_STATUSES.map((status) => (
                    <Button key={status} size="sm" variant={selected.status === status ? "default" : "outline"} onClick={() => updateStatus(selected, status)}>
                      {LEAD_STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-3 font-semibold">Convert to job</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <Input type="date" value={jobForm.scheduled_date} onChange={(event) => setJobForm({ ...jobForm, scheduled_date: event.target.value })} />
                  <Input type="number" placeholder="Amount" value={jobForm.amount} onChange={(event) => setJobForm({ ...jobForm, amount: event.target.value })} />
                  <Select value={jobForm.status} onValueChange={(value) => setJobForm({ ...jobForm, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{JOB_STATUSES.map((status) => <SelectItem key={status} value={status}>{JOB_STATUS_LABELS[status]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={convertToJob}>Convert to job</Button>
                  <Button size="sm" variant="secondary" onClick={createFollowUp}>Create follow-up</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
