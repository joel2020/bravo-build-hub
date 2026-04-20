import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, CheckCircle2, Loader2, Info } from "lucide-react";
import { trackLeadSubmit, trackRebateEstimate } from "@/lib/analytics";

type RebateRange = { low: number; high: number };
type ProgramEstimate = {
  name: string;
  range: RebateRange;
  notes: string;
};

// NY rebate model — 2024-2025 program schedules.
// Estimates only. Final amounts depend on equipment, contractor enrollment,
// household income, system size, and current program funding.
//
// Key rules encoded:
// - NYSERDA Clean Heat is paid $/ton via the utility (Con Ed, National Grid, etc.) — NOT additive.
// - Federal 25C = 30% of project cost capped per category. Heat pumps & HPWHs share a $2,000 annual cap.
// - Comfort Home is a package incentive, requires participating contractor + qualifying measures.
// - EmPower+ / IRA HEEHRA can cover up to 100% / $8,000 for income-qualified households.

type SystemDef = {
  label: string;
  // NYSERDA Clean Heat $/ton (utility-delivered, varies by territory; midpoints used).
  cleanHeatPerTon: { low: number; high: number } | null;
  // Comfort Home eligibility (only applies as part of qualifying package).
  comfortHome: { low: number; high: number };
  // Federal 25C: cap and category. heatPumpGroup shares $2,000 annual cap with HPWH.
  fed25c: { cap: number; group: "heatPumpGroup" | "envelope" | "hpwh" | "none" };
  // HEEHRA cap for income-qualified households (IRA point-of-sale rebate, NY rollout via NYSERDA).
  heehraCap: number;
  // Typical project cost range — used for accurate 30% 25C calculation if user doesn't provide cost.
  typicalCost: { low: number; high: number };
  // Typical system size in tons (for $/ton math). null = N/A.
  typicalTons: { low: number; high: number } | null;
};

const SYSTEMS: Record<string, SystemDef> = {
  "ducted-heat-pump": {
    label: "Whole-home ducted heat pump",
    cleanHeatPerTon: { low: 800, high: 1500 },
    comfortHome: { low: 1000, high: 4000 },
    fed25c: { cap: 2000, group: "heatPumpGroup" },
    heehraCap: 8000,
    typicalCost: { low: 15000, high: 30000 },
    typicalTons: { low: 3, high: 5 },
  },
  "ductless-mini-split": {
    label: "Ductless mini-split heat pump",
    cleanHeatPerTon: { low: 800, high: 1500 },
    comfortHome: { low: 500, high: 2500 },
    fed25c: { cap: 2000, group: "heatPumpGroup" },
    heehraCap: 8000,
    typicalCost: { low: 5000, high: 15000 },
    typicalTons: { low: 1, high: 3 },
  },
  "water-heater": {
    label: "Water heater (hybrid heat pump)",
    cleanHeatPerTon: null,
    comfortHome: { low: 0, high: 0 },
    fed25c: { cap: 2000, group: "hpwh" },
    heehraCap: 1750,
    typicalCost: { low: 2500, high: 5000 },
    typicalTons: null,
  },
  "high-efficiency-furnace": {
    label: "High-efficiency gas furnace (95%+ AFUE)",
    cleanHeatPerTon: null,
    comfortHome: { low: 0, high: 0 },
    fed25c: { cap: 600, group: "envelope" },
    heehraCap: 0,
    typicalCost: { low: 4000, high: 8000 },
    typicalTons: null,
  },
  "high-efficiency-boiler": {
    label: "High-efficiency gas boiler (95%+ AFUE)",
    cleanHeatPerTon: null,
    comfortHome: { low: 0, high: 0 },
    fed25c: { cap: 600, group: "envelope" },
    heehraCap: 0,
    typicalCost: { low: 6000, high: 12000 },
    typicalTons: null,
  },
  "central-ac": {
    label: "Central air conditioning",
    cleanHeatPerTon: null,
    comfortHome: { low: 0, high: 0 },
    fed25c: { cap: 600, group: "envelope" },
    heehraCap: 0,
    typicalCost: { low: 6000, high: 12000 },
    typicalTons: null,
  },
};

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

const INCOME_TIERS = [
  { value: "above", label: "Above 80% Area Median Income (standard)" },
  { value: "moderate", label: "60-80% AMI (moderate income)" },
  { value: "low", label: "Below 60% AMI (low income)" },
];

const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP"),
});

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

const buildEstimates = (
  system: SystemKey,
  projectCost: number | null,
  tons: number | null,
  income: string,
): ProgramEstimate[] => {
  const s = SYSTEMS[system];
  const programs: ProgramEstimate[] = [];

  // 1. NYSERDA Clean Heat (delivered via utility — Con Ed, National Grid, etc.)
  if (s.cleanHeatPerTon) {
    const t = tons ?? ((s.typicalTons!.low + s.typicalTons!.high) / 2);
    programs.push({
      name: "NYSERDA Clean Heat (via utility)",
      range: {
        low: Math.round(t * s.cleanHeatPerTon.low),
        high: Math.round(t * s.cleanHeatPerTon.high),
      },
      notes: `${t} tons × $${s.cleanHeatPerTon.low}-$${s.cleanHeatPerTon.high}/ton. Delivered by Con Edison or your utility.`,
    });
  }

  // 2. Comfort Home (only if qualifying package — show as conditional)
  if (s.comfortHome.high > 0) {
    programs.push({
      name: "NYS Comfort Home (if qualifying package)",
      range: s.comfortHome,
      notes: "Requires participating contractor + 2+ qualifying measures (insulation, air sealing, heat pump).",
    });
  }

  // 3. Federal 25C — 30% of project cost up to cap
  if (s.fed25c.cap > 0) {
    const costLow = projectCost ?? s.typicalCost.low;
    const costHigh = projectCost ?? s.typicalCost.high;
    const low = Math.min(costLow * 0.3, s.fed25c.cap);
    const high = Math.min(costHigh * 0.3, s.fed25c.cap);
    const groupNote = s.fed25c.group === "heatPumpGroup" || s.fed25c.group === "hpwh"
      ? " Heat pumps & HPWH share a single $2,000 annual cap."
      : "";
    programs.push({
      name: "Federal 25C tax credit",
      range: { low: Math.round(low), high: Math.round(high) },
      notes: `30% of project cost, capped at ${fmt(s.fed25c.cap)}.${groupNote}`,
    });
  }

  // 4. IRA HEEHRA (income-qualified only)
  if (income !== "above" && s.heehraCap > 0) {
    const pct = income === "low" ? 1.0 : 0.5; // 100% for <60% AMI, 50% for 60-80% AMI
    const amount = Math.round(s.heehraCap * pct);
    programs.push({
      name: "IRA HEEHRA / EmPower+ (income-qualified)",
      range: { low: amount, high: amount },
      notes: `Up to ${pct * 100}% of cost, capped at ${fmt(amount)}. NY rollout via NYSERDA — availability varies.`,
    });
  }

  return programs;
};

export const RebateEstimator = () => {
  const { toast } = useToast();
  const [system, setSystem] = useState<SystemKey | "">("");
  const [homeType, setHomeType] = useState("");
  const [currentHeating, setCurrentHeating] = useState("");
  const [income, setIncome] = useState("above");
  const [projectCost, setProjectCost] = useState("");
  const [tons, setTons] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", zip: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sysDef = system ? SYSTEMS[system] : null;
  const showTons = sysDef?.cleanHeatPerTon != null;

  const parsedCost = projectCost ? Number(projectCost.replace(/[^0-9.]/g, "")) : null;
  const parsedTons = tons ? Number(tons) : null;

  const estimates = useMemo(
    () => (system ? buildEstimates(system, parsedCost, parsedTons, income) : []),
    [system, parsedCost, parsedTons, income],
  );

  // Total: sum non-conditional rebates only (Comfort Home is conditional, but we include in range)
  const total = useMemo(
    () => estimates.reduce(
      (acc, p) => ({ low: acc.low + p.range.low, high: acc.high + p.range.high }),
      { low: 0, high: 0 },
    ),
    [estimates],
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

    trackLeadSubmit("rebate_estimator_lead", {
      system_type: SYSTEMS[system].label,
      estimated_total: total.high,
    });
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
          <p className="text-sm text-muted-foreground">
            Top-of-funnel estimate based on current NY & federal programs. Not a quote.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
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

      {system && (
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <Label htmlFor="cost">Est. project cost <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="cost"
              type="text"
              inputMode="numeric"
              placeholder={`e.g. ${sysDef?.typicalCost.low.toLocaleString()}`}
              value={projectCost}
              onChange={(e) => setProjectCost(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">Used for accurate 30% federal credit math.</p>
          </div>
          {showTons && (
            <div>
              <Label htmlFor="tons">System size (tons) <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="tons"
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                placeholder={`e.g. ${sysDef?.typicalTons?.low}`}
                value={tons}
                onChange={(e) => setTons(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">NYSERDA Clean Heat pays $/ton.</p>
            </div>
          )}
          <div>
            <Label htmlFor="income">Household income</Label>
            <Select value={income} onValueChange={setIncome}>
              <SelectTrigger id="income" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INCOME_TIERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Unlocks EmPower+ / HEEHRA rebates.</p>
          </div>
        </div>
      )}

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

          <div className="flex items-start gap-2 bg-muted/50 border border-border rounded-md p-3 mb-5">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Estimates only — not a quote.</strong> Final amounts depend on equipment selected, contractor enrollment in each program, system size, household income verification, your utility territory, and current program funding levels. NYSERDA Clean Heat is delivered through your utility (Con Edison, National Grid, etc.) and is not stacked on top of utility rebates. Federal 25C heat pump and heat pump water heater credits share a single $2,000 annual cap. We'll verify your exact eligibility when we quote your project.
            </p>
          </div>

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
