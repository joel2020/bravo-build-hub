import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { MapPin, Phone, Play, CheckCircle2, UserRound } from "lucide-react";
import { asCurrency, asDate, createActivity, ensureRevenueLoopForCompletedJob, JOB_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";
import type { Database } from "@/integrations/supabase/types";

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

  const updateStatus = async (job: Job, status: string): Promise<void> => {
    const patch: Database["public"]["Tables"]["jobs"]["Update"] = { status: status as Database["public"]["Enums"]["job_status"] };
    if (status === "in_progress" && !job.started_at) patch.started_at = new Date().toISOString();
    if (status === "completed" && !job.completed_at) patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from("jobs").update(patch).eq("id", job.id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }
    await createActivity("Dispatch status updated", { jobId: job.id, leadId: job.lead_id || undefined, details: `${job.status} -> ${status}` });
    if (status === "completed") {
      await ensureRevenueLoopForCompletedJob({
        id: job.id,
        lead_id: job.lead_id,
        title: job.title,
        amount: job.amount,
        customer_name: job.leads?.name || null,
        customer_phone: job.leads?.phone || null,
        customer_email: job.leads?.email || null,
        leads: job.leads ? { name: job.leads.name, phone: job.leads.phone || null, email: job.leads.email || null } : null,
      });
    }
    toast({ title: `Job marked ${JOB_STATUS_LABELS[status] || status}` });
    load();
  };

  const assignTech = async (job: Job, technicianId: string): Promise<void> => {
    const value = technicianId === "unassigned" ? null : technicianId;
    const { error } = await supabase.from("jobs").update({ technician_id: value }).eq("id", job.id);
    if (error) {
      toast({ title: "Assignment failed", description: error.message, variant: "destructive" });
      return;
    }
    const techName = technicians.find((tech) => tech.id === value)?.name || "Unassigned";
    await createActivity("Technician assigned", { jobId: job.id, leadId: job.lead_id || undefined, details: techName });
    await supabase.from("crm_notifications").insert({ type: "job_assigned", title: "Job assigned", message: `${job.title || "Job"} assigned to ${techName}`, job_id: job.id, lead_id: job.lead_id });
    toast({ title: `Assigned to ${techName}` });
    load();
  };

  const filteredJobs = useMemo(() => jobs.filter((job) => techFilter === "all" || (techFilter === "unassigned" ? !job.technician_id : job.technician_id === techFilter)), [jobs, techFilter]);
  const buckets = {
    today: filteredJobs.filter((job) => job.scheduled_date?.slice(0, 10) === dateFilter && job.status !== "completed"),
    upcoming: filteredJobs.filter((job) => (job.scheduled_date?.slice(0, 10) ?? "") > dateFilter && job.status !== "completed"),
    unscheduled: filteredJobs.filter((job) => !job.scheduled_date && job.status !== "completed"),
    completed: filteredJobs.filter((job) => job.status === "completed"),
  };

  const JobCard = ({ job }: { job: Job }) => (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-bold text-slate-950">{job.title || "Untitled job"}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">{job.leads?.name || "No customer"}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE_CLASS[job.status] || "bg-slate-100 text-slate-700"}`}>{JOB_STATUS_LABELS[job.status] || job.status}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Change Status</p>
              {["scheduled", "in_progress", "completed", "cancelled"].map(s => (
                <DropdownMenuItem key={s} onClick={() => updateStatus(job, s)} className="cursor-pointer capitalize">
                  {JOB_STATUS_LABELS[s] || s}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => updateStatus(job, "cancelled")}>
                Cancel Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> <span className="truncate">{job.address || "No address"}</span></div>
        <div className="flex items-center justify-between"><span>{asDate(job.scheduled_date)}</span><span className="font-bold text-slate-950">{asCurrency(job.amount)}</span></div>
        {job.leads?.phone && <a className="flex items-center gap-2 font-semibold text-blue-700" href={`tel:${job.leads.phone}`}><Phone className="h-3.5 w-3.5" />Call customer</a>}
      </div>
      <div className="mt-3">
        <Select value={job.technician_id || "unassigned"} onValueChange={(value) => assignTech(job, value)}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Assign tech" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {technicians.map((tech) => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" className="rounded-xl" onClick={() => updateStatus(job, "in_progress")}><Play className="mr-1 h-3.5 w-3.5" />Start</Button>
        <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(job, "completed")}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Complete</Button>
      </div>
    </div>
  );

  const Column = ({ title, items, accent }: { title: string; items: Job[]; accent: string }) => (
    <div className="min-w-[310px] flex-1 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${accent}`} /><h3 className="font-black text-slate-950">{title}</h3></div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{items.length}</span>
      </div>
      <div className="space-y-3">{items.length === 0 ? <p className="rounded-2xl border border-dashed bg-white p-4 text-sm text-slate-400">No jobs here.</p> : items.map((job) => <JobCard key={job.id} job={job} />)}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 to-blue-950 p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Live Operations</p>
            <h2 className="mt-1 text-2xl font-black">Dispatch Board</h2>
            <p className="text-sm text-slate-300">Assign technicians, start jobs, complete work, and generate review requests.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input className="bg-white text-slate-950" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
            <Select value={techFilter} onValueChange={setTechFilter}>
              <SelectTrigger className="bg-white text-slate-950 sm:w-[220px]"><UserRound className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All technicians</SelectItem><SelectItem value="unassigned">Unassigned</SelectItem>{technicians.map((tech) => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {loading ? <div className="rounded-2xl border p-6 text-sm text-slate-500">Loading dispatchâ¦</div> : (
        <div className="flex gap-4 overflow-x-auto pb-3"><Column title="Today" items={buckets.today} accent="bg-blue-500" /><Column title="Upcoming" items={buckets.upcoming} accent="bg-violet-500" /><Column title="Unscheduled" items={buckets.unscheduled} accent="bg-amber-500" /><Column title="Completed" items={buckets.completed} accent="bg-emerald-500" /></div>
      )}
    </div>
  );
};