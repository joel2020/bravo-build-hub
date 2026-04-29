import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { asCurrency, asDate, createActivity, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";

const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

type Technician = { id: string; name: string; active: boolean };
type Job = {
  id: string;
  lead_id: string | null;
  title: string | null;
  status: string;
  scheduled_date: string | null;
  amount: number | null;
  address: string | null;
  technician_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  leads?: { name: string | null; phone?: string | null; email?: string | null } | null;
  technicians?: { name: string | null } | null;
};

export const CRMDispatch = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [techFilter, setTechFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: jobData, error: jobError }, { data: techData, error: techError }] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, lead_id, title, status, scheduled_date, amount, address, technician_id, started_at, completed_at, leads(name, phone, email), technicians(name)")
        .order("scheduled_date", { ascending: true }),
      supabase.from("technicians").select("id, name, active").eq("active", true).order("name"),
    ]);

    if (jobError) toast({ title: "Failed to load dispatch jobs", description: jobError.message, variant: "destructive" });
    else setJobs((jobData as Job[]) || []);

    if (techError) toast({ title: "Failed to load technicians", description: techError.message, variant: "destructive" });
    else setTechnicians((techData as Technician[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (job: Job, status: string) => {
    const patch: Record<string, string | null> = { status };
    if (status === "in_progress" && !job.started_at) patch.started_at = new Date().toISOString();
    if (status === "completed" && !job.completed_at) patch.completed_at = new Date().toISOString();

    const { error } = await supabase.from("jobs").update(patch).eq("id", job.id);
    if (error) return toast({ title: "Status update failed", description: error.message, variant: "destructive" });

    await createActivity("Dispatch status updated", { jobId: job.id, leadId: job.lead_id || undefined, details: `${job.status} -> ${status}` });

    if (status === "completed") {
      await supabase.from("review_requests").insert({
        job_id: job.id,
        lead_id: job.lead_id,
        customer_name: job.leads?.name || null,
        customer_phone: job.leads?.phone || null,
        customer_email: job.leads?.email || null,
        status: "draft",
      });
    }

    toast({ title: `Job marked ${JOB_STATUS_LABELS[status] || status}` });
    load();
  };

  const assignTech = async (job: Job, technicianId: string) => {
    const value = technicianId === "unassigned" ? null : technicianId;
    const { error } = await supabase.from("jobs").update({ technician_id: value }).eq("id", job.id);
    if (error) return toast({ title: "Assignment failed", description: error.message, variant: "destructive" });
    const techName = technicians.find((tech) => tech.id === value)?.name || "Unassigned";
    await createActivity("Technician assigned", { jobId: job.id, leadId: job.lead_id || undefined, details: techName });
    await supabase.from("crm_notifications").insert({
      type: "job_assigned",
      title: "Job assigned",
      message: `${job.title || "Job"} assigned to ${techName}`,
      job_id: job.id,
      lead_id: job.lead_id,
    });
    toast({ title: `Assigned to ${techName}` });
    load();
  };

  const filteredJobs = useMemo(() => jobs.filter((job) => techFilter === "all" || (techFilter === "unassigned" ? !job.technician_id : job.technician_id === techFilter)), [jobs, techFilter]);

  const buckets = {
    today: filteredJobs.filter((job) => job.scheduled_date?.slice(0, 10) === dateFilter && job.status !== "completed"),
    upcoming: filteredJobs.filter((job) => job.scheduled_date?.slice(0, 10) > dateFilter && job.status !== "completed"),
    unscheduled: filteredJobs.filter((job) => !job.scheduled_date && job.status !== "completed"),
    completed: filteredJobs.filter((job) => job.status === "completed"),
  };

  const JobCard = ({ job }: { job: Job }) => (
    <div className="rounded-lg border bg-background p-3 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{job.title || "Untitled job"}</div>
          <div className="text-xs text-muted-foreground">{job.leads?.name || "No customer"} • {job.address || "No address"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{asDate(job.scheduled_date)} • {asCurrency(job.amount)}</div>
        </div>
        <span className={`rounded px-2 py-1 text-xs ${STATUS_BADGE_CLASS[job.status] || "bg-secondary"}`}>{JOB_STATUS_LABELS[job.status] || job.status}</span>
      </div>
      <div className="mt-3">
        <Select value={job.technician_id || "unassigned"} onValueChange={(value) => assignTech(job, value)}>
          <SelectTrigger><SelectValue placeholder="Assign tech" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {technicians.map((tech) => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {STATUSES.map((status) => <Button key={status} size="sm" variant="outline" onClick={() => updateStatus(job, status)}>{JOB_STATUS_LABELS[status] || status}</Button>)}
      </div>
    </div>
  );

  const Column = ({ title, items }: { title: string; items: Job[] }) => (
    <div className="min-w-[280px] flex-1 rounded-xl border bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-background px-2 py-1 text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No jobs.</p> : items.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Dispatch Board</h2>
          <p className="text-sm text-muted-foreground">Assign technicians, start jobs, complete work, and generate review requests.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="sm:w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All technicians</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {technicians.map((tech) => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <div className="rounded-lg border p-6 text-sm text-muted-foreground">Loading dispatch…</div> : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          <Column title="Today" items={buckets.today} />
          <Column title="Upcoming" items={buckets.upcoming} />
          <Column title="Unscheduled" items={buckets.unscheduled} />
          <Column title="Completed" items={buckets.completed} />
        </div>
      )}
    </div>
  );
};