import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, CalendarDays, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackLeadSubmit } from "@/lib/analytics";

const WINDOWS = ["Morning (8am–12pm)", "Afternoon (12pm–4pm)", "Evening (4pm–7pm)"];
const SERVICES_OFFERED = [
  "AC Repair", "AC Installation", "Boiler Repair", "Boiler Installation",
  "Furnace Repair", "Furnace Installation", "Heat Pump / Mini-Split",
  "Water Heater", "Maintenance / Tune-Up", "Something else",
];

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
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", service: "", message: "", date: "", window: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const valid = form.name.trim() && form.phone.replace(/\D/g, "").length >= 10 && form.service && form.date && form.window;

  const submit = async () => {
    if (!valid || submitting) return;
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
      />

      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-name">Name *</label>
              <input id="bk-name" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-phone">Mobile phone *</label>
              <input id="bk-phone" type="tel" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" placeholder="(914) 555-1234" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-email">Email</label>
              <input id="bk-email" type="email" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="bk-address">Service address</label>
              <input id="bk-address" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.address} onChange={(e) => update("address", e.target.value)} autoComplete="street-address" placeholder="Street, town" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">What do you need? *</label>
            <div className="flex flex-wrap gap-2">
              {SERVICES_OFFERED.map((s) => (
                <button key={s} type="button" onClick={() => update("service", s)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${form.service === s ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Pick a day *</label>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <button key={d.iso} type="button" onClick={() => update("date", d.iso)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${form.date === d.iso ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Need someone today? <a href={SITE.phoneHref} className="text-accent font-semibold hover:underline">Call {SITE.phone}</a> — same-day slots go by phone.</p>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Time window *</label>
            <div className="flex flex-wrap gap-2">
              {WINDOWS.map((w) => (
                <button key={w} type="button" onClick={() => update("window", w)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${form.window === w ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-1" htmlFor="bk-message">Anything we should know?</label>
            <textarea id="bk-message" rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="What's the system doing? Brand, age, access notes…" />
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

          <Button size="lg" disabled={!valid || submitting} onClick={submit} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            {submitting ? "Booking…" : "Book My Visit"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By booking you agree to be contacted by phone, text, or email about your request. We'll confirm the exact time by text from {SITE.smsPhone}.
          </p>
        </div>

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
