import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock } from "lucide-react";

type Activity = {
  id: string;
  action: string;
  details: string | null;
  created_at: string;
  leads?: { name: string } | null;
  jobs?: { title: string } | null;
};

export const CRMActivityLog = () => {
  const [items, setItems] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("activity_log")
        .select("id, action, details, created_at, leads(name), jobs(title)")
        .order("created_at", { ascending: false })
        .limit(100);
      setItems((data as Activity[]) || []);
    };
    load();
  }, []);

  const filtered = items.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.action.toLowerCase().includes(q) ||
      (a.details || "").toLowerCase().includes(q) ||
      (a.leads?.name || "").toLowerCase().includes(q) ||
      (a.jobs?.title || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activity…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No activity recorded yet</p>
      ) : (
        <div className="space-y-0">
          {filtered.map((a, i) => (
            <div key={a.id} className="flex items-start gap-4 py-3 border-b border-border last:border-0">
              <div className="mt-1 shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{a.action}</span>
                  {a.leads?.name && <Badge variant="outline" className="text-xs">{a.leads.name}</Badge>}
                  {a.jobs?.title && <Badge variant="secondary" className="text-xs">{a.jobs.title}</Badge>}
                </div>
                {a.details && <p className="text-sm text-muted-foreground mt-0.5">{a.details}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2">{filtered.length} entries</p>
    </div>
  );
};