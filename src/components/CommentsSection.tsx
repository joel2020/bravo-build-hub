import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const commentSchema = z.object({
  author_name: z.string().trim().min(1, "Name required").max(80, "Name too long"),
  author_email: z.string().trim().email("Invalid email").max(255),
  body: z.string().trim().min(2, "Comment too short").max(2000, "Comment too long"),
});

export const CommentsSection = ({ postSlug }: { postSlug: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author_name: "", author_email: "", body: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("id, author_name, body, created_at")
        .eq("post_slug", postSlug)
        .eq("approved", true)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setComments(data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = commentSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check your entry", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("blog_comments").insert({
      post_slug: postSlug,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email,
      body: parsed.data.body,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't submit", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thanks!", description: "Your comment is awaiting moderation." });
    setForm({ author_name: "", author_email: "", body: "" });
  };

  return (
    <section className="mt-16 pt-8 border-t border-border" aria-label="Comments">
      <h2 className="text-2xl font-bold mb-6 inline-flex items-center gap-2">
        <MessageCircle className="h-6 w-6" /> Comments
      </h2>

      {loading ? (
        <p className="text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground mb-8">Be the first to comment.</p>
      ) : (
        <ul className="space-y-6 mb-10">
          {comments.map((c) => (
            <li key={c.id} className="border border-border rounded-lg p-4 bg-secondary/40">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-semibold text-foreground">{c.author_name}</span>
                <time className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold">Leave a comment</h3>
        <p className="text-sm text-muted-foreground">Comments are reviewed before they appear. Your email is never published.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} maxLength={80} required />
          </div>
          <div>
            <Label htmlFor="c-email">Email (not published)</Label>
            <Input id="c-email" type="email" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} maxLength={255} required />
          </div>
        </div>
        <div>
          <Label htmlFor="c-body">Comment</Label>
          <Textarea id="c-body" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={2000} required />
        </div>
        <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit comment"}</Button>
      </form>
    </section>
  );
};
