import { supabase } from "@/integrations/supabase/client";
import { sendSmsWithFallback, openSmsFallback } from "./sms";
import { sendEmail, openMailtoFallback } from "./email";

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

export const asDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "\u2014");

export const asDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : "\u2014");

export const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const createActivity = async (action: string, opts?: { leadId?: string | null; jobId?: string | null; invoiceId?: string | null; details?: string | null }) => {
  const { data: auth } = await supabase.auth.getUser();
  // activity_logs requires a (record_type, record_id) and a non-null activity_type/title.
  const recordType = opts?.invoiceId ? "invoice" : opts?.jobId ? "job" : opts?.leadId ? "lead" : "system";
  const recordId = opts?.invoiceId || opts?.jobId || opts?.leadId || crypto.randomUUID();
  const { error } = await supabase.from("activity_logs").insert({
    activity_type: "note",
    title: action,
    description: opts?.details || null,
    record_type: recordType,
    record_id: recordId,
    lead_id: opts?.leadId || null,
    job_id: opts?.jobId || null,
    created_by: auth.user?.id || null,
  });
  if (error) console.warn("createActivity failed:", error.message);
};

const APP_URL = "https://app.bravomechanicalny.com";

const invoiceNumber = () => `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Date.now().toString().slice(-5)}`;

export type CompletedJobInput = {
  id: string;
  lead_id?: string | null;
  title?: string | null;
  amount?: number | null;
  total_amount?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  leads?: { name: string | null; phone: string | null; email: string | null } | null;
};

export const ensureRevenueLoopForCompletedJob = async (job: CompletedJobInput) => {
  const amount = Number(job.total_amount ?? job.amount ?? 0);
  const due = new Date();
  due.setDate(due.getDate() + 7);

  const { data: existingInvoiceRaw } = await supabase
    .from("invoices" as any)
    .select("id,invoice_number")
    .eq("job_id", job.id)
    .maybeSingle();

  const existingInvoice = existingInvoiceRaw as { id: string; invoice_number: string } | null;
  let invoiceId = existingInvoice?.id;
  let invoiceNo = existingInvoice?.invoice_number;

  if (!existingInvoice) {
    invoiceNo = invoiceNumber();
    const { data: createdInvoiceRaw, error: invoiceError } = await supabase
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

    const createdInvoice = createdInvoiceRaw as { id: string; invoice_number: string } | null;
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

  const { data: existingInvoiceAlertRaw } = invoiceId
    ? await supabase.from("crm_notifications" as any).select("id").eq("invoice_id", invoiceId).eq("type", "unpaid_invoice").maybeSingle()
    : { data: null };

  const existingInvoiceAlert = existingInvoiceAlertRaw as { id: string } | null;

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

export async function sendInvoiceMessage(job: CompletedJobInput, invoiceNo: string) {
  const customerPhone = job.customer_phone || job.leads?.phone;
  const customerEmail = job.customer_email || job.leads?.email;
  const customerName = job.customer_name || job.leads?.name || "there";
  const paymentLink = `${APP_URL}/invoices`;

  const results = { sms: false, email: false, errors: [] as string[] };

  if (customerPhone) {
    const smsBody = `Hi ${customerName}, your Bravo Mechanical invoice is ready: ${invoiceNo}. View and pay here: ${paymentLink}`;
    try {
      const smsResult = await sendSmsWithFallback(customerPhone, smsBody);
      results.sms = smsResult.success;
      if (!smsResult.success) {
        results.errors.push(`SMS failed: ${smsResult.error}`);
      }
    } catch (e) {
      results.errors.push(`SMS error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (customerEmail) {
    const subject = "Your Bravo Mechanical Invoice";
    const html = `
      <!DOCTYPE html>
      <html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a1a1a;">Bravo Mechanical</h2>
        <p>Hi ${customerName},</p>
        <p>Your invoice <strong>${invoiceNo}</strong> is ready.</p>
        <p><a href="${paymentLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Invoice</a></p>
        <p style="color:#666;font-size:14px;">Thank you for choosing Bravo Mechanical.</p>
      </body></html>
    `;
    try {
      const emailResult = await sendEmail({ to: customerEmail, subject, html });
      results.email = emailResult.success;
      if (!emailResult.success) {
        results.errors.push(`Email failed: ${emailResult.error}`);
      }
    } catch (e) {
      results.errors.push(`Email error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  await createActivity("Invoice notification sent", {
    jobId: job.id,
    leadId: job.lead_id || null,
    details: `SMS: ${results.sms ? "sent" : "skipped/failed"}, Email: ${results.email ? "sent" : "skipped/failed"}`,
  });

  return results;
}

export async function sendReviewRequest(job: CompletedJobInput) {
  const customerPhone = job.customer_phone || job.leads?.phone;
  const customerEmail = job.customer_email || job.leads?.email;
  const customerName = job.customer_name || job.leads?.name || "there";
  const reviewLink = "https://g.page/r/bravo-mechanical/review";

  const results = { sms: false, email: false, errors: [] as string[] };

  if (customerPhone) {
    const smsBody = `Thanks for choosing Bravo Mechanical, ${customerName}! Could you leave us a quick review? ${reviewLink}`;
    try {
      const smsResult = await sendSmsWithFallback(customerPhone, smsBody);
      results.sms = smsResult.success;
      if (!smsResult.success) {
        results.errors.push(`SMS failed: ${smsResult.error}`);
      }
    } catch (e) {
      results.errors.push(`SMS error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (customerEmail) {
    const subject = "How was your service with Bravo Mechanical?";
    const html = `
      <!DOCTYPE html>
      <html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a1a1a;">Bravo Mechanical</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for choosing Bravo Mechanical. We hope you had a great experience!</p>
        <p>Would you mind taking a moment to leave us a review?</p>
        <p><a href="${reviewLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Leave a Review</a></p>
        <p style="color:#666;font-size:14px;">Your feedback helps us serve you better.</p>
      </body></html>
    `;
    try {
      const emailResult = await sendEmail({ to: customerEmail, subject, html });
      results.email = emailResult.success;
      if (!emailResult.success) {
        results.errors.push(`Email failed: ${emailResult.error}`);
      }
    } catch (e) {
      results.errors.push(`Email error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  await createActivity("Review request sent", {
    jobId: job.id,
    leadId: job.lead_id || null,
    details: `SMS: ${results.sms ? "sent" : "skipped/failed"}, Email: ${results.email ? "sent" : "skipped/failed"}`,
  });

  return results;
}

export async function sendUnpaidInvoiceFollowUp(invoiceId: string, leadId: string | null, jobId: string | null, customerPhone: string | null, customerEmail: string | null, customerName: string | null, invoiceNo: string) {
  const results = { sms: false, email: false, errors: [] as string[] };
  const paymentLink = `${APP_URL}/invoices`;

  if (customerPhone) {
    const smsBody = `Hi ${customerName || "there"}, this is a friendly reminder that your Bravo Mechanical invoice ${invoiceNo} is still unpaid. Please view and pay here: ${paymentLink}`;
    try {
      const smsResult = await sendSmsWithFallback(customerPhone, smsBody);
      results.sms = smsResult.success;
      if (!smsResult.success) results.errors.push(`SMS: ${smsResult.error}`);
    } catch (e) { results.errors.push(`SMS: ${e instanceof Error ? e.message : String(e)}`); }
  }

  if (customerEmail) {
    const subject = `Reminder: Invoice ${invoiceNo} - Bravo Mechanical`;
    const html = `<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2>Bravo Mechanical</h2><p>Hi ${customerName || "there"},</p><p>This is a friendly reminder that invoice <strong>${invoiceNo}</strong> is still outstanding.</p><p><a href="${paymentLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Pay Now</a></p></body></html>`;
    try {
      const emailResult = await sendEmail({ to: customerEmail, subject, html });
      results.email = emailResult.success;
      if (!emailResult.success) results.errors.push(`Email: ${emailResult.error}`);
    } catch (e) { results.errors.push(`Email: ${e instanceof Error ? e.message : String(e)}`); }
  }

  await createActivity("Unpaid invoice follow-up sent", { invoiceId, leadId, jobId, details: `SMS: ${results.sms}, Email: ${results.email}` });

  return results;
}
