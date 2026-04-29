import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeo } from "@/lib/seo";
import { LogOut, Users, Briefcase, FileText, Bell, Activity, CalendarDays, Wrench } from "lucide-react";
import { CRMLeads } from "@/components/crm/CRMLeads";
import { CRMJobs } from "@/components/crm/CRMJobs";
import { CRMInvoices } from "@/components/crm/CRMInvoices";
import { CRMFollowUps } from "@/components/crm/CRMFollowUps";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { CRMActivityLog } from "@/components/crm/CRMActivityLog";
import { CRMDispatch } from "@/components/crm/CRMDispatch";
import { CRMMyJobs } from "@/components/crm/CRMMyJobs";
import { SITE } from "@/lib/site";

const CRM = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useSeo({ title: "CRM | Bravo Mechanical", description: "Internal CRM dashboard.", canonical: `${SITE.siteUrl}/admin/crm`, noindex: true });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth", { replace: true }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const ok = (roles || []).some((r) => r.role === "admin" || r.role === "user");
      setAuthorized(ok);
      setLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => { await supabase.auth.signOut(); };

  if (loading) return <Layout><div className="min-h-screen bg-slate-950 p-8 text-slate-100">Loading Bravo Command Center…</div></Layout>;
  if (!authorized) return (
    <Layout>
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h1 className="mb-3 text-2xl font-bold">Not authorized</h1>
          <p className="mb-6 text-slate-300">You don't have CRM access.</p>
          <Button onClick={signOut} variant="outline"><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1d4ed8_0,#020617_35%,#020617_100%)] px-4 py-6 text-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg"><Wrench className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">Bravo Mechanical</p>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">Command Center</h1>
                  <p className="text-sm text-slate-300">Dispatch, field updates, revenue, invoices, and follow-ups in one premium ops hub.</p>
                </div>
              </div>
              <Button onClick={signOut} variant="secondary" size="sm" className="w-fit bg-white/90 text-slate-950 hover:bg-white"><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-xl">
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="dispatch"><CalendarDays className="h-4 w-4 mr-1" />Dispatch</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="myjobs">My Jobs</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="leads"><Users className="h-4 w-4 mr-1" />Leads</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="jobs"><Briefcase className="h-4 w-4 mr-1" />Jobs</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="invoices"><FileText className="h-4 w-4 mr-1" />Invoices</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="followups"><Bell className="h-4 w-4 mr-1" />Follow-ups</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-slate-950" value="activity"><Activity className="h-4 w-4 mr-1" />Activity</TabsTrigger>
            </TabsList>
            <div className="rounded-3xl border border-white/10 bg-white/95 p-4 text-slate-950 shadow-2xl md:p-6">
              <TabsContent value="dashboard"><CRMDashboard /></TabsContent>
              <TabsContent value="dispatch"><CRMDispatch /></TabsContent>
              <TabsContent value="myjobs"><CRMMyJobs /></TabsContent>
              <TabsContent value="leads"><CRMLeads /></TabsContent>
              <TabsContent value="jobs"><CRMJobs /></TabsContent>
              <TabsContent value="invoices"><CRMInvoices /></TabsContent>
              <TabsContent value="followups"><CRMFollowUps /></TabsContent>
              <TabsContent value="activity"><CRMActivityLog /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CRM;