import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { asDateTime } from "@/lib/crm";

// Reads activity_logs (plural) — the table createActivity() writes to.
// It isn't in the generated Supabase types yet, hence the cast.
type Activity = { id: string; title: string; description: string | null; created_at: string; leads?: { name: string } | null; jobs?: { title: string } | null };
export const CRMActivityLog = () => {
  const [items, setItems] = useState<Activity[]>([]); const [q,setQ]=useState("");
  useEffect(()=>{(async()=>{const {data}=await supabase.from("activity_logs" as any).select("id,title,description,created_at,leads(name),jobs(title)").order("created_at",{ascending:false}).limit(200); setItems((data as unknown as Activity[])||[]);})();},[]);
  const filtered = useMemo(()=>items.filter(a=>`${a.title} ${a.description||""} ${a.leads?.name||""} ${a.jobs?.title||""}`.toLowerCase().includes(q.toLowerCase())),[items,q]);
  return <div><Input placeholder="Search action, lead, or job" value={q} onChange={e=>setQ(e.target.value)} className="mb-3 max-w-md" />
    <div className="space-y-2">{filtered.length===0?<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No activity recorded yet. Actions like creating jobs, sending invoices, and completing follow-ups will show up here.</p>:filtered.map(a=><div key={a.id} className="border rounded p-3"><div className="font-medium text-sm">{a.title}</div><div className="text-xs text-muted-foreground">{a.leads?.name?`Lead: ${a.leads.name}`:""} {a.jobs?.title?`Job: ${a.jobs.title}`:""}</div>{a.description&&<p className="text-sm">{a.description}</p>}<p className="text-xs text-muted-foreground">{asDateTime(a.created_at)}</p></div>)}</div></div>;
};
