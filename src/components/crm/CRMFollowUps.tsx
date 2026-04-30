import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, CalendarClock, Check, Clock3, MessageSquare, Phone, Plus, RefreshCcw, Wrench } from "lucide-react";
import { asDateTime, createActivity } from "@/lib/crm";
import { ensureFollowUp } from "@/lib/followUps";
import { getSmsTemplate } from "@/lib/smsTemplates";

type LeadLite = {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
  address?: string | null;
  service_type?: string | null;
  created_at?: string | null;
};

type JobLite = {
  id: string;
  lead_id: string | null;
  title: string | null;
  status?: string | null;
  address?: string | null;
};

type FollowUp = {
  id: string;
  lead_id: string | null;
  job_id: string | null;
  due_date: string;
  note: string;
  completed: boolean;
  created_at?: string | null;
  leads?: LeadLite | null;
  jobs?: JobLite | null;
};

const EMPTY_FORM = { lead_id: "", job_id: "", due_date: "", note: "" };

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const safePhoneHref = (phone?: string | null, type: "tel" | "sms" = "tel", body?: string) => {
  if (!phone) return "#";
  const cleanPhone = phone.replace(/[^+\d]/g, "");
  if (type === "sms" && body) return `sms:${cleanPhone}?&body=${encodeURIComponent(body)}`;
  return `${type}:${cleanPhone}`;
};

export const CRMFollowUps = () => {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<LeadLite[]>([]);
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    const [{ data: followData, error: followError }, { data: leadData, error: leadError }, { data: jobData, error: jobError }] = await Promise.all([
      supabase
        .from("follow_ups" as any)
        .select("id,lead_id,job_id,due_date,note,completed,created_at,leads(id,name,phone,email,address,service_type,created_at),jobs(id,lead_id,title,status,address)")
        .order("due_date", { ascending: true }),
      supabase.from("leads" as any).select("id,name,phone,email,address,service_type,created_at").order("created_at", { ascending: false }),
      supabase.from("jobs" as any).select("id,lead_id,title,status,address").order("created_at", { ascending: false }),
    ]);

    if (followError) toast({ title: "Failed to load follow-ups", description: followError.message, variant: "destructive" });
    if (leadError) toast({ title: "Failed to load customers", description: leadError.message, variant: "destructive" });
    if (jobError) toast({ title: "Failed to load jobs", description: jobError.message, variant: "destructive" });

    setItems((followData as FollowUp[]) || []);
    setLeads((leadData as LeadLite[]) || []);
    setJobs((jobData as JobLite[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const activeItems = useMemo(() => items.filter((item) => !item.completed), [items]);

  const grouped = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const weekEnd = addDays(today, 7);

    const overdue = activeItems.filter((item) => new Date(item.due_date) < today);
    const todayItems = activeItems.filter((item) => {
      const due = new Date(item.due_date);
      return due >= today && due < tomorrow;
    });
    const thisWeek = activeItems.filter((item) => {
      const due = new Date(item.due_date);
      return due >= tomorrow && due <= weekEnd;
    });

    const activeLeadIds = new Set(activeItems.map((item) => item.lead_id).filter(Boolean));
    const leadsWithoutFollowUp = leads.filter((lead) => !activeLeadIds.has(lead.id));
    const completed = items.filter((item) => item.completed);

    return { overdue, today: todayItems, thisWeek, noFollowUp: leadsWithoutFollowUp, completed };
  }, [activeItems, items, leads]);

  const save = async () => {
    if (!form.lead_id && !form.job_id) {
      toast({ title: "Pick a customer or job", variant: "destructive" });
      return;
    }
    if (!form.due_date || !form.note.trim()) {
      toast({ title: "Due date and note required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const selectedJob = jobs.find((job) => job.id === form.job_id);
    const leadId = form.lead_id || selectedJob?.lead_id || null;
    const { error } = await supabase.from("follow_ups" as any).insert({
      lead_id: leadId,
      job_id: form.job_id || null,
      due_date: new Date(form.due_date).toISOString(),
      note: form.note.trim(),
      completed: false,
    });
    setSaving(false);

    if (error) {
      toast({ title: "Follow-up create failed", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Follow-up created", { leadId, jobId: form.job_id || null, details: form.note.trim() });
    toast({ title: "Follow-up created" });
    setOpen(false);
    setForm(EMPTY_FORM);
    await load();
  };

  const markComplete = async (followUp: FollowUp) => {
    const { error } = await supabase.from("follow_ups" as any).update({ completed: true }).eq("id", followUp.id);
    if (error) {
      toast({ title: "Could not complete follow-up", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Follow-up completed", { leadId: followUp.lead_id, jobId: followUp.job_id, details: followUp.note });
    if (!followUp.job_id) {
      const due = new Date();
      due.setDate(due.getDate() + 2);
      await ensureFollowUp({ leadId: followUp.lead_id, dueAt: due, reason: `2-day recycle: ${followUp.note}`, windowHours: 48 });
    }
    toast({ title: "Follow-up completed" });
    await load();
  };

  const reopenFollowUp = async (followUp: FollowUp) => {
    const { error } = await supabase.from("follow_ups" as any).update({ completed: false }).eq("id", followUp.id);
    if (error) {
      toast({ title: "Could not reopen follow-up", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Follow-up reopened", { leadId: followUp.lead_id, jobId: followUp.job_id, details: followUp.note });
    await load();
  };

  const snooze = async (followUp: FollowUp, days: number) => {
    const due = addDays(new Date(), days);
    const { error } = await supabase.from("follow_ups" as any).update({ due_date: due.toISOString() }).eq("id", followUp.id);
    if (error) {
      toast({ title: "Could not snooze follow-up", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Follow-up snoozed", { leadId: followUp.lead_id, jobId: followUp.job_id, details: `${days} day(s): ${followUp.note}` });
    toast({ title: days === 1 ? "Snoozed 1 day" : `Snoozed ${days} days` });
    await load();
  };

  const createJobFromFollowUp = async (followUp: FollowUp) => {
    const leadId = followUp.lead_id || followUp.leads?.id;
    if (!leadId) {
      toast({ title: "No customer connected", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("jobs" as any)
      .insert({
        lead_id: leadId,
        title: `${followUp.leads?.service_type || "HVAC service"} - ${followUp.leads?.name || "Customer"}`,
        description: followUp.note,
        status: "quoted",
        address: followUp.leads?.address || null,
        customer_name: followUp.leads?.name || null,
        customer_phone: followUp.leads?.phone || null,
        customer_email: followUp.leads?.email || null,
        notes: followUp.note,
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Could not create job", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("follow_ups" as any).update({ job_id: data?.id || null }).eq("id", followUp.id);
    await createActivity("Job created from follow-up", { leadId, jobId: data?.id || null, details: followUp.note });
    toast({ title: "Job created from follow-up" });
    await load();
  };

  const createJobFromLead = async (lead: LeadLite) => {
    const existingJob = jobs.find((job) => job.lead_id === lead.id && job.status !== "completed" && job.status !== "cancelled");
    if (existingJob) {
      toast({ title: "Customer already has an open job", description: existingJob.title || "Open job" });
      return;
    }

    const { data, error } = await supabase
      .from("jobs" as any)
      .insert({
        lead_id: lead.id,
        title: `${lead.service_type || "Service call"} - ${lead.name}`,
        status: "quoted",
        address: lead.address || null,
        customer_name: lead.name,
        customer_phone: lead.phone || null,
        customer_email: lead.email || null,
        notes: "Created from Follow-Up Command Center.",
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Could not create job", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Job created from no-follow-up customer", { leadId: lead.id, jobId: data?.id || null, details: lead.name });
    toast({ title: "Job created" });
    await load();
  };

  const createFollowUpForLead = async (lead: LeadLite, days = 1) => {
    const due = addDays(new Date(), days);
    const { error } = await supabase.from("follow_ups" as any).insert({
      lead_id: lead.id,
      due_date: due.toISOString(),
      note: `Follow up with ${lead.name}`,
      completed: false,
    });

    if (error) {
      toast({ title: "Could not create follow-up", description: error.message, variant: "destructive" });
      return;
    }

    await createActivity("Follow-up created", { leadId: lead.id, details: `Follow up with ${lead.name}` });
    toast({ title: "Follow-up set for tomorrow" });
    await load();
  };

  const renderFollowUpCard = (followUp: FollowUp, urgent = false) => {
    const customer = followUp.leads;
    const phone = customer?.phone;
    const textBody = `Hi ${customer?.name || "there"}, following up from Bravo Mechanical.`;
    const quickText = getSmsTemplate(followUp.job_id ? "quote" : "general", customer?.name);
    const paymentType = followUp.note.includes("invoice_7") ? "day_7" : followUp.note.includes("invoice_3") ? "day_3" : "day_1";
    const payText = getSmsTemplate(paymentType as any, customer?.name, "https://pay.bravomechanical.com");

    return (
      <div key={followUp.id} className={`rounded-3xl border bg-white p-4 shadow-sm ${urgent ? "border-red-200 bg-red-50/70" : ""}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-black">{customer?.name || "Unknown customer"}</p>
              {urgent && <Badge className="bg-red-100 text-red-800">Urgent</Badge>}
              {followUp.jobs?.title && <Badge variant="outline">{followUp.jobs.title}</Badge>}
            </div>
            <p className="text-sm text-slate-600">{phone || "No phone"} • Due {asDateTime(followUp.due_date)}</p>
            {customer?.address && <p className="text-xs text-slate-500">{customer.address}</p>}
            <p className="text-sm leading-6">{followUp.note || "No note"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
            <Button asChild size="sm" variant="outline" disabled={!phone}>
              <a href={safePhoneHref(phone)}><Phone className="mr-1 h-4 w-4" />Call</a>
            </Button>
            <Button asChild size="sm" variant="outline" disabled={!phone}>
              <a href={safePhoneHref(phone, "sms", textBody)}><MessageSquare className="mr-1 h-4 w-4" />Text</a>
            </Button>
            <Button asChild size="sm" variant="outline" disabled={!phone}>
              <a href={safePhoneHref(phone, "sms", quickText)}>Quick Text</a>
            </Button>
            {followUp.note.toLowerCase().includes("invoice") && <Button asChild size="sm" variant="outline" disabled={!phone}><a href={safePhoneHref(phone, "sms", payText)}>Send Payment Text</a></Button>}
            {followUp.completed ? (
              <Button size="sm" variant="outline" onClick={() => reopenFollowUp(followUp)}>Reopen</Button>
            ) : (
              <Button size="sm" onClick={() => markComplete(followUp)}><Check className="mr-1 h-4 w-4" />Done</Button>
            )}
            {!followUp.job_id && <Button size="sm" variant="secondary" onClick={() => createJobFromFollowUp(followUp)}><Wrench className="mr-1 h-4 w-4" />Convert</Button>}
          </div>
        </div>

        {!followUp.completed && (
          <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
            <Button size="sm" variant="ghost" onClick={() => snooze(followUp, 1)}><RefreshCcw className="mr-1 h-4 w-4" />1 day</Button>
            <Button size="sm" variant="ghost" onClick={() => snooze(followUp, 3)}>3 days</Button>
            <Button size="sm" variant="ghost" onClick={() => snooze(followUp, 7)}>1 week</Button>
          </div>
        )}
      </div>
    );
  };

  const renderLeadCard = (lead: LeadLite) => {
    const textBody = `Hi ${lead.name}, following up from Bravo Mechanical.`;
    return (
      <div key={lead.id} className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-base font-black">{lead.name}</p>
            <p className="text-sm text-slate-600">{lead.phone || "No phone"} • No active follow-up</p>
            {lead.address && <p className="text-xs text-slate-500">{lead.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button asChild size="sm" variant="outline" disabled={!lead.phone}>
              <a href={safePhoneHref(lead.phone)}><Phone className="mr-1 h-4 w-4" />Call</a>
            </Button>
            <Button asChild size="sm" variant="outline" disabled={!lead.phone}>
              <a href={safePhoneHref(lead.phone, "sms", textBody)}><MessageSquare className="mr-1 h-4 w-4" />Text</a>
            </Button>
            <Button size="sm" onClick={() => createFollowUpForLead(lead)}>Set follow-up</Button>
            <Button size="sm" variant="secondary" onClick={() => createJobFromLead(lead)}><Wrench className="mr-1 h-4 w-4" />Convert</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, subtitle: string, icon: JSX.Element, count: number, children: React.ReactNode, tone: "default" | "danger" = "default") => (
    <Card className={tone === "danger" ? "border-red-200" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-2">{icon}{title}</span>
          <Badge variant={tone === "danger" ? "destructive" : "secondary"}>{count}</Badge>
        </CardTitle>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );

  const attentionCount = grouped.overdue.length + grouped.today.length + grouped.noFollowUp.length;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Follow-Up Command Center</p>
            <h2 className="text-2xl font-black tracking-tight">Today’s customer chase list</h2>
            <p className="text-sm text-slate-600">Call, text, complete, snooze, or turn follow-ups into jobs from one screen.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" />Add Follow-Up</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>New Follow-up</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <Label>Customer</Label>
                  <Select value={form.lead_id} onValueChange={(value) => setForm({ ...form, lead_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{leads.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Job optional</Label>
                  <Select value={form.job_id} onValueChange={(value) => setForm({ ...form, job_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Attach to job" /></SelectTrigger>
                    <SelectContent>{jobs.map((job) => <SelectItem key={job.id} value={job.id}>{job.title || "Untitled job"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Due</Label><Input type="datetime-local" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></div>
                <div><Label>Note</Label><Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Example: Call back about no heat quote" /></div>
                <Button onClick={save} disabled={saving}>{saving ? "Creating…" : "Create Follow-Up"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-3"><p className="text-xs text-slate-500">Overdue</p><p className="text-2xl font-black text-red-700">{grouped.overdue.length}</p></div>
          <div className="rounded-2xl border bg-white p-3"><p className="text-xs text-slate-500">Today</p><p className="text-2xl font-black">{grouped.today.length}</p></div>
          <div className="rounded-2xl border bg-white p-3"><p className="text-xs text-slate-500">This week</p><p className="text-2xl font-black">{grouped.thisWeek.length}</p></div>
          <div className="rounded-2xl border bg-white p-3"><p className="text-xs text-slate-500">No follow-up</p><p className="text-2xl font-black">{grouped.noFollowUp.length}</p></div>
        </div>

        {grouped.overdue.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div><b>You are falling behind.</b> {grouped.overdue.length} follow-up{grouped.overdue.length === 1 ? " is" : "s are"} overdue. Clear these first.</div>
          </div>
        )}

        {attentionCount === 0 && (
          <div className="mt-4 rounded-2xl border bg-green-50 p-3 text-sm text-green-900">All caught up. No urgent customer follow-ups right now.</div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {renderSection("Overdue", "Customers who should have been contacted already.", <AlertTriangle className="h-4 w-4 text-red-600" />, grouped.overdue.length, grouped.overdue.length ? grouped.overdue.map((item) => renderFollowUpCard(item, true)) : <p className="text-sm text-slate-500">No overdue follow-ups.</p>, "danger")}
        {renderSection("Today", "The main list to work from today.", <Clock3 className="h-4 w-4" />, grouped.today.length, grouped.today.length ? grouped.today.map((item) => renderFollowUpCard(item)) : <p className="text-sm text-slate-500">No follow-ups due today.</p>)}
        {renderSection("This Week", "Upcoming follow-ups that are not late yet.", <CalendarClock className="h-4 w-4" />, grouped.thisWeek.length, grouped.thisWeek.length ? grouped.thisWeek.map((item) => renderFollowUpCard(item)) : <p className="text-sm text-slate-500">No upcoming follow-ups this week.</p>)}
        {renderSection("No Follow-Up", "Customers in the CRM with no active reminder. These are revenue leaks.", <RefreshCcw className="h-4 w-4" />, grouped.noFollowUp.length, grouped.noFollowUp.length ? grouped.noFollowUp.map(renderLeadCard) : <p className="text-sm text-slate-500">Every customer has an active follow-up.</p>)}
      </div>

      {grouped.completed.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Completed ({grouped.completed.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">{grouped.completed.slice(0, 10).map((item) => renderFollowUpCard(item))}</CardContent>
        </Card>
      )}
    </div>
  );
};
