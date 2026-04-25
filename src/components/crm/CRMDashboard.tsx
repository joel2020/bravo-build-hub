import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Bell, DollarSign, TrendingUp, AlertTriangle, Clock, ArrowRight, Users } from "lucide-react";

type Stats = {
  newLeadsThisWeek: number;
  openJobs: number;
  overdueFollowUps: number;
  quotedRevenue: number;
  wonRevenue: number;
};

type RecentLead = { id: string; name: string; status: string; source: string; created_at: string };
type OverdueItem = { id: string; label: string; type: "invoice" | "follow_up"; due: string };
type ActivityEntry = { id: string; action: string; details: string | null; created_at: string; leads?: { name: string } | null; jobs?: { title: string } | null };

export const CRMDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    newLeadsThisWeek: 0, openJobs: 0, overdueFollowUps: 0, quotedRevenue: 0, wonRevenue: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const [leads, jobs, invoices, followUps, recent, act] = await Promise.all([
        supabase.from("leads").select("status, created_at"),
        supabase.from("jobs").select("status, amount"),
        supabase.from("invoices").select("status, amount, due_date, invoice_number"),
        supabase.from("follow_ups").select("completed, due_date, note"),
        supabase.from("leads").select("id, name, status, source, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("activity_log").select("id, action, details, created_at, leads(name), jobs(title)").order("created_at", { ascending: false }).limit(8),
      ]);
      const l = leads.data || [];
      const j = jobs.data || [];
      const inv = invoices.data || [];
      const f = followUps.data || [];
      const now = new Date();

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const jobsWithAmount = j.map((x) => ({ ...x, amount: Number(x.amount || 0) }));

      setStats({
        newLeadsThisWeek: l.filter((x) => x.status === "new" && new Date(x.created_at) >= weekStart).length,
        openJobs: j.filter((x) => ["quoted", "scheduled", "in_progress"].includes(x.status)).length,
        overdueFollowUps: f.filter((x) => !x.completed && new Date(x.due_date) < now).length,
        quotedRevenue: jobsWithAmount.filter((x) => x.status === "quoted").reduce((s, x) => s + x.amount, 0),
        wonRevenue: jobsWithAmount.filter((x) => x.status === "completed").reduce((s, x) => s + x.amount, 0),
      });

      setRecentLeads((recent.data as RecentLead[]) || []);
      setActivity((act.data as ActivityEntry[]) || []);

      // Build overdue items
      const overdue: OverdueItem[] = [];
      inv.filter((x) => (x.status === "sent" || x.status === "overdue") && x.due_date && new Date(x.due_date) < now)
        .forEach((x) => overdue.push({ id: x.invoice_number, label: `Invoice ${x.invoice_number}`, type: "invoice", due: x.due_date! }));
      f.filter((x) => !x.completed && new Date(x.due_date) < now)
        .forEach((x) => overdue.push({ id: x.note, label: x.note.substring(0, 50), type: "follow_up", due: x.due_date }));
      overdue.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
      setOverdueItems(overdue.slice(0, 6));
    };
    load();
  }, []);

  const kpiCards = [
    { label: "New Leads (7d)", value: stats.newLeadsThisWeek, icon: TrendingUp, color: "text-primary" },
    { label: "Open Jobs", value: stats.openJobs, icon: Briefcase, color: "text-primary" },
    { label: "Overdue Follow-ups", value: stats.overdueFollowUps, icon: Bell, color: "text-destructive" },
    { label: "Quoted Revenue", value: `$${stats.quotedRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600" },
    { label: "Won Revenue", value: `$${stats.wonRevenue.toLocaleString()}`, icon: ArrowRight, color: "text-green-600" },
    { label: "Overdue Invoices", value: invCount(overdueItems, "invoice"), icon: FileText, color: "text-destructive" },
  ];

  const statusColor: Record<string, string> = {
    new: "bg-blue-100 text-blue-800", contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-purple-100 text-purple-800", quoted: "bg-orange-100 text-orange-800",
    won: "bg-green-100 text-green-800", lost: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overdue Alerts */}
      {overdueItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Overdue Items ({overdueItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {overdueItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{item.type === "invoice" ? "Invoice" : "Follow-up"}</Badge>
                    <span className="truncate max-w-[200px] sm:max-w-none">{item.label}</span>
                  </span>
                  <span className="text-xs text-destructive font-medium whitespace-nowrap">{new Date(item.due).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet</p>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.source.replace(/_/g, " ")} · {new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[lead.status] || "bg-secondary text-foreground"}`}>
                      {lead.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{a.action}</span>
                        {a.leads?.name && <span className="text-muted-foreground"> · {a.leads.name}</span>}
                        {a.jobs?.title && <span className="text-muted-foreground"> · {a.jobs.title}</span>}
                      </p>
                      {a.details && <p className="text-xs text-muted-foreground truncate">{a.details}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function invCount(items: OverdueItem[], type: OverdueItem["type"]) {
  return items.filter((item) => item.type === type).length;
}
