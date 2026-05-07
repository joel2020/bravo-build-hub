import { supabase } from "@/integrations/supabase/client";
import { ensureInvoiceFollowUp } from "@/lib/invoiceFollowUps";

export const runInvoiceAutomation = async () => {
  const { data: invoicesRaw, error } = await supabase
    .from("invoices" as any)
    .select("id,job_id,lead_id,invoice_number,due_date,status")
    .in("status", ["sent", "overdue", "draft"])
    .not("due_date", "is", null);

  if (error || !invoicesRaw) return;

  const invoices = invoicesRaw as unknown as Array<{
    id: string;
    job_id: string | null;
    lead_id: string | null;
    invoice_number: string;
    due_date: string;
    status: string;
  }>;

  const now = Date.now();
  for (const invoice of invoices) {
    const due = new Date(invoice.due_date).getTime();
    const daysLate = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    if (daysLate === 1 || daysLate === 3 || daysLate === 7) {
      await ensureInvoiceFollowUp({
        leadId: invoice.lead_id,
        jobId: invoice.job_id,
        invoiceNumber: invoice.invoice_number,
        daysLate: daysLate as 1 | 3 | 7,
      });
    }
  }
};
