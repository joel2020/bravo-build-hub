import { useMemo, useRef, useState } from "react";
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
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

// All user-facing form copy in both languages. The submission pipeline is
// identical either way — Spanish leads land in the same CRM inbox.
type FormStrings = Record<
  | "errName" | "errPhone" | "errEmail" | "errService" | "errMessage" | "errConsent"
  | "name" | "phone" | "email" | "service" | "servicePlaceholder" | "serviceOther"
  | "message" | "consent" | "privacy" | "and" | "smsTerms" | "submit" | "submitting"
  | "successTitle" | "successBody" | "errorTitle" | "errorBody",
  string
>;

const FORM_STRINGS: Record<"en" | "es", FormStrings> = {
  en: {
    errName: "Please enter your name",
    errPhone: "Please enter a valid phone number",
    errEmail: "Please enter a valid email",
    errService: "Please select a service",
    errMessage: "Please add a short message",
    errConsent: "Please agree to be contacted before submitting",
    name: "Full name",
    phone: "Phone",
    email: "Email",
    service: "Service needed",
    servicePlaceholder: "Select a service",
    serviceOther: "Other / Not sure",
    message: "How can we help?",
    consent: "I agree that Bravo Mechanical LLC may contact me by phone, text message, and email about my service request, including via automated messages. Consent is not a condition of service. Message and data rates may apply. Reply STOP to opt out, HELP for help. See our",
    privacy: "Privacy Policy",
    and: "and",
    smsTerms: "SMS Terms",
    submit: "Request My Estimate",
    submitting: "Submitting...",
    successTitle: "Thanks — we got your request.",
    successBody: "A member of the Bravo Mechanical team will reach out shortly. If you need emergency HVAC service, call us now at (914) 361-9142 for fastest dispatch.",
    errorTitle: "Could not submit request",
    errorBody: "Please try again or call us directly for immediate help.",
  },
  es: {
    errName: "Por favor escriba su nombre",
    errPhone: "Por favor escriba un número de teléfono válido",
    errEmail: "Por favor escriba un correo electrónico válido",
    errService: "Por favor seleccione un servicio",
    errMessage: "Por favor agregue un mensaje corto",
    errConsent: "Por favor acepte ser contactado antes de enviar",
    name: "Nombre completo",
    phone: "Teléfono",
    email: "Correo electrónico",
    service: "Servicio que necesita",
    servicePlaceholder: "Seleccione un servicio",
    serviceOther: "Otro / No estoy seguro",
    message: "¿Cómo podemos ayudarle?",
    consent: "Acepto que Bravo Mechanical LLC me contacte por teléfono, mensaje de texto y correo electrónico sobre mi solicitud de servicio, incluso mediante mensajes automáticos. El consentimiento no es condición para recibir servicio. Pueden aplicar tarifas de mensajes y datos. Responda STOP para cancelar, HELP para ayuda. Vea nuestra",
    privacy: "Política de Privacidad",
    and: "y",
    smsTerms: "Términos de SMS",
    submit: "Solicitar Mi Presupuesto",
    submitting: "Enviando...",
    successTitle: "Gracias — recibimos su solicitud.",
    successBody: "Un miembro del equipo de Bravo Mechanical le contactará en breve. Si necesita servicio de emergencia, llámenos ahora al (914) 361-9142.",
    errorTitle: "No se pudo enviar la solicitud",
    errorBody: "Por favor intente de nuevo o llámenos directamente para ayuda inmediata.",
  },
};

const buildSchema = (t: FormStrings) =>
  z.object({
    name: z.string().min(2, t.errName),
    phone: z.string().min(7, t.errPhone),
    email: z.string().email(t.errEmail),
    service: z.string().min(1, t.errService),
    message: z.string().min(5, t.errMessage),
    consent: z.literal(true, { errorMap: () => ({ message: t.errConsent }) }),
  });

type Errors = Partial<Record<"name" | "phone" | "email" | "service" | "message" | "consent", string>>;

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
  lang?: "en" | "es";
};

export const LeadForm = ({
  source = "contact_form",
  defaultService = "",
  defaultMessage = "",
  city,
  urgency,
  lang = "en",
}: LeadFormProps) => {
  const t = FORM_STRINGS[lang];
  const schema = useMemo(() => buildSchema(t), [t]);
  const { toast } = useToast();
  const [values, setValues] = useState({ name: "", phone: "", email: "", service: defaultService, message: defaultMessage, consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLButtonElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const isDirty = values.consent || [values.name, values.phone, values.email, values.service, values.message]
    .some((value) => value.trim().length > 0);
  useUnsavedChangesGuard(isDirty && !submitting && !submitted);

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
      const firstError = result.error.issues[0]?.path[0] as keyof Errors | undefined;
      const targets = {
        name: nameRef.current,
        phone: phoneRef.current,
        email: emailRef.current,
        service: serviceRef.current,
        message: messageRef.current,
        consent: consentRef.current,
      };
      if (firstError) targets[firstError]?.focus();
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

    const consentStamp = `[Consent] SMS/email contact agreed at ${new Date().toISOString()} (form: ${source}, lang: ${lang})`;
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
      // Insert WITHOUT .select(): anon can insert leads but has no SELECT policy,
      // so a RETURNING clause makes RLS reject the whole insert. Generate the id
      // client-side instead of reading it back.
      const newLeadId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from("leads")
        .insert({ ...leadPayload, id: newLeadId, notes: newNotes });
      error = insertError;
      leadId = newLeadId;
    }

    if (error) {
      setSubmitting(false);
      toast({
        title: t.errorTitle,
        description: t.errorBody,
        variant: "destructive",
      });
      return;
    }

    // GA4 EventParams disallows `null`. Coerce nullable tracking fields to undefined
    // so they're omitted from the analytics payload rather than sent as the string "null".
    const trackingForGa = Object.fromEntries(
      Object.entries(tracking).map(([k, v]) => [k, v ?? undefined])
    );
    trackLeadSubmit("contact_lead_form", {
      service: result.data.service,
      source,
      duplicate,
      ...trackingForGa,
    });
    await queueOwnerNotification(leadId);
    await queueCustomerAutoReply(result.data.email);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">{t.successTitle}</h3>
        <p className="text-muted-foreground">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">{t.name}</Label>
          <Input ref={nameRef} id="name" name="name" autoComplete="name" required minLength={2} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} value={values.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5" />
          {errors.name && <p id="name-error" role="alert" className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="phone">{t.phone}</Label>
          <Input ref={phoneRef} id="phone" name="phone" type="tel" autoComplete="tel" required minLength={7} inputMode="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} value={values.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1.5" />
          {errors.phone && <p id="phone-error" role="alert" className="text-destructive text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input ref={emailRef} id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} value={values.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5" />
        {errors.email && <p id="email-error" role="alert" className="text-destructive text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="service">{t.service}</Label>
        <Select name="service" required value={values.service} onValueChange={(v) => update("service", v)}>
          <SelectTrigger ref={serviceRef} id="service" aria-required="true" aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? "service-error" : undefined} className="mt-1.5"><SelectValue placeholder={t.servicePlaceholder} /></SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => <SelectItem key={s.slug} value={s.title}>{s.title}</SelectItem>)}
            <SelectItem value="Other">{t.serviceOther}</SelectItem>
          </SelectContent>
        </Select>
        {errors.service && <p id="service-error" role="alert" className="text-destructive text-xs mt-1">{errors.service}</p>}
      </div>
      <div>
        <Label htmlFor="message">{t.message}</Label>
        <Textarea ref={messageRef} id="message" name="message" autoComplete="off" required minLength={5} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} rows={5} value={values.message} onChange={(e) => update("message", e.target.value)} className="mt-1.5" />
        {errors.message && <p id="message-error" role="alert" className="text-destructive text-xs mt-1">{errors.message}</p>}
      </div>
      <div className="rounded-md border border-border bg-secondary/40 p-3">
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground cursor-pointer">
          <input
            ref={consentRef}
            type="checkbox"
            name="consent"
            required
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-help consent-error" : "consent-help"}
          />
          <span id="consent-help">
            {t.consent}{" "}
            <a href="/privacy-policy" className="font-semibold text-foreground underline hover:text-accent">{t.privacy}</a>
            {" "}{t.and}{" "}
            <a href="/terms-and-conditions" className="font-semibold text-foreground underline hover:text-accent">{t.smsTerms}</a>.
          </span>
        </label>
        {errors.consent && <p id="consent-error" role="alert" className="text-destructive text-xs mt-2">{errors.consent}</p>}
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        {submitting ? t.submitting : t.submit}
      </Button>
    </form>
  );
};
