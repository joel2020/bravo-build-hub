import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeo } from "@/lib/seo";
import { LogOut, Users, Briefcase, FileText, Bell, Activity } from "lucide-react";
import { CRMLeads } from "@/components/crm/CRMLeads";
import { CRMJobs } from "@/components/crm/CRMJobs";
import { CRMInvoices } from "@/components/crm/CRMInvoices";
import { CRMFollowUps } from "@/components/crm/CRMFollowUps";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { CRMActivityLog } from "@/components/crm/CRMActivityLog";

const CRM = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useSeo({ title: "CRM | Bravo Mechanical", description: "Internal CRM dashboard." });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth", { replace: true }); return; }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
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

  if (loading) return <Layout><div className="container mx-auto px-4 py-16">Loading…</div></Layout>;
  if (!authorized) return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
        <p className="text-muted-foreground mb-6">You don't have CRM access.</p>
        <Button onClick={signOut} variant="outline"><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">CRM</h1>
          <Button onClick={signOut} variant="outline" size="sm"><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
        </div>
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads"><Users className="h-4 w-4 mr-1" />Leads</TabsTrigger>
            <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" />Jobs</TabsTrigger>
            <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-1" />Invoices</TabsTrigger>
            <TabsTrigger value="followups"><Bell className="h-4 w-4 mr-1" />Follow-ups</TabsTrigger>
            <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-1" />Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><CRMDashboard /></TabsContent>
          <TabsContent value="leads"><CRMLeads /></TabsContent>
          <TabsContent value="jobs"><CRMJobs /></TabsContent>
          <TabsContent value="invoices"><CRMInvoices /></TabsContent>
          <TabsContent value="followups"><CRMFollowUps /></TabsContent>
          <TabsContent value="activity"><CRMActivityLog /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CRM;