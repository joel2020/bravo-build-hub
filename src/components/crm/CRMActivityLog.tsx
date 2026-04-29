import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { asDateTime } from "@/lib/crm";

type Activity = { id: string; action: string; details: string | null; created_at: string; leads?: { name: string } | null; jobs?: { title: string } | null };
export const CRMActivityLog = () => {
  const [items, setItems] = useState<Activity[]>([]); const [q,setQ]=useState("");
  useEffect(()=>{(async()=>{const {data}=await supabase.from("activity_log").select("id,action,details,created_at,leads(name),jobs(title)").order("created_at",{ascending:false}).limit(200); setItems((data as Activity[])||[]);})();},[]);
  const filtered = useMemo(()=>items.filter(a=>`${a.action} ${a.details||""} ${a.leads?.name||""} ${a.jobs?.title||""}`.toLowerCase().includes(q.toLowerCase())),[items,q]);
  return <div><Input placeholder="Search action, lead, or job" value={q} onChange={e=>setQ(e.target.value)} className="mb-3 max-w-md" />
    <div className="space-y-2">{filtered.map(a=><div key={a.id} className="border rounded p-3"><div className="font-medium text-sm">{a.action}</div><div className="text-xs text-muted-foreground">{a.leads?.name?`Lead: ${a.leads.name}`:""} {a.jobs?.title?`Job: ${a.jobs.title}`:""}</div>{a.details&&<p className="text-sm">{a.details}</p>}<p className="text-xs text-muted-foreground">{asDateTime(a.created_at)}</p></div>)}</div></div>;
};
