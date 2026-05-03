import { useMemo, useState } from "react";
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
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted before submitting" }) }),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

type TrackingPayload = {
  source_page: string | null;
  landing_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
};

const getUrlParam = (params: URLSearchParams, key: string) => params.get(key) || null;

const buildLeadNotes = (service: string, message: string, city?: string, urgency?: string) =>
  [
    `Service requested: ${service}`,
    city ? `City: ${city}` : null,
    urgency ? `Urgency: ${urgency}` : null,
    `Message: ${message}`,
  ].filter(Boolean).join(" | ");

const queueOwnerNotification = async (_leadId?: string) => {
  // Placeholder hook: connect to an edge function, webhook, or Zapier route.
};

const queueCustomerAutoReply = async (_email?: string) => {
  // Placeholder hook: connect to transactional email pipeline.
};

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
  const [values, setValues] = useState({ name: "", phone: "", email: "", service: defaultService, message: defaultMessage, consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tracking = useMemo<TrackingPayload>(() => {
    if (typeof window === "undefined") {
      return {
        source_page: null,
        landing_url: null,
        referrer: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        gclid: null,
        fbclid: null,
      };
    }

    const params = new URLSearchParams(window.location.search);
    return {
      source_page: window.location.pathname,
      landing_url: window.location.href,
      referrer: document.referrer || null,
      utm_source: getUrlParam(params, "utm_source"),
      utm_medium: getUrlParam(params, "utm_medium"),
      utm_campaign: getUrlParam(params, "utm_campaign"),
      utm_term: getUrlParam(params, "utm_term"),
      utm_content: getUrlParam(params, "utm_content"),
      gclid: getUrlParam(params, "gclid"),
      fbclid: getUrlParam(params, "fbclid"),
    };
  }, []);

  const update = <K extends keyof typeof values>(k: K, v: (typeof values)[K]) =>
    setValues((p) => ({ ...p, [k]: v }));

  const findRecentDuplicateLeadId = async (phone: string, email: string) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const candidateIds: string[] = [];

    if (phone.trim()) {
      const { data } = await supabase
        .from("leads")
        .select("id, created_at")
        .eq("phone", phone.trim())
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data?.[0]?.id) candidateIds.push(data[0].id);
    }

    if (email.trim()) {
      const { data } = await supabase
        .from("leads")
        .select("id, created_at")
        .eq("email", email.trim())
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data?.[0]?.id) candidateIds.push(data[0].id);
    }

    return candidateIds[0] || null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const errs: Errors = {};
      result.error.issues.forEach((i) => {
        errs[i.path[0] as keyof Errors] = i.message;
      });
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const leadPayload = {
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      source: source as any,
      status: "new" as any,
      service: result.data.service,
      city: city || null,
      urgency: urgency || null,
      source_page: tracking.source_page,
      landing_url: tracking.landing_url,
      referrer: tracking.referrer,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_term: tracking.utm_term,
      utm_content: tracking.utm_content,
      gclid: tracking.gclid,
      fbclid: tracking.fbclid,
    };

    const consentStamp = `[Consent] SMS/email contact agreed at ${new Date().toISOString()} (form: ${source})`;
  const newNotes = `${buildLeadNotes(result.data.service, result.data.message, city, urgency)} | ${consentStamp}`;
    const duplicateLeadId = await findRecentDuplicateLeadId(result.data.phone, result.data.email);

    let leadId: string | undefined;
    let duplicate = false;
    let error: Error | null = null;

    if (duplicateLeadId) {
      duplicate = true;
      const { data: existingLead, error: existingLeadError } = await supabase
        .from("leads")
        .select("id, notes")
        .eq("id", duplicateLeadId)
        .single();

      if (existingLeadError) {
        error = existingLeadError;
      } else {
        const mergedNotes = [existingLead?.notes, `[Follow-up ${new Date().toISOString()}] ${newNotes}`]
          .filter(Boolean)
          .join(" || ");

        const { error: updateError } = await supabase
          .from("leads")
          .update({
            ...leadPayload,
            notes: mergedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", duplicateLeadId);

        if (updateError) error = updateError;
        leadId = duplicateLeadId;
      }
    } else {
      const { data: insertedLead, error: insertError } = await supabase
        .from("leads")
        .insert({ ...leadPayload, notes: newNotes })
        .select("id")
        .single();
      error = insertError;
      leadId = insertedLead?.id;
    }

    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not submit request",
        description: "Please try again or call us directly for immediate help.",
        variant: "destructive",
      });
      return;
    }

    trackLeadSubmit("contact_lead_form", {
      service: result.data.service,
      source,
      duplicate,
      ...tracking,
    });
    await queueOwnerNotification(leadId);
    await queueCustomerAutoReply(result.data.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Thanks — we got your request.</h3>
        <p className="text-muted-foreground">A member of the Bravo Mechanical team will reach out shortly. If you need emergency HVAC service, call us now at (914) 361-9142 for fastest dispatch.</p>
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
      <div className="rounded-md border border-border bg-secondary/40 p-3">
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent"
            aria-describedby="consent-help"
          />
          <span id="consent-help">
            I agree that Bravo Mechanical LLC may contact me by phone, text message, and email about my service request, including via automated messages. Consent is not a condition of service. Message and data rates may apply. Reply STOP to opt out, HELP for help. See our{" "}
            <a href="/privacy-policy" className="font-semibold text-foreground underline hover:text-accent">Privacy Policy</a>
            {" "}and{" "}
            <a href="/terms-and-conditions" className="font-semibold text-foreground underline hover:text-accent">SMS Terms</a>.
          </span>
        </label>
        {errors.consent && <p className="text-destructive text-xs mt-2">{errors.consent}</p>}
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        {submitting ? "Submitting..." : "Request My Estimate"}
      </Button>
    </form>
  );
};
