import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, CircleAlert, Clock, FileText, RefreshCw, Wrench } from "lucide-react";
import { asDate } from "@/lib/crm";

type CRMNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  lead_id: string | null;
  job_id: string | null;
  invoice_id: string | null;
  follow_up_id: string | null;
  read_at: string | null;
  created_at: string;
};

const typeStyles: Record<string, { label: string; className: string; icon: typeof Bell }> = {
  new_lead: { label: "Lead", className: "bg-blue-50 text-blue-700 border-blue-200", icon: Bell },
  uncontacted_lead: { label: "Lead", className: "bg-amber-50 text-amber-700 border-amber-200", icon: CircleAlert },
  overdue_follow_up: { label: "Follow-up", className: "bg-red-50 text-red-700 border-red-200", icon: Clock },
  job_assigned: { label: "Job", className: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Wrench },
  job_overdue: { label: "Job", className: "bg-orange-50 text-orange-700 border-orange-200", icon: CircleAlert },
  unpaid_invoice: { label: "Invoice", className: "bg-violet-50 text-violet-700 border-violet-200", icon: FileText },
  review_request: { label: "Review", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

export const CRMAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<CRMNotification[]>([]);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crm_notifications" as any)
      .select("id,type,title,message,lead_id,job_id,invoice_id,follow_up_id,read_at,created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    setAlerts((data as unknown as CRMNotification[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const unreadCount = useMemo(() => alerts.filter((alert) => !alert.read_at).length, [alerts]);

  const markRead = async (id: string) => {
    setSavingId(id);
    await supabase
      .from("crm_notifications" as any)
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    await fetchAlerts();
    setSavingId(null);
  };

  const markAllRead = async () => {
    setSavingId("all");
    await supabase
      .from("crm_notifications" as any)
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    await fetchAlerts();
    setSavingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">Ops alerts</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Priority Notifications</h2>
          <p className="text-sm text-slate-600">Leads, overdue work, invoices, assigned jobs, and review request actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border border-blue-200 bg-white px-3 py-1 text-blue-700">{unreadCount} unread</Badge>
          <Button variant="outline" className="rounded-xl bg-white" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
          <Button className="rounded-xl" onClick={markAllRead} disabled={!unreadCount || savingId === "all"}>
            Mark all read
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[1.75rem] border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="flex items-center gap-2 text-base font-black text-slate-950">
            <Bell className="h-5 w-5 text-blue-600" /> Alert Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading alerts…</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="font-bold text-slate-950">No alerts yet</div>
              <p className="text-sm text-slate-500">The CRM will surface urgent work here as leads, jobs, invoices, and follow-ups need attention.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {alerts.map((alert) => {
                const style = typeStyles[alert.type] || { label: alert.type.replace(/_/g, " "), className: "bg-slate-50 text-slate-700 border-slate-200", icon: Bell };
                const Icon = style.icon;
                return (
                  <div key={alert.id} className={`flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between ${alert.read_at ? "bg-white" : "bg-blue-50/45"}`}>
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-950">{alert.title}</h3>
                          <Badge variant="outline" className={`rounded-full ${style.className}`}>{style.label}</Badge>
                          {!alert.read_at && <Badge className="rounded-full bg-slate-950 text-white">Unread</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{alert.message || "Action needed inside the CRM."}</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">Created {asDate(alert.created_at)}</p>
                      </div>
                    </div>
                    {!alert.read_at && (
                      <Button size="sm" variant="outline" className="w-full rounded-xl bg-white md:w-auto" onClick={() => markRead(alert.id)} disabled={savingId === alert.id}>
                        Mark read
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
