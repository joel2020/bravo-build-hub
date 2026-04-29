import { supabase } from "@/integrations/supabase/client";

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified / Scheduled",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  quoted: "Quoted",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-slate-200 text-slate-800",
  quoted: "bg-purple-100 text-purple-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  draft: "bg-slate-100 text-slate-800",
  sent: "bg-sky-100 text-sky-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export const asCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));

export const asDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "—");
export const asDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

export const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const createActivity = async (action: string, opts?: { leadId?: string | null; jobId?: string | null; details?: string | null }) => {
  const { data: auth } = await supabase.auth.getUser();
  await supabase.from("activity_log").insert({
    action,
    lead_id: opts?.leadId || null,
    job_id: opts?.jobId || null,
    details: opts?.details || null,
    created_by: auth.user?.id || null,
  });
};
