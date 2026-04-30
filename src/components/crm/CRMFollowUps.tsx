import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { createActivity } from "@/lib/crm";

type FollowUp = { id:string; lead_id:string|null; job_id:string|null; due_date:string; note:string; completed:boolean; leads?:{name:string;phone:string|null;email:string|null;address:string|null;service_type:string|null}|null; jobs?:{title:string|null;status:string|null;address:string|null}|null };

export const CRMFollowUps = ()=>{
  const [items,setItems]=useState<FollowUp[]>([]);
  const load=async()=>{ const {data,error}=await supabase.from("follow_ups" as any).select("id,lead_id,job_id,due_date,note,completed,leads(name,phone,email,address,service_type),jobs(title,status,address)").order("due_date",{ascending:true}); if(!error) setItems((data as any)||[]); };
  useEffect(()=>{load();},[]);
  const now = new Date();
  const groups = useMemo(()=>({
    overdue: items.filter(i=>!i.completed&&new Date(i.due_date)<now&&new Date(i.due_date).toDateString()!==now.toDateString()),
    today: items.filter(i=>!i.completed&&new Date(i.due_date).toDateString()===now.toDateString()),
    week: items.filter(i=>!i.completed&&new Date(i.due_date)>now&&new Date(i.due_date)<=new Date(Date.now()+7*86400000)),
    upcoming: items.filter(i=>!i.completed&&new Date(i.due_date)>new Date(Date.now()+7*86400000)),
    completed: items.filter(i=>i.completed),
  }),[items]);

  const patch = async (f:FollowUp, payload:any, action:string)=>{ await supabase.from("follow_ups" as any).update(payload).eq("id",f.id); await createActivity(action,{leadId:f.lead_id||undefined,jobId:f.job_id||undefined,details:f.note}); load(); };
  const snooze = (f:FollowUp,d:number)=> patch(f,{due_date:new Date(Date.now()+d*86400000).toISOString()},`Follow-up snoozed ${d} day(s)`);
  const createJob = async (f:FollowUp)=>{ if(f.job_id) return; const title = `${f.leads?.service_type||"HVAC service"} - ${f.leads?.name||"Customer"}`; const {data}=await supabase.from("jobs" as any).insert({lead_id:f.lead_id,title,status:"quoted",address:f.leads?.address||null,customer_name:f.leads?.name||null,customer_phone:f.leads?.phone||null,customer_email:f.leads?.email||null,notes:f.note||null}).select("id").single(); await patch(f,{job_id:data?.id||null},"Job created from follow-up"); };

  const Card = (f:FollowUp)=><div key={f.id} className="rounded-3xl border bg-white p-4 shadow-sm space-y-2"><div className="font-black">{f.leads?.name||"Unknown customer"}</div><div className="text-sm">{f.leads?.phone||"No phone"} {f.jobs?.title?`• ${f.jobs.title}`:""}</div><div className="text-sm text-slate-600">{f.note}</div><div className="text-xs">Due {new Date(f.due_date).toLocaleString()} • {f.completed?"Completed":"Open"}</div><div className="grid grid-cols-2 gap-2"><a className="rounded-xl border p-2 text-center" href={f.leads?.phone?`tel:${f.leads.phone}`:"#"}>Call customer</a><a className="rounded-xl border p-2 text-center" href={f.leads?.phone?`sms:${f.leads.phone}`:"#"}>Text customer</a><Button size="sm" onClick={()=>patch(f,{completed:!f.completed},f.completed?"Follow-up reopened":"Follow-up completed")}>{f.completed?"Reopen":"Mark complete"}</Button><Button size="sm" variant="outline" onClick={()=>snooze(f,1)}>Snooze 1 day</Button><Button size="sm" variant="outline" onClick={()=>snooze(f,3)}>Snooze 3 days</Button><Button size="sm" variant="outline" onClick={()=>snooze(f,7)}>Snooze 1 week</Button>{!f.job_id&&<Button size="sm" onClick={()=>createJob(f)}>Create job</Button>}</div></div>;

  return <div className="space-y-4">{[["Overdue",groups.overdue],["Today",groups.today],["This Week",groups.week],["Upcoming",groups.upcoming],["Completed",groups.completed]].map(([t,arr]:any)=><section key={t}><h3 className="mb-2 font-black">{t} ({arr.length})</h3><div className="space-y-2">{arr.map((f:FollowUp)=>Card(f))}</div></section>)}</div>
}
