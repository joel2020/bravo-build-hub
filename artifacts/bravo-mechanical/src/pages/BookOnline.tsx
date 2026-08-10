import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, CalendarDays, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackLeadSubmit } from "@/lib/analytics";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

const WINDOWS = ["Morning (8am–11am)", "Midday (11am–2pm)"];
const SERVICES_OFFERED = [
  "AC Repair", "AC Installation", "Boiler Repair", "Boiler Installation",
  "Furnace Repair", "Furnace Installation", "Heat Pump / Mini-Split",
  "Water Heater", "Maintenance / Tune-Up", "Something else",
];

type BookingForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  service: string;
  message: string;
  date: string;
  window: string;
};

type BookingErrorField = "name" | "phone" | "service" | "date" | "window";
type BookingErrors = Partial<Record<BookingErrorField, string>>;

const BOOKING_ERROR_ORDER: BookingErrorField[] = ["name", "phone", "service", "date", "window"];

export const validateBooking = (form: BookingForm): BookingErrors => {
  const errors: BookingErrors = {};

  if (!form.name.trim()) errors.name = "Enter your name.";
  if (form.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a mobile phone number with at least 10 digits.";
  }
  if (!form.service) errors.service = "Select the service you need.";
  if (!form.date) errors.date = "Choose a preferred day.";
  if (!form.window) errors.window = "Choose a time window.";

  return errors;
};

// Next 14 selectable days. Same-day requests should call — we route them to the phone.
const nextDays = () => {
  const days: { iso: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 14; i++) {
    d.setDate(d.getDate() + 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ iso, label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) });
  }
  return days;
};

const BookOnline = () => {
  useSeo({
    title: "Book HVAC Service Online | Bravo Mechanical Westchester",
    description: "Pick a day and time window and book your Westchester HVAC visit online — repairs, installs, tune-ups, and estimates. We confirm by text. No phone call needed.",
    canonical: `${SITE.siteUrl}/book`,
  });

  const days = useMemo(nextDays, []);
  const [form, setForm] = useState<BookingForm>({ name: "", phone: "", email: "", address: "", service: "", message: "", date: "", window: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<BookingErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLFieldSetElement>(null);
  const dateRef = useRef<HTMLFieldSetElement>(null);
  const windowRef = useRef<HTMLFieldSetElement>(null);

  const isDirty = Object.values(form).some((value) => value.trim().length > 0);
  useUnsavedChangesGuard(isDirty && !submitting && !done);

  const update = (key: keyof BookingForm, value: string) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);

    if (BOOKING_ERROR_ORDER.includes(key as BookingErrorField)) {
      const field = key as BookingErrorField;
      if (!validateBooking(nextForm)[field]) {
        setErrors((current) => {
          if (!current[field]) return current;
          const nextErrors = { ...current };
          delete nextErrors[field];
          return nextErrors;
        });
      }
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    const nextErrors = validateBooking(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || submitting) {
      setError("Complete your name, mobile phone, service, day, and time window.");
      const firstError = BOOKING_ERROR_ORDER.find((field) => nextErrors[field]);
      const targets = {
        name: nameRef.current,
        phone: phoneRef.current,
        service: serviceRef.current,
        date: dateRef.current,
        window: windowRef.current,
      };
      if (firstError) targets[firstError]?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    const consentStamp = `[Consent] SMS/email contact agreed at ${new Date().toISOString()} (form: online_booking)`;
    // No .select() after insert: anon can insert leads but not read them back.
    const { error: insertError } = await supabase.from("leads").insert({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      service: form.service,
      message: form.message.trim() || null,
      status: "new" as never,
      source: "online_booking" as never,
      preferred_date: form.date,
      preferred_time: form.window,
      notes: consentStamp,
    } as never);
    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong — please call or text us instead.");
      return;
    }
    trackLeadSubmit("online_booking", { service: form.service, source: "online_booking" });
    setDone(true);
  };

  if (done) {
    const day = days.find((d) => d.iso === form.date);
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-xl text-center">
          <CheckCircle2 className="h-14 w-14 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-3">You're on the board.</h1>
          <p className="text-muted-foreground mb-2">
            Requested: <strong>{day?.label} — {form.window}</strong>
          </p>
          <p className="text-muted-foreground mb-8">
            We just texted you a confirmation and will follow up to lock in the exact window. Need it sooner?
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Call {SITE.phone}</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        eyebrow="Book Online"
        title="Pick a Day. Pick a Window. Done."
        subtitle="Book your Westchester HVAC visit in under a minute — no phone call needed. We confirm the exact time by text."
        compact
        rightSlot={
          <aside aria-label="Online booking summary" className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                <span className="font-semibold text-foreground">About 1 minute</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                <span className="font-semibold text-foreground">Confirmation by text</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                <span className="font-semibold text-foreground">No payment required</span>
              </li>
            </ul>
          </aside>
        }
      />

      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <form onSubmit={submit} noValidate className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-name">Name *</label>
              <input ref={nameRef} id="bk-name" name="name" required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "booking-name-error" : undefined} className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" />
              {errors.name && <p id="booking-name-error" role="alert" className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-phone">Mobile phone *</label>
              <input ref={phoneRef} id="bk-phone" name="phone" required minLength={10} inputMode="tel" type="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "booking-phone-error" : undefined} className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" placeholder="(914) 555-1234" />
              {errors.phone && <p id="booking-phone-error" role="alert" className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-email">Email</label>
              <input id="bk-email" name="email" type="email" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-address">Service address</label>
              <input id="bk-address" name="address" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.address} onChange={(e) => update("address", e.target.value)} autoComplete="street-address" placeholder="Street, town" />
            </div>
          </div>

          <fieldset ref={serviceRef} tabIndex={-1} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? "booking-service-error" : undefined}>
            <legend className="text-sm font-bold block mb-2">What do you need? *</legend>
            <div className="flex flex-wrap gap-2">
              {SERVICES_OFFERED.map((s) => (
                <button key={s} type="button" onClick={() => update("service", s)}
                  aria-pressed={form.service === s}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${form.service === s ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {s}
                </button>
              ))}
            </div>
            <input type="hidden" name="service" value={form.service} />
            {errors.service && <p id="booking-service-error" role="alert" className="text-destructive text-xs mt-2">{errors.service}</p>}
          </fieldset>

          <fieldset ref={dateRef} tabIndex={-1} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "booking-date-error" : undefined}>
            <legend className="text-sm font-bold mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Pick a day *</legend>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <button key={d.iso} type="button" onClick={() => update("date", d.iso)}
                  aria-pressed={form.date === d.iso}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${form.date === d.iso ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="date" value={form.date} />
            {errors.date && <p id="booking-date-error" role="alert" className="text-destructive text-xs mt-2">{errors.date}</p>}
            <p className="text-xs text-muted-foreground mt-2">Need someone today? <a href={SITE.phoneHref} className="text-accent font-semibold hover:underline">Call {SITE.phone}</a> — same-day slots go by phone.</p>
          </fieldset>

          <fieldset ref={windowRef} tabIndex={-1} aria-invalid={Boolean(errors.window)} aria-describedby={errors.window ? "booking-window-error" : undefined}>
            <legend className="text-sm font-bold block mb-2">Time window *</legend>
            <div className="flex flex-wrap gap-2">
              {WINDOWS.map((w) => (
                <button key={w} type="button" onClick={() => update("window", w)}
                  aria-pressed={form.window === w}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${form.window === w ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {w}
                </button>
              ))}
            </div>
            <input type="hidden" name="window" value={form.window} />
            {errors.window && <p id="booking-window-error" role="alert" className="text-destructive text-xs mt-2">{errors.window}</p>}
          </fieldset>

          <div>
            <label className="text-sm font-bold block mb-1" htmlFor="bk-message">Anything we should know?</label>
            <textarea id="bk-message" name="message" rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="What's the system doing? Brand, age, access notes…" />
          </div>

          <p id="booking-guidance" aria-live="polite" className={`text-sm font-semibold ${error ? "text-destructive" : "text-muted-foreground"}`}>
            {error || (attempted ? "Complete all required booking choices." : "Required fields are marked with an asterisk.")}
          </p>

          <Button type="submit" size="lg" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            {submitting ? "Booking…" : "Book My Visit"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By tapping "Book My Visit" you agree that Bravo Mechanical LLC may contact you by phone, text message, and email about your service request, including via automated messages. We'll confirm the exact time by text from {SITE.smsPhone}. Consent is not a condition of service. Message frequency varies; message and data rates may apply. Reply STOP to opt out, HELP for help. See our <Link to="/privacy-policy" className="underline hover:text-accent">Privacy Policy</Link> and <Link to="/terms-and-conditions" className="underline hover:text-accent">SMS Terms</Link>.
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Prefer to talk? <a href={SITE.phoneHref} className="text-accent font-semibold hover:underline">Call {SITE.phone}</a> or <a href={SITE.smsHref} className="text-accent font-semibold hover:underline"><MessageSquare className="inline h-3.5 w-3.5" /> text us at {SITE.smsPhone}</a>.
        </div>
        <div className="mt-2 text-center text-sm">
          <Link to="/contact" className="text-accent font-semibold hover:underline">Just want an estimate? Use the request form →</Link>
        </div>
      </section>
    </Layout>
  );
};

export default BookOnline;
