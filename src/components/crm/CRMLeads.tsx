import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";

const STATUSES = ["new", "contacted", "qualified", "quoted", "won", "lost"] as const;
const SOURCES = ["contact_form", "rebate_estimator", "phone", "referral", "google", "other"] as const;

type Lead = {
  id: string; name: string; email: string | null; phone: string | null;
  address: string | null; source: string; status: string; notes: string | null;
  created_at: string; updated_at: string;
};

const statusColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-800", contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800", quoted: "bg-orange-100 text-orange-800",
  won: "bg-green-100 text-green-800", lost: "bg-red-100 text-red-800",
};

export const CRMLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", source: "other" as string, status: "new" as string, notes: "" });

  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: "", email: "", phone: "", address: "", source: "other", status: "new", notes: "" }); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const payload = { name: form.name, email: form.email || null, phone: form.phone || null, address: form.address || null, source: form.source as any, status: form.status as any, notes: form.notes };
    if (editId) {
      const { error } = await supabase.from("leads").update(payload).eq("id", editId);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lead updated" });
    } else {
      const { error } = await supabase.from("leads").insert(payload);
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lead created" });
    }
    setOpen(false); resetForm(); load();
  };

  const startEdit = (l: Lead) => {
    setForm({ name: l.name, email: l.email || "", phone: l.phone || "", address: l.address || "", source: l.source, status: l.status, notes: l.notes || "" });
    setEditId(l.id); setOpen(true);
  };

  const filtered = leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !(l.email || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" />Add Lead</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Source</Label>
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
              <Button onClick={save}>{editId ? "Update" : "Create"} Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Phone</th>
              <th className="text-left p-3 font-medium">Source</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Created</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No leads found</td></tr>
            ) : filtered.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-secondary/50 cursor-pointer" onClick={() => startEdit(l)}>
                <td className="p-3 font-medium">{l.name}</td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{l.email}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{l.phone}</td>
                <td className="p-3"><Badge variant="outline" className="text-xs">{l.source.replace(/_/g, " ")}</Badge></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[l.status] || ""}`}>{l.status}</span></td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                <td className="p-3"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); startEdit(l); }}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
};