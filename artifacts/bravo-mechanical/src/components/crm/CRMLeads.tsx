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
import { createActivity, LEAD_STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/crm";

type Lead = { id:string; name:string; phone:string|null; email:string|null; address:string|null; city:string|null; service_type:string|null; message:string|null; status:string; created_at:string };
type Technician = { id:string; name:string; active:boolean };

type TimelineItem = { id:string; type:"job"|"follow_up"|"activity"; date:string; description:string; status?:string|null };

const leadStatuses = ["new","contacted","qualified","quoted","won","lost"];
const reminderMap: Record<string,number> = { today:0,tomorrow:1,"3_days":3,"1_week":7 };

export const CRMLeads = () => {
  const [leads,setLeads]=useState<Lead[]>([]); const [technicians,setTechnicians]=useState<Technician[]>([]); const [selected,setSelected]=useState<Lead|null>(null);
  const [timeline,setTimeline]=useState<TimelineItem[]>([]); const [loadingTimeline,setLoadingTimeline]=useState(false);
  const [search,setSearch]=useState(""); const [filterStatus,setFilterStatus]=useState("all"); const [openCreate,setOpenCreate]=useState(false); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState<any>({ intake_text:"",name:"",phone:"",email:"",address:"",city:"",service_type:"",message:"",create_job:true,job_title:"",scheduled_date:"",amount:"",job_status:"scheduled",technician_id:"unassigned",create_follow_up:true,follow_up_timing:"tomorrow",follow_up_custom:"",follow_up_note:"" });

  const load = async ()=>{ const [{data:l},{data:t}] = await Promise.all([supabase.from("leads" as any).select("id,name,phone,email,address,city,service_type,message,status,created_at").order("created_at",{ascending:false}),supabase.from("technicians" as any).select("id,name,active").eq("active",true).order("name")]); setLeads((l as any)||[]); setTechnicians((t as any)||[]); };
  useEffect(()=>{load();},[]);

  const parseIntake = ()=>{
    const text = (form.intake_text||"").trim(); if(!text){ toast({title:"Paste customer text first",variant:"destructive"}); return; }
    const phone = text.match(/(\+?1?[\s.-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const address = text.match(/\d+\s+[A-Za-z0-9\s.]+\s(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive)\b[^,.]*/i);
    const name = text.match(/(?:this is|i am|i'm)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
    const service = /no heat|furnace|boiler/i.test(text)?"heating service":/\bac\b|cooling/i.test(text)?"ac service":/install|replacement/i.test(text)?"install/replacement":/maintenance|tune-?up/i.test(text)?"maintenance":"hvac service";
    setForm((f:any)=>({...f,name:name?.[1]||f.name,phone:phone?.[0]||f.phone,email:email?.[0]||f.email,address:address?.[0]||f.address,service_type:service,message:text,job_title:f.job_title||`${service} - ${(name?.[1]||f.name||"Customer")}`}));
    toast({title:"Intake fields auto-filled"});
  };

  const dueDateFromTiming = ()=>{ if(form.follow_up_timing==="custom"&&form.follow_up_custom) return new Date(form.follow_up_custom).toISOString(); const d=new Date(); d.setDate(d.getDate()+(reminderMap[form.follow_up_timing]??1)); return d.toISOString(); };

  const save = async()=>{
    if(!form.name?.trim()){ toast({title:"Customer name required",variant:"destructive"}); return; }
    setSaving(true);
    const {data:leadRaw,error:leadErr} = await supabase.from("leads" as any).insert({name:form.name.trim(),phone:form.phone||null,email:form.email||null,address: form.address||null, service_address: form.address||null,city:form.city||null,service_type:form.service_type||null,message:form.message||null,status:"new",source:"other"}).select("id").single();
    const lead = leadRaw as { id: string } | null;
    if(leadErr||!lead){ setSaving(false); toast({title:"Failed to create customer",description:leadErr?.message,variant:"destructive"}); return; }
    await createActivity("Customer created from text intake",{leadId:lead.id,details:form.name});
    let jobId:string|undefined;
    if(form.create_job){ const techId=form.technician_id==="unassigned"?null:form.technician_id; const amount=Number(form.amount||0); const title=form.job_title?.trim()||`${form.service_type||"HVAC Service"} - ${form.name}`;
      const {data:jobRaw,error:jobErr}=await supabase.from("jobs" as any).insert({lead_id:lead.id,title,status:form.job_status,scheduled_date:form.scheduled_date?form.scheduled_date.slice(0,10):null,scheduled_at:form.scheduled_date||null,amount,total_amount:amount,technician_id:techId,customer_name:form.name,customer_phone:form.phone||null,customer_email:form.email||null,address: form.address||null, service_address: form.address||null,notes:form.message||null,dispatch_notes:form.message||null}).select("id").single();
      const job = jobRaw as { id: string } | null;
      if(jobErr){ setSaving(false); toast({title:"Customer created, job failed",description:jobErr.message,variant:"destructive"}); return; }
      jobId=job?.id; await createActivity("Job created from intake",{leadId:lead.id,jobId,details:title});
      if(techId&&jobId){ const techName=technicians.find(t=>t.id===techId)?.name||"technician"; await supabase.from("crm_notifications" as any).insert({type:"job_assigned",title:"Job assigned",message:`${title} assigned to ${techName}`,lead_id:lead.id,job_id:jobId}); }
    }
    if(form.create_follow_up){ const due=dueDateFromTiming(); const note=form.follow_up_note?.trim()||`Follow up with ${form.name}`; await supabase.from("follow_ups" as any).insert({lead_id:lead.id,job_id:jobId||null,due_date:due,note,completed:false}); await createActivity("Follow-up created from intake",{leadId:lead.id,jobId:jobId||null,details:note}); }
    toast({title:"Customer intake saved"}); setSaving(false); setOpenCreate(false); await load();
  };

  const openLead = async (lead:Lead)=>{ setSelected(lead); setLoadingTimeline(true); const [{data:jobs},{data:follow},{data:acts}] = await Promise.all([supabase.from("jobs" as any).select("id,title,status,scheduled_date,created_at").eq("lead_id",lead.id).order("created_at",{ascending:false}),supabase.from("follow_ups" as any).select("id,note,completed,due_date,created_at").eq("lead_id",lead.id).order("due_date",{ascending:false}),supabase.from("activity_logs" as any).select("id,title,description,created_at").eq("lead_id",lead.id).order("created_at",{ascending:false}).limit(50)]);
    const t:TimelineItem[]=[...((jobs as any)||[]).map((j:any)=>({id:`j-${j.id}`,type:"job",date:j.scheduled_date||j.created_at,description:j.title||"Job",status:j.status})),...((follow as any)||[]).map((f:any)=>({id:`f-${f.id}`,type:"follow_up",date:f.due_date||f.created_at,description:f.note||"Follow-up",status:f.completed?"completed":"open"})),...((acts as any)||[]).map((a:any)=>({id:`a-${a.id}`,type:"activity",date:a.created_at,description:`${a.title}${a.description?`: ${a.description}`:""}`}))].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
    setTimeline(t); setLoadingTimeline(false); };

  const filtered = useMemo(()=>leads.filter(l=>(filterStatus==="all"||l.status===filterStatus)&&`${l.name} ${l.phone||""} ${l.address||""}`.toLowerCase().includes(search.toLowerCase())),[leads,search,filterStatus]);

  return <div className="space-y-4">
    <div className="flex flex-col gap-2 sm:flex-row"><Input placeholder="Search customers" value={search} onChange={(e)=>setSearch(e.target.value)} /><Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="sm:w-44"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{leadStatuses.map(s=><SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]||s}</SelectItem>)}</SelectContent></Select><Dialog open={openCreate} onOpenChange={setOpenCreate}><DialogTrigger asChild><Button>Paste Text Intake</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Add Customer + Job</DialogTitle></DialogHeader><div className="grid gap-2"><Label>Paste customer text message</Label><Textarea value={form.intake_text} onChange={(e)=>setForm({...form,intake_text:e.target.value})}/><Button variant="outline" onClick={parseIntake}>Auto-fill fields</Button><Input placeholder="Customer name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/><Input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><Input placeholder="Address" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})}/><Input placeholder="City" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})}/><Input placeholder="Service needed" value={form.service_type} onChange={(e)=>setForm({...form,service_type:e.target.value})}/><Textarea placeholder="Notes / dispatch context" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}/>
      <Label className="font-bold">Job</Label><label><input type="checkbox" checked={form.create_job} onChange={(e)=>setForm({...form,create_job:e.target.checked})}/> Create job</label>{form.create_job&&<><Input placeholder="Job title" value={form.job_title} onChange={(e)=>setForm({...form,job_title:e.target.value})}/><Input type="datetime-local" value={form.scheduled_date} onChange={(e)=>setForm({...form,scheduled_date:e.target.value})}/><Input type="number" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})}/><Select value={form.job_status} onValueChange={(v)=>setForm({...form,job_status:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="quoted">Quoted</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="in_progress">In progress</SelectItem></SelectContent></Select><Select value={form.technician_id} onValueChange={(v)=>setForm({...form,technician_id:v})}><SelectTrigger><SelectValue placeholder="Assign technician"/></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{technicians.map((t)=> <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></>}
      <Label className="font-bold">Follow-up</Label><label><input type="checkbox" checked={form.create_follow_up} onChange={(e)=>setForm({...form,create_follow_up:e.target.checked})}/> Create follow-up</label>{form.create_follow_up&&<><Select value={form.follow_up_timing} onValueChange={(v)=>setForm({...form,follow_up_timing:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="tomorrow">Tomorrow</SelectItem><SelectItem value="3_days">3 days</SelectItem><SelectItem value="1_week">1 week</SelectItem><SelectItem value="custom">Custom datetime</SelectItem></SelectContent></Select>{form.follow_up_timing==="custom"&&<Input type="datetime-local" value={form.follow_up_custom} onChange={(e)=>setForm({...form,follow_up_custom:e.target.value})}/>}<Textarea placeholder="Reminder note" value={form.follow_up_note} onChange={(e)=>setForm({...form,follow_up_note:e.target.value})}/></>}<Button onClick={save} disabled={saving}>{saving?"Saving...":"Save intake"}</Button></div></DialogContent></Dialog></div>
    <div className="grid gap-2">{filtered.map(lead=><button key={lead.id} className="rounded-2xl border bg-white p-3 text-left" onClick={()=>openLead(lead)}><div className="flex justify-between"><div className="font-bold">{lead.name}</div><span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE_CLASS[lead.status]||"bg-slate-100"}`}>{LEAD_STATUS_LABELS[lead.status]||lead.status}</span></div><div className="text-xs text-slate-600">{lead.phone||"—"} • {lead.address||"No address"}</div></button>)}</div>
    <Sheet open={!!selected} onOpenChange={(o)=>!o&&setSelected(null)}><SheetContent className="w-full sm:max-w-xl overflow-y-auto"><SheetHeader><SheetTitle>{selected?.name}</SheetTitle></SheetHeader><div className="mt-4 space-y-2"><h3 className="font-bold">Customer timeline</h3>{loadingTimeline?<p>Loading timeline…</p>:timeline.map(i=><div key={i.id} className="rounded-xl border p-2 text-sm"><div className="font-semibold">{i.type.replace("_"," ")}</div><div>{new Date(i.date).toLocaleString()}</div><div>{i.description}</div>{i.status&&<div className="text-xs text-slate-500">Status: {i.status}</div>}</div>)}</div></SheetContent></Sheet>
  </div>;
};
