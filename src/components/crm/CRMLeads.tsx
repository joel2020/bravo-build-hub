import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createActivity, LEAD_STATUS_LABELS, STATUS_BADGE_CLASS, JOB_STATUS_LABELS } from "@/lib/crm";
import { Plus } from "lucide-react";

const LEAD_STATUSES = ["new", "contacted", "qualified", "quoted", "won", "lost"] as const;
const JOB_STATUSES = ["quoted", "scheduled", "in_progress", "completed", "cancelled"] as const;

const emptyCustomerJobForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  service_type: "",
  message: "",
  create_job: true,
  job_title: "",
  scheduled_date: "",
  amount: "",
  job_status: "scheduled",
  technician_id: "unassigned",
};

const emptyJobForm = { scheduled_date: "", amount: "", status: "quoted" };

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  service_type?: string | null;
  service?: string | null;
  urgency: string | null;
  source: string;
  landing_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gclid: string | null;
  fbclid: string | null;
  message?: string | null;
  notes?: string | null;
  status: string;
  address: string | null;
  created_at?: string;
};

type Technician = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
};

export const CRMLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [openCreate, setOpenCreate] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [customerJobForm, setCustomerJobForm] = useState(emptyCustomerJobForm);

  const load = async () => {
    setLoading(true);
    const [{ data: leadData, error: leadError }, { data: techData, error: techError }] = await Promise.all([
      supabase
        .from("leads" as any)
        .select("id,name,phone,email,city,service_type,urgency,source,landing_url,referrer,utm_source,utm_medium,utm_campaign,gclid,fbclid,message,status,address,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("technicians" as any)
        .select("id,name,email,phone,active")
        .eq("active", true)
        .order("name", { ascending: true }),
    ]);

    if (leadError) {
      toast({ title: "Could not load customers", description: leadError.message, variant: "destructive" });
    } else {
      setLeads((leadData as Lead[]) || []);
    }

    if (techError) {
      toast({ title: "Could not load technicians", description: techError.message, variant: "destructive" });
    } else {
      setTechnicians((techData as Technician[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetCustomerJobForm = () => setCustomerJobForm(emptyCustomerJobForm);

  const createCustomerAndMaybeJob = async () => {
    const form = customerJobForm;
    const name = form.name.trim();

    if (!name) {
      toast({ title: "Customer name required", variant: "destructive" });
      return;
    }

    setSavingCreate(true);

    const { data: lead, error: leadError } = await supabase
      .from("leads" as any)
      .insert({
        name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        city: form.city || null,
        service_type: form.service_type || null,
        message: form.message || null,
        status: "new",
        source: "other",
        metadata: { created_from: "manual_customer_job_modal" },
      })
      .select("id")
      .single();

    if (leadError || !lead?.id) {
      setSavingCreate(false);
      toast({ title: "Failed to add customer", description: leadError?.message, variant: "destructive" });
      return;
    }

    await createActivity("Customer manually added", { leadId: lead.id, details: name });

    if (form.create_job) {
      const title = form.job_title.trim() || `${form.service_type || "HVAC Service"} - ${name}`;
      const amount = form.amount ? Number(form.amount) : 0;
      const scheduled = form.scheduled_date || null;
      const technicianId = form.technician_id === "unassigned" ? null : form.technician_id;
      const assignedTech = technicianId ? technicians.find((tech) => tech.id === technicianId) : null;

      const { data: job, error: jobError } = await supabase
        .from("jobs" as any)
        .insert({
          lead_id: lead.id,
          title,
          description: form.message || null,
          notes: form.message || null,
          status: form.job_status,
          customer_name: name,
          customer_phone: form.phone || null,
          customer_email: form.email || null,
          address: form.address || null,
          scheduled_date: scheduled,
          scheduled_at: scheduled,
          amount,
          total_amount: amount,
          technician_id: technicianId,
          dispatch_notes: form.message || null,
        })
        .select("id")
        .single();

      if (jobError) {
        setSavingCreate(false);
        toast({ title: "Customer added, but job creation failed", description: jobError.message, variant: "destructive" });
        await load();
        return;
      }

      await createActivity("Job created from manual customer entry", { leadId: lead.id, jobId: job?.id, details: assignedTech ? `${title} assigned to ${assignedTech.name}` : title });

      if (technicianId && job?.id) {
        await supabase.from("crm_notifications" as any).insert({
          type: "job_assigned",
          title: "Job assigned",
          message: `${title} assigned to ${assignedTech?.name || "technician"}`,
          lead_id: lead.id,
          job_id: job.id,
        });
      }

      toast({ title: assignedTech ? `Customer + job assigned to ${assignedTech.name}` : "Customer + job created" });
    } else {
      toast({ title: "Customer added" });
    }

    setSavingCreate(false);
    setOpenCreate(false);
    resetCustomerJobForm();
    await load();
  };

  const selectLead = (lead: Lead) => {
    setSelected(lead);
    setNoteDraft(lead.message || lead.notes || "");
    setJobForm(emptyJobForm);
  };

  const updateStatus = async (lead: Lead, status: string) => {
    if (lead.status === status) return;
    const { error } = await supabase.from("leads" as any).update({ status }).eq("id", lead.id);
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
    const { error } = await supabase.from("leads" as any).update({ message: noteDraft }).eq("id", selected.id);
    if (error) {
      toast({ title: "Notes update failed", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Lead notes updated", { leadId: selected.id, details: noteDraft.slice(0, 120) || "Notes cleared" });
    const updated = { ...selected, message: noteDraft };
    setSelected(updated);
    setLeads((current) => current.map((item) => (item.id === selected.id ? updated : item)));
    toast({ title: "Lead notes saved" });
  };

  const createFollowUp = async () => {
    if (!selected) return;
    const due = new Date();
    due.setDate(due.getDate() + 1);
    const { error } = await supabase.from("follow_ups" as any).insert({
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
    const amount = jobForm.amount ? Number(jobForm.amount) : 0;
    const { data, error } = await supabase
      .from("jobs" as any)
      .insert({
        lead_id: selected.id,
        title,
        address: selected.address,
        description: selected.message || selected.notes || null,
        notes: selected.message || selected.notes || null,
        customer_name: selected.name,
        customer_phone: selected.phone,
        customer_email: selected.email,
        scheduled_date: jobForm.scheduled_date || null,
        scheduled_at: jobForm.scheduled_date || null,
        amount,
        total_amount: amount,
        status: jobForm.status,
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
      return [lead.name, lead.phone, lead.email, lead.city, lead.service_type, lead.service, lead.urgency, lead.source]
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
    ["service_type", "Service"],
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
      <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">Customers</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Customer + Job Intake</h2>
            <p className="text-sm text-slate-600">Add walk-ins, phone calls, referrals, schedule jobs, and assign technicians in one flow.</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="h-12 rounded-2xl font-black">
                <Plus className="mr-2 h-4 w-4" /> Add Customer + Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Customer + Job</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><Label>Customer name *</Label><Input value={customerJobForm.name} onChange={(e) => setCustomerJobForm({ ...customerJobForm, name: e.target.value })} placeholder="Jane Smith" /></div>
                  <div><Label>Phone</Label><Input value={customerJobForm.phone} onChange={(e) => setCustomerJobForm({ ...customerJobForm, phone: e.target.value })} placeholder="(914) 555-1234" /></div>
                  <div><Label>Email</Label><Input value={customerJobForm.email} onChange={(e) => setCustomerJobForm({ ...customerJobForm, email: e.target.value })} placeholder="customer@email.com" /></div>
                  <div><Label>City</Label><Input value={customerJobForm.city} onChange={(e) => setCustomerJobForm({ ...customerJobForm, city: e.target.value })} placeholder="Yonkers" /></div>
                </div>
                <div><Label>Address</Label><Input value={customerJobForm.address} onChange={(e) => setCustomerJobForm({ ...customerJobForm, address: e.target.value })} placeholder="123 Main St" /></div>
                <div><Label>Service needed</Label><Input value={customerJobForm.service_type} onChange={(e) => setCustomerJobForm({ ...customerJobForm, service_type: e.target.value })} placeholder="AC repair, boiler install, no heat call..." /></div>
                <div><Label>Customer / dispatch notes</Label><Textarea value={customerJobForm.message} onChange={(e) => setCustomerJobForm({ ...customerJobForm, message: e.target.value })} placeholder="What did the customer say? Access notes? Urgency?" rows={3} /></div>

                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">Create job now</p>
                      <p className="text-xs text-slate-500">Turn this customer into a scheduled/quoted job immediately.</p>
                    </div>
                    <Button type="button" variant={customerJobForm.create_job ? "default" : "outline"} onClick={() => setCustomerJobForm({ ...customerJobForm, create_job: !customerJobForm.create_job })}>
                      {customerJobForm.create_job ? "On" : "Off"}
                    </Button>
                  </div>

                  {customerJobForm.create_job && (
                    <div className="grid gap-3">
                      <div><Label>Job title</Label><Input value={customerJobForm.job_title} onChange={(e) => setCustomerJobForm({ ...customerJobForm, job_title: e.target.value })} placeholder="Leave blank to auto-name from service + customer" /></div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div><Label>Scheduled date</Label><Input type="date" value={customerJobForm.scheduled_date} onChange={(e) => setCustomerJobForm({ ...customerJobForm, scheduled_date: e.target.value })} /></div>
                        <div><Label>Job amount</Label><Input type="number" value={customerJobForm.amount} onChange={(e) => setCustomerJobForm({ ...customerJobForm, amount: e.target.value })} placeholder="0" /></div>
                        <div>
                          <Label>Status</Label>
                          <Select value={customerJobForm.job_status} onValueChange={(value) => setCustomerJobForm({ ...customerJobForm, job_status: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{JOB_STATUSES.map((status) => <SelectItem key={status} value={status}>{JOB_STATUS_LABELS[status]}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Assign technician</Label>
                          <Select value={customerJobForm.technician_id} onValueChange={(value) => setCustomerJobForm({ ...customerJobForm, technician_id: value })}>
                            <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {technicians.map((tech) => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button className="h-12 rounded-2xl font-black" onClick={createCustomerAndMaybeJob} disabled={savingCreate}>
                  {savingCreate ? "Saving…" : customerJobForm.create_job ? "Save Customer + Job" : "Save Customer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">Loading customers…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No customers found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <button key={lead.id} className="w-full rounded-lg border p-4 text-left hover:bg-secondary/40" onClick={() => selectLead(lead)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone || "No phone"} • {lead.email || "No email"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{lead.service_type || lead.service || "General HVAC"}{lead.city ? ` • ${lead.city}` : ""}{lead.urgency ? ` • ${lead.urgency}` : ""}</p>
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
            <SheetTitle>{selected?.name || "Customer"}</SheetTitle>
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
                <Button size="sm" variant="outline" onClick={() => openExternal(`tel:${selected.phone || ""}`, "No phone number on this customer")}>Call</Button>
                <Button size="sm" variant="outline" onClick={() => openExternal(`sms:${selected.phone || ""}`, "No phone number on this customer")}>Text</Button>
                <Button size="sm" variant="outline" onClick={() => openExternal(`mailto:${selected.email || ""}`, "No email on this customer")}>Email</Button>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={5} />
                <Button className="mt-2" size="sm" onClick={saveNotes}>Save notes</Button>
              </div>

              <div>
                <Label>Customer status</Label>
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
