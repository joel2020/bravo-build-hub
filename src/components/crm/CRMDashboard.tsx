import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { asCurrency, asDate, LEAD_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";
import { runInvoiceAutomation } from "@/lib/runInvoiceAutomation";

type Lead = { id: string; name: string; status: string; source: string; created_at: string };
type Job = { id: string; title: string; status: string; amount: number | null; scheduled_date: string | null; created_at: string };
type Invoice = { status: string; amount: number; due_date: string | null };
type Follow = { completed: boolean; due_date: string };
type Act = { id: string; action: string; details: string | null; created_at: string; leads?: { name: string } | null; jobs?: { title: string } | null };

export const CRMDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [followUps, setFollowUps] = useState<Follow[]>([]);
  const [activity, setActivity] = useState<Act[]>([]);

  useEffect(() => { (async () => {
    await runInvoiceAutomation();
    setLoading(true);
    const [l,j,i,f,a] = await Promise.all([
      supabase.from("leads").select("id,name,status,source,created_at").order("created_at",{ascending:false}),
      supabase.from("jobs").select("id,title,status,amount,scheduled_date,created_at").order("created_at",{ascending:false}),
      supabase.from("invoices").select("status,amount,due_date"),
      supabase.from("follow_ups").select("completed,due_date"),
      supabase.from("activity_log").select("id,action,details,created_at,leads(name),jobs(title)").order("created_at",{ascending:false}).limit(10),
    ]);
    setLeads((l.data as Lead[])||[]); setJobs((j.data as Job[])||[]); setInvoices((i.data as Invoice[])||[]); setFollowUps((f.data as Follow[])||[]); setActivity((a.data as Act[])||[]);
    setLoading(false);
  })(); },[]);

  const metrics = useMemo(() => {
    const now = new Date(); const day = new Date(now); day.setHours(0,0,0,0); const week = new Date(day); week.setDate(week.getDate()-7);
    return {
      newLeadsToday: leads.filter(l=>new Date(l.created_at)>=day).length,
      newLeadsWeek: leads.filter(l=>new Date(l.created_at)>=week).length,
      uncontacted: leads.filter(l=>l.status==="new").length,
      openJobs: jobs.filter(j=>["quoted","scheduled","in_progress"].includes(j.status)).length,
      jobsToday: jobs.filter(j=>j.scheduled_date && new Date(j.scheduled_date).toDateString()===now.toDateString()).length,
      overdueFollowUps: followUps.filter(f=>!f.completed && new Date(f.due_date)<now).length,
      quotedRevenue: jobs.filter(j=>j.status==="quoted").reduce((s,j)=>s+Number(j.amount||0),0),
      wonRevenue: jobs.filter(j=>j.status==="completed").reduce((s,j)=>s+Number(j.amount||0),0),
      overdueInvoices: invoices.filter(i=>["sent","overdue"].includes(i.status) && i.due_date && new Date(i.due_date)<now).length,
    };
  },[leads,jobs,invoices,followUps]);

  const leadSource = useMemo(()=>Object.entries(leads.reduce((acc,l)=>{acc[l.source]=(acc[l.source]||0)+1; return acc;},{} as Record<string,number>)),[leads]);
  const pipeline = useMemo(()=>Object.entries(leads.reduce((acc,l)=>{acc[l.status]=(acc[l.status]||0)+1; return acc;},{} as Record<string,number>)),[leads]);

  if (loading) return <div className="p-4 border rounded">Loading dashboard…</div>;
  return <div className="space-y-4">
    <div className="grid md:grid-cols-3 gap-3">{[
      ["New leads today",metrics.newLeadsToday],["New leads this week",metrics.newLeadsWeek],["Uncontacted leads",metrics.uncontacted],
      ["Open jobs",metrics.openJobs],["Jobs scheduled today",metrics.jobsToday],["Overdue follow-ups",metrics.overdueFollowUps],
      ["Quoted revenue",asCurrency(metrics.quotedRevenue)],["Completed/won revenue",asCurrency(metrics.wonRevenue)],["Overdue invoices",metrics.overdueInvoices]
    ].map(([k,v])=><Card key={String(k)}><CardHeader className="pb-2"><CardTitle className="text-sm">{k}</CardTitle></CardHeader><CardContent className="text-xl font-bold">{String(v)}</CardContent></Card>)}</div>
    <div className="grid md:grid-cols-3 gap-3">
      <Card><CardHeader><CardTitle className="text-sm">Recent leads</CardTitle></CardHeader><CardContent>{leads.slice(0,5).map(l=><div key={l.id} className="flex justify-between text-sm py-1"><span>{l.name}</span><Badge className={STATUS_BADGE_CLASS[l.status]}>{LEAD_STATUS_LABELS[l.status]||l.status}</Badge></div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Recent jobs</CardTitle></CardHeader><CardContent>{jobs.slice(0,5).map(j=><div key={j.id} className="text-sm py-1">{j.title} · {j.status.replace("_"," ")}</div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Recent activity</CardTitle></CardHeader><CardContent>{activity.slice(0,6).map(a=><div key={a.id} className="text-xs py-1"><b>{a.action}</b> · {a.leads?.name||a.jobs?.title||"General"} · {asDate(a.created_at)}</div>)}</CardContent></Card>
    </div>
    <div className="grid md:grid-cols-2 gap-3">
      <Card><CardHeader><CardTitle className="text-sm">Lead source breakdown</CardTitle></CardHeader><CardContent>{leadSource.map(([s,c])=><div className="text-sm" key={s}>{s}: {c}</div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Pipeline by status</CardTitle></CardHeader><CardContent>{pipeline.map(([s,c])=><div className="text-sm" key={s}>{LEAD_STATUS_LABELS[s]||s}: {c}</div>)}</CardContent></Card>
    </div>
  </div>;
};
