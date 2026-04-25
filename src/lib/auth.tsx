import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "office" | "office_staff" | "tech" | "marketing" | "user";

type AuthState = {
  loading: boolean;
  session: Session | null;
  userId: string | null;
  roles: AppRole[];
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user.id) {
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id);
        setRoles((roleRows || []).map((r) => r.role as AppRole));
      }
      setLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) {
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", nextSession.user.id);
        setRoles((roleRows || []).map((r) => r.role as AppRole));
      } else {
        setRoles([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(() => ({
    loading,
    session,
    userId: session?.user.id ?? null,
    roles,
    isAuthenticated: Boolean(session),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  }), [loading, roles, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function hasAnyRole(roles: AppRole[], needed: AppRole[]) {
  return roles.some((role) => needed.includes(role));
}
