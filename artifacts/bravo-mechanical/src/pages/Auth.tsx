import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useSeo({ title: "Admin Sign In | Bravo Mechanical", description: "Admin sign in.", canonical: `${SITE.siteUrl}/auth`, noindex: true });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/admin/crm", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin/crm", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="text-3xl font-extrabold mb-2">Admin sign in</h1>
        <p className="text-muted-foreground mb-8">Restricted area for CRM access. Accounts are created by an administrator.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Working…" : "Sign in"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Auth;
