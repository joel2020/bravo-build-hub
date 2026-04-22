import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, Bell, DollarSign, TrendingUp } from "lucide-react";

type Stats = {
  totalLeads: number;
  newLeads: number;
  activeJobs: number;
  completedJobs: number;
  unpaidInvoices: number;
  totalRevenue: number;
  pendingFollowUps: number;
};

export const CRMDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0, newLeads: 0, activeJobs: 0, completedJobs: 0,
    unpaidInvoices: 0, totalRevenue: 0, pendingFollowUps: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [leads, jobs, invoices, followUps] = await Promise.all([
        supabase.from("leads").select("status"),
        supabase.from("jobs").select("status"),
        supabase.from("invoices").select("status, amount"),
        supabase.from("follow_ups").select("completed"),
      ]);
      const l = leads.data || [];
      const j = jobs.data || [];
      const inv = invoices.data || [];
      const f = followUps.data || [];
      setStats({
        totalLeads: l.length,
        newLeads: l.filter((x) => x.status === "new").length,
        activeJobs: j.filter((x) => ["scheduled", "in_progress"].includes(x.status)).length,
        completedJobs: j.filter((x) => x.status === "completed").length,
        unpaidInvoices: inv.filter((x) => x.status === "sent" || x.status === "overdue").length,
        totalRevenue: inv.filter((x) => x.status === "paid").reduce((s, x) => s + Number(x.amount), 0),
        pendingFollowUps: f.filter((x) => !x.completed).length,
      });
    };
    load();
  }, []);

  const cards = [
    { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-primary" },
    { label: "New Leads", value: stats.newLeads, icon: TrendingUp, color: "text-accent" },
    { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, color: "text-primary" },
    { label: "Completed Jobs", value: stats.completedJobs, icon: Briefcase, color: "text-green-600" },
    { label: "Unpaid Invoices", value: stats.unpaidInvoices, icon: FileText, color: "text-accent" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Pending Follow-ups", value: stats.pendingFollowUps, icon: Bell, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
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
  );
};