import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";

type RebateRange = { low: number; high: number };
type ProgramEstimate = {
  name: string;
  range: RebateRange;
  notes: string;
};

// Public-program rebate ranges (typical for NY residential, 2024-2025 schedules).
// These are estimates only — final amounts depend on equipment, contractor, and program funding.
const SYSTEMS = {
  "ducted-heat-pump": {
    label: "Whole-home ducted heat pump",
    nyserda: { low: 1500, high: 3000 },
    comfortHome: { low: 1000, high: 4000 },
    federal25c: { low: 2000, high: 2000 },
    coned: { low: 500, high: 1000 },
  },
  "ductless-mini-split": {
    label: "Ductless mini-split heat pump",
    nyserda: { low: 1000, high: 2500 },
    comfortHome: { low: 500, high: 2500 },
    federal25c: { low: 2000, high: 2000 },
    coned: { low: 500, high: 1000 },
  },
  "heat-pump-water-heater": {
    label: "Heat pump water heater",
    nyserda: { low: 700, high: 1000 },
    comfortHome: { low: 0, high: 0 },
    federal25c: { low: 600, high: 600 },
    coned: { low: 0, high: 250 },
  },
  "high-efficiency-furnace": {
    label: "High-efficiency gas furnace (95%+ AFUE)",
    nyserda: { low: 0, high: 0 },
    comfortHome: { low: 0, high: 0 },
    federal25c: { low: 600, high: 600 },
    coned: { low: 0, high: 0 },
  },
  "high-efficiency-boiler": {
    label: "High-efficiency gas boiler (95%+ AFUE)",
    nyserda: { low: 0, high: 0 },
    comfortHome: { low: 0, high: 0 },
    federal25c: { low: 600, high: 600 },
    coned: { low: 0, high: 0 },
  },
  "central-ac": {
    label: "Central air conditioning",
    nyserda: { low: 0, high: 0 },
    comfortHome: { low: 0, high: 0 },
    federal25c: { low: 600, high: 600 },
    coned: { low: 0, high: 250 },
  },
} as const;

type SystemKey = keyof typeof SYSTEMS;

const HOME_TYPES = [
  { value: "single-family", label: "Single-family home" },
  { value: "multi-family", label: "2-4 unit multi-family" },
  { value: "condo", label: "Condo or townhouse" },
];

const HEATING_FUELS = [
  { value: "gas", label: "Natural gas" },
  { value: "oil", label: "Oil" },
  { value: "electric", label: "Electric resistance / baseboard" },
  { value: "propane", label: "Propane" },
];

const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP"),
});

const fmt = (n: number) => `$${n.toLocaleString()}`;

const buildEstimates = (system: SystemKey): ProgramEstimate[] => {
  const s = SYSTEMS[system];
  return [
    { name: "NYSERDA Clean Heat", range: s.nyserda, notes: "Heat pump rebates via your utility" },
    { name: "NYS Comfort Home", range: s.comfortHome, notes: "Whole-home electrification package" },
    { name: "Federal 25C tax credit", range: s.federal25c, notes: "30% of project cost up to cap" },
    { name: "Con Edison rebates", range: s.coned, notes: "Local utility instant rebates" },
  ].filter((p) => p.range.high > 0);
};

export const RebateEstimator = () => {
  const { toast } = useToast();
  const [system, setSystem] = useState<SystemKey | "">("");
  const [homeType, setHomeType] = useState("");
  const [currentHeating, setCurrentHeating] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", zip: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const estimates = useMemo(() => (system ? buildEstimates(system) : []), [system]);
  const total = useMemo(
    () => estimates.reduce(
      (acc, p) => ({ low: acc.low + p.range.low, high: acc.high + p.range.high }),
      { low: 0, high: 0 }
    ),
    [estimates]
  );

  const showResults = system && homeType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!system || !homeType) return;

    const result = leadSchema.safeParse(lead);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from("rebate_estimates").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      zip: result.data.zip,
      system_type: SYSTEMS[system].label,
      home_type: homeType,
      current_heating: currentHeating || null,
      estimated_total: total.high,
      programs: estimates.map((p) => ({ name: p.name, low: p.range.low, high: p.range.high })),
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Estimate request received",
      description: "We'll follow up within 1 business day.",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg md:text-xl">NY rebate estimator</h3>
          <p className="text-sm text-muted-foreground">See what your project may qualify for in under 30 seconds.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div>
          <Label htmlFor="system">System you're considering</Label>
          <Select value={system} onValueChange={(v) => setSystem(v as SystemKey)}>
            <SelectTrigger id="system" className="mt-1.5"><SelectValue placeholder="Choose system" /></SelectTrigger>
            <SelectContent>
              {(Object.keys(SYSTEMS) as SystemKey[]).map((k) => (
                <SelectItem key={k} value={k}>{SYSTEMS[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="home">Home type</Label>
          <Select value={homeType} onValueChange={setHomeType}>
            <SelectTrigger id="home" className="mt-1.5"><SelectValue placeholder="Choose home type" /></SelectTrigger>
            <SelectContent>
              {HOME_TYPES.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="heating">Current heating fuel <span className="text-muted-foreground">(optional)</span></Label>
          <Select value={currentHeating} onValueChange={setCurrentHeating}>
            <SelectTrigger id="heating" className="mt-1.5"><SelectValue placeholder="Choose fuel" /></SelectTrigger>
            <SelectContent>
              {HEATING_FUELS.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showResults && estimates.length > 0 && (
        <div className="border-t border-border pt-5">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Estimated total rebates</div>
            <div className="text-2xl md:text-3xl font-extrabold text-accent">
              {total.low === total.high ? fmt(total.high) : `${fmt(total.low)} – ${fmt(total.high)}`}
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {estimates.map((p) => (
              <li key={p.name} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.notes}</div>
                </div>
                <div className="font-bold whitespace-nowrap">
                  {p.range.low === p.range.high ? fmt(p.range.high) : `${fmt(p.range.low)} – ${fmt(p.range.high)}`}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mb-5">
            Estimates only. Final rebate amounts depend on equipment selected, contractor enrollment, household income, and current program funding.
          </p>

          {!showLeadForm && !submitted && (
            <Button onClick={() => setShowLeadForm(true)} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Get a detailed quote
            </Button>
          )}
        </div>
      )}

      {showResults && estimates.length === 0 && (
        <div className="border-t border-border pt-5 text-sm text-muted-foreground">
          No major rebate programs apply to this system, but federal tax credits or local promos may still help — request a quote and we'll check.
        </div>
      )}

      {showLeadForm && !submitted && (
        <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-border grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lead-name">Name</Label>
            <Input id="lead-name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} maxLength={100} className="mt-1.5" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="lead-email">Email</Label>
            <Input id="lead-email" type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} maxLength={255} className="mt-1.5" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="lead-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="lead-phone" type="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} maxLength={30} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="lead-zip">ZIP code</Label>
            <Input id="lead-zip" value={lead.zip} onChange={(e) => setLead({ ...lead, zip: e.target.value })} maxLength={10} className="mt-1.5" />
            {errors.zip && <p className="text-xs text-destructive mt-1">{errors.zip}</p>}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : "Send my detailed quote request"}
            </Button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="mt-5 pt-5 border-t border-border flex items-start gap-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Thanks! Your request is in.</div>
            <div className="text-muted-foreground">We'll follow up within 1 business day with a detailed rebate breakdown and quote.</div>
          </div>
        </div>
      )}
    </div>
  );
};
