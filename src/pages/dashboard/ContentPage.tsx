import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export default function ContentPage() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("blog_posts" as any).select("id,title,status,scheduled_publish_at,published_at").order("created_at", { ascending: false }).then(({ data }) => setBlogPosts(data || []));
    supabase.from("social_posts" as any).select("id,platform,status,approval_status,scheduled_at").order("created_at", { ascending: false }).then(({ data }) => setSocialPosts(data || []));
  }, []);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-4">Content queue</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-card">
          <h2 className="font-semibold mb-2">Blog posts</h2>
          <ul className="space-y-2 text-sm">
            {blogPosts.map((p) => <li key={p.id} className="border rounded p-2">{p.title} — {p.status}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <h2 className="font-semibold mb-2">Social posts</h2>
          <ul className="space-y-2 text-sm">
            {socialPosts.map((p) => <li key={p.id} className="border rounded p-2">{p.platform} — {p.status} ({p.approval_status})</li>)}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
