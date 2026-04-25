import { useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICES } from "@/lib/site";
import { trackLeadSubmit } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(5, "Please add a short message"),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

type LeadFormProps = {
  source?: "contact_form" | "rebate_estimator" | "phone" | "referral" | "google" | "other";
  defaultService?: string;
  defaultMessage?: string;
  city?: string;
  urgency?: string;
};

export const LeadForm = ({
  source = "contact_form",
  defaultService = "",
  defaultMessage = "",
  city,
  urgency,
}: LeadFormProps) => {
  const { toast } = useToast();
  const [values, setValues] = useState({ name: "", phone: "", email: "", service: defaultService, message: defaultMessage });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
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
    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from("leads").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      source: source as any,
      status: "new" as any,
      notes: [
        `Service requested: ${result.data.service}`,
        city ? `City: ${city}` : null,
        urgency ? `Urgency: ${urgency}` : null,
        `Message: ${result.data.message}`,
      ].filter(Boolean).join(" | "),
    });

    setSubmitting(false);
    if (error) {
      toast({
        title: "Could not submit request",
        description: "Please try again or call us directly for immediate help.",
        variant: "destructive",
      });
      return;
    }

    trackLeadSubmit("contact_lead_form", { service: result.data.service, source });
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
      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        {submitting ? "Submitting..." : "Request My Estimate"}
      </Button>
    </form>
  );
};
