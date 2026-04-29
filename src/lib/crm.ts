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

export const createActivity = async (action: string, opts?: { leadId?: string | null; jobId?: string | null; invoiceId?: string | null; details?: string | null }) => {
  const { data: auth } = await supabase.auth.getUser();
  await supabase.from("activity_log" as any).insert({
    action,
    lead_id: opts?.leadId || null,
    job_id: opts?.jobId || null,
    invoice_id: opts?.invoiceId || null,
    details: opts?.details || null,
    actor_id: auth.user?.id || null,
  });
};

type CompletedJobInput = {
  id: string;
  lead_id?: string | null;
  title?: string | null;
  amount?: number | null;
  total_amount?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  leads?: { name?: string | null; phone?: string | null; email?: string | null } | null;
};

const invoiceNumber = () => `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Date.now().toString().slice(-5)}`;

export const ensureRevenueLoopForCompletedJob = async (job: CompletedJobInput) => {
  const amount = Number(job.total_amount ?? job.amount ?? 0);
  const due = new Date();
  due.setDate(due.getDate() + 7);

  const { data: existingInvoice } = await supabase
    .from("invoices" as any)
    .select("id,invoice_number")
    .eq("job_id", job.id)
    .maybeSingle();

  let invoiceId = existingInvoice?.id as string | undefined;
  let invoiceNo = existingInvoice?.invoice_number as string | undefined;

  if (!existingInvoice) {
    invoiceNo = invoiceNumber();
    const { data: createdInvoice, error: invoiceError } = await supabase
      .from("invoices" as any)
      .insert({
        job_id: job.id,
        lead_id: job.lead_id || null,
        invoice_number: invoiceNo,
        amount,
        total: amount,
        status: "draft",
        due_date: due.toISOString(),
        due_at: due.toISOString(),
      })
      .select("id,invoice_number")
      .single();

    if (!invoiceError) {
      invoiceId = createdInvoice?.id;
      await createActivity("Invoice auto-created from completed job", { jobId: job.id, leadId: job.lead_id, invoiceId, details: invoiceNo });
    }
  }

  const { data: existingReview } = await supabase
    .from("review_requests" as any)
    .select("id")
    .eq("job_id", job.id)
    .maybeSingle();

  if (!existingReview) {
    await supabase.from("review_requests" as any).insert({
      job_id: job.id,
      lead_id: job.lead_id || null,
      customer_name: job.customer_name || job.leads?.name || null,
      customer_phone: job.customer_phone || job.leads?.phone || null,
      customer_email: job.customer_email || job.leads?.email || null,
      status: "draft",
    });
  }

  const { data: existingInvoiceAlert } = invoiceId
    ? await supabase.from("crm_notifications" as any).select("id").eq("invoice_id", invoiceId).eq("type", "unpaid_invoice").maybeSingle()
    : { data: null };

  if (invoiceId && !existingInvoiceAlert) {
    await supabase.from("crm_notifications" as any).insert({
      type: "unpaid_invoice",
      title: "Invoice ready to send",
      message: `${invoiceNo || "Invoice"} was created for ${job.title || "completed job"} (${asCurrency(amount)}).`,
      job_id: job.id,
      lead_id: job.lead_id || null,
      invoice_id: invoiceId,
    });
  }

  const { data: existingReviewAlert } = await supabase
    .from("crm_notifications" as any)
    .select("id")
    .eq("job_id", job.id)
    .eq("type", "review_request")
    .maybeSingle();

  if (!existingReviewAlert) {
    await supabase.from("crm_notifications" as any).insert({
      type: "review_request",
      title: "Send review request",
      message: `${job.title || "Job"} is complete. Send the customer a review request.`,
      job_id: job.id,
      lead_id: job.lead_id || null,
    });
  }

  return { invoiceId, invoiceNumber: invoiceNo };
};
