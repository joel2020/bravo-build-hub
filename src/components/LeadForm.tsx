import { useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICES } from "@/lib/site";
import { trackEvent, trackLeadSubmit } from "@/lib/analytics";
import { captureLead } from "@/lib/leadCapture";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(5, "Please add a short message"),
  company: z.string().optional(),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export const LeadForm = () => {
  const submittedAtStart = useMemo(() => Date.now(), []);
  const [values, setValues] = useState({ name: "", phone: "", email: "", service: "", message: "", company: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof typeof values, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const errs: Errors = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof Errors] = i.message; });
      setErrors(errs);
      return;
    }

    // Basic anti-spam: hidden field + minimum fill time.
    const elapsedMs = Date.now() - submittedAtStart;
    if (result.data.company || elapsedMs < 2000) {
      trackEvent("lead_spam_blocked", { form: "contact_lead_form", elapsed_ms: elapsedMs });
      setSubmitted(true);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    const { error } = await captureLead({
      fullName: result.data.name,
      phone: result.data.phone,
      email: result.data.email,
      serviceRequested: result.data.service,
      message: result.data.message,
      source: "contact_form",
      sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      sourceReferrer: typeof document !== "undefined" ? document.referrer : undefined,
      honeypotValue: result.data.company,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("We couldn't submit your request right now. Please call us directly.");
      return;
    }

    trackLeadSubmit("contact_lead_form", { service: result.data.service });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Thanks — we got your request.</h3>
        <p className="text-muted-foreground">A member of the Bravo Mechanical team will reach out shortly. For urgent service, please call us directly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-5">
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="company">Company</Label>
        <Input id="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={(e) => update("company", e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={values.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5" />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" value={values.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1.5" />
          {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5" />
        {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="service">Service needed</Label>
        <Select value={values.service} onValueChange={(v) => update("service", v)}>
          <SelectTrigger id="service" className="mt-1.5"><SelectValue placeholder="Select a service" /></SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => <SelectItem key={s.slug} value={s.title}>{s.title}</SelectItem>)}
            <SelectItem value="Other">Other / Not sure</SelectItem>
          </SelectContent>
        </Select>
        {errors.service && <p className="text-destructive text-xs mt-1">{errors.service}</p>}
      </div>
      <div>
        <Label htmlFor="message">How can we help?</Label>
        <Textarea id="message" rows={5} value={values.message} onChange={(e) => update("message", e.target.value)} className="mt-1.5" />
        {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Request My Estimate"}
      </Button>
    </form>
  );
};
