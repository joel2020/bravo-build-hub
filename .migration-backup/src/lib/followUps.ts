import { supabase } from "@/integrations/supabase/client";

export type EnsureFollowUpInput = {
  leadId?: string | null;
  jobId?: string | null;
  dueAt: string | Date;
  reason: string;
  windowHours?: number;
};

export const ensureFollowUp = async ({ leadId = null, jobId = null, dueAt, reason, windowHours = 24 }: EnsureFollowUpInput) => {
  if (!leadId && !jobId) return { created: false, reason: "missing_target" };

  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() - windowHours);

  let query = supabase
    .from("follow_ups" as any)
    .select("id")
    .eq("note", reason)
    .gte("created_at", windowStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  query = jobId ? query.eq("job_id", jobId) : query.is("job_id", null);
  query = leadId ? query.eq("lead_id", leadId) : query.is("lead_id", null);

  const { data: existing, error: duplicateError } = await query.maybeSingle();
  if (duplicateError) return { created: false, error: duplicateError };
  if (existing?.id) return { created: false, duplicateId: existing.id };

  const { data, error } = await supabase
    .from("follow_ups" as any)
    .insert({
      lead_id: leadId,
      job_id: jobId,
      due_date: new Date(dueAt).toISOString(),
      note: reason,
      completed: false,
    })
    .select("id")
    .single();

  return { created: !error, id: data?.id, error };
};
