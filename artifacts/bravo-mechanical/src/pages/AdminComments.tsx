import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, Trash2, LogOut } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

type AdminComment = {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  body: string;
  approved: boolean;
  created_at: string;
};

const AdminComments = () => {
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const navigate = useNavigate();

  useSeo({ title: "Comment Moderation | Bravo Mechanical", description: "Admin comment moderation.", canonical: `${SITE.siteUrl}/admin/comments`, noindex: true });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const admin = (roles || []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) await loadComments();
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadComments = async () => {
    const { data, error } = await supabase.rpc("admin_list_blog_comments");
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    else setComments(data || []);
  };

  const approve = async (id: string) => {
    const { error } = await supabase.from("blog_comments").update({ approved: true }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Approved" }); loadComments(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); loadComments(); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const filtered = comments.filter((c) =>
    filter === "all" ? true : filter === "pending" ? !c.approved : c.approved,
  );

  if (!authChecked || loading) {
    return <Layout><div className="container mx-auto px-4 py-16">Loading…</div></Layout>;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
          <p className="text-muted-foreground mb-6">
            Your account doesn't have admin access. Ask an existing admin to grant the admin role to your user ID.
          </p>
          <Button onClick={signOut} variant="outline"><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold">Comment Moderation</h1>
          <Button onClick={signOut} variant="outline" size="sm"><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-secondary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({comments.filter((c) => f === "all" ? true : f === "pending" ? !c.approved : c.approved).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground">No comments in this view.</p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((c) => (
              <li key={c.id} className="border border-border rounded-lg p-5 bg-background">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{c.author_name}</span>
                      <span className="text-sm text-muted-foreground">&lt;{c.author_email}&gt;</span>
                      {c.approved ? <Badge>Approved</Badge> : <Badge variant="secondary">Pending</Badge>}
                    </div>
                    <Link to={`/blog/${c.post_slug}`} className="text-sm text-primary hover:underline">/blog/{c.post_slug}</Link>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!c.approved && (
                      <Button size="sm" onClick={() => approve(c.id)}><Check className="h-4 w-4" /> Approve</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default AdminComments;
