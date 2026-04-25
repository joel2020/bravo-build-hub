import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { roles } = useAuth();
  const [integrationSettings, setIntegrationSettings] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("integration_settings" as any).select("provider,key,active,updated_at").order("provider").then(({ data }) => setIntegrationSettings(data || []));
    supabase.from("user_roles").select("user_id, role, created_at").order("created_at", { ascending: false }).then(({ data }) => setUserRoles(data || []));
  }, []);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-card">
          <h2 className="font-semibold mb-2">Integration settings</h2>
          <ul className="space-y-2 text-sm">
            {integrationSettings.map((r) => <li key={`${r.provider}-${r.key}`} className="border rounded p-2">{r.provider}.{r.key} — {r.active ? "active" : "inactive"}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <h2 className="font-semibold mb-2">User roles {roles.includes("admin") ? "(admin view)" : ""}</h2>
          <ul className="space-y-2 text-sm max-h-96 overflow-auto">
            {userRoles.map((r, i) => <li key={`${r.user_id}-${i}`} className="border rounded p-2">{r.user_id} — {r.role}</li>)}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">Invite-only access: create users in Supabase Auth, then assign roles in user_roles.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
