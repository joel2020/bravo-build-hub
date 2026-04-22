import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Trash2 } from "lucide-react";

const STATUSES = ["draft", "sent", "paid", "overdue"] as const;

type Invoice = {
  id: string; job_id: string; invoice_number: string; amount: number;
  status: string; due_date: string | null; paid_date: string | null;
  notes: string | null; created_at: string; jobs?: { title: string; leads?: { name: string } | null } | null;
};

type JobOption = { id: string; title: string };

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800", sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
};

export const CRMInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ job_id: "", invoice_number: "", amount: "", status: "draft" as string, due_date: "", paid_date: "", notes: "" });

  const load = async () => {
    const [{ data: inv }, { data: j }] = await Promise.all([
      supabase.from("invoices").select("*, jobs(title, leads(name))").order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title").order("title"),
    ]);
    setInvoices((inv as Invoice[]) || []);
    setJobOptions((j as JobOption[]) || []);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ job_id: "", invoice_number: "", amount: "", status: "draft", due_date: "", paid_date: "", notes: "" }); setEditId(null); };

  const save = async () => {
    if (!form.job_id || !form.invoice_number.trim()) { toast({ title: "Job and invoice # required", variant: "destructive" }); return; }
    const payload = {
      job_id: form.job_id, invoice_number: form.invoice_number,
      amount: form.amount ? parseFloat(form.amount) : 0,
      status: form.status as any, due_date: form.due_date || null,
      paid_date: form.paid_date || null, notes: form.notes || null,
    };
    if (editId) {
      const { error } = await supabase.from("invoices").update(payload).eq("id", editId);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Invoice updated" });
    } else {
      const { error } = await supabase.from("invoices").insert(payload);
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Invoice created" });
    }
    setOpen(false); resetForm(); load();
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Invoice deleted" }); load();
  };

  const startEdit = (inv: Invoice) => {
    setForm({ job_id: inv.job_id, invoice_number: inv.invoice_number, amount: String(inv.amount || ""), status: inv.status, due_date: inv.due_date || "", paid_date: inv.paid_date || "", notes: inv.notes || "" });
    setEditId(inv.id); setOpen(true);
  };

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (search && !inv.invoice_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit Invoice" : "New Invoice"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label>Job *</Label>
                <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                  <SelectContent>{jobOptions.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Invoice # *</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></div>
                <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                <div><Label>Paid Date</Label><Input type="date" value={form.paid_date} onChange={(e) => setForm({ ...form, paid_date: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              <Button onClick={save}>{editId ? "Update" : "Create"} Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">Invoice #</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Job</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Due</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No invoices found</td></tr>
            ) : filtered.map((inv) => (
              <tr key={inv.id} className="border-t border-border hover:bg-secondary/50 cursor-pointer" onClick={() => startEdit(inv)}>
                <td className="p-3 font-medium">{inv.invoice_number}</td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{inv.jobs?.title}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{inv.jobs?.leads?.name}</td>
                <td className="p-3">${Number(inv.amount).toLocaleString()}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[inv.status] || ""}`}>{inv.status}</span></td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{inv.due_date || "—"}</td>
                <td className="p-3 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); startEdit(inv); }}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-3 w-3" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete invoice "{inv.invoice_number}".</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteInvoice(inv.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
};