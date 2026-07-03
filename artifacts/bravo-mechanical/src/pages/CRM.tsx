import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CRMActivityLog } from "@/components/crm/CRMActivityLog";
import { CRMAlerts } from "@/components/crm/CRMAlerts";
import { CRMDashboard, CRMSettingsPanel, PlaceholderPanel, Sidebar, SMSInbox, TopBar } from "@/components/crm/CRMDashboard";
import { CRMDispatch } from "@/components/crm/CRMDispatch";
import { CRMFollowUps } from "@/components/crm/CRMFollowUps";
import { CRMInvoices } from "@/components/crm/CRMInvoices";
import { CRMJobs } from "@/components/crm/CRMJobs";
import { CRMLeads } from "@/components/crm/CRMLeads";
import { CRMMyJobs } from "@/components/crm/CRMMyJobs";

const CRM = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useSeo({ title: "CRM | Bravo Mechanical", description: "Internal CRM dashboard.", canonical: `${SITE.siteUrl}/admin/crm`, noindex: true });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const ok = (roles || []).some((role) => role.role === "admin" || role.role === "user");
      setAuthorized(ok);
      setLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const activeTitle = {
    dashboard: "Dashboard",
    jobs: "Jobs",
    dispatch: "Dispatch Board",
    leads: "Customers (CRM)",
    followups: "Follow-Ups",
    alerts: "Alerts",
    messages: "Messages",
    myjobs: "Technicians",
    invoices: "Invoices",
    activity: "Activity Log",
    settings: "Settings",
  }[activeView] || "Dashboard";

  const renderActiveView = () => {
    if (activeView === "dashboard") return <CRMDashboard searchQuery={dashboardSearch} onNavigate={setActiveView} />;
    if (activeView === "jobs") return <CRMJobs />;
    if (activeView === "dispatch") return <CRMDispatch />;
    if (activeView === "leads") return <CRMLeads />;
    if (activeView === "followups") return <CRMFollowUps />;
    if (activeView === "messages") return <SMSInbox searchQuery={dashboardSearch} />;
    if (activeView === "myjobs") return <CRMMyJobs />;
    if (activeView === "invoices") return <CRMInvoices />;
    if (activeView === "activity") return <CRMActivityLog />;
    if (activeView === "settings") return <CRMSettingsPanel />;
    return <CRMAlerts />;
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading Bravo Command Center...</div>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 px-4 py-16 text-slate-950">
        <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur">
          <h1 className="mb-3 text-2xl font-bold">Not authorized</h1>
          <p className="mb-6 text-slate-600">You don't have CRM access.</p>
          <Button onClick={signOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <Sidebar activeView={activeView} onSelect={setActiveView} />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[244px] p-0 [&>button]:hidden">
          <Sidebar activeView={activeView} onSelect={(id) => { setActiveView(id); setMobileNavOpen(false); }} mobile />
        </SheetContent>
      </Sheet>
      <div className="min-w-0 lg:pl-[244px]">
        <TopBar
          onSignOut={signOut}
          onNewJob={() => setActiveView("jobs")}
          onMenuClick={() => setMobileNavOpen(true)}
          onSelect={setActiveView}
          searchQuery={dashboardSearch}
          onSearchChange={(query) => {
            setDashboardSearch(query);
            if (query.trim()) setActiveView("dashboard");
          }}
        />
        <main className="min-w-0 overflow-x-hidden px-3 pb-5 lg:px-5 xl:px-5">
          <div className="mb-3 lg:hidden">
            <PlaceholderPanel title={activeTitle} />
          </div>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default CRM;
