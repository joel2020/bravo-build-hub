import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EsLayout } from "@/components/EsLayout";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackLeadSubmit } from "@/lib/analytics";

// Spanish mirror of /book. Submission pipeline is identical to BookOnline.tsx
// (anon insert, source online_booking, no .select()) — keep the two in sync.
const WINDOWS = ["Mañana (8am–11am)", "Mediodía (11am–2pm)"];
const SERVICIOS = [
  "Reparación de aire", "Instalación de aire", "Reparación de caldera", "Instalación de caldera",
  "Reparación de calefactor", "Instalación de calefactor", "Bomba de calor / Mini-split",
  "Calentador de agua", "Mantenimiento", "Otra cosa",
];

const nextDays = () => {
  const days: { iso: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 14; i++) {
    d.setDate(d.getDate() + 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ iso, label: d.toLocaleDateString("es-US", { weekday: "short", month: "short", day: "numeric" }) });
  }
  return days;
};

const EsBook = () => {
  useSeo({
    title: "Reservar Cita de HVAC en Línea | Bravo Mechanical Westchester — En Español",
    description: "Elija día y horario y reserve su visita de aire acondicionado o calefacción en Westchester, NY — en español. Le confirmamos por mensaje de texto. Sin llamadas.",
    canonical: `${SITE.siteUrl}/es/reservar`,
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
    const consentStamp = `[Consent] SMS/email contact agreed at ${new Date().toISOString()} (form: online_booking, lang: es)`;
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
      setError("Algo salió mal — por favor llámenos o mándenos un texto.");
      return;
    }
    trackLeadSubmit("online_booking", { service: form.service, source: "online_booking", lang: "es" });
    setDone(true);
  };

  if (done) {
    const day = days.find((d) => d.iso === form.date);
    return (
      <EsLayout>
        <div className="container mx-auto px-4 py-20 max-w-xl text-center">
          <CheckCircle2 className="h-14 w-14 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-3">¡Su cita está solicitada!</h1>
          <p className="text-muted-foreground mb-2">
            Solicitado: <strong>{day?.label} — {form.window}</strong>
          </p>
          <p className="text-muted-foreground mb-8">
            Le acabamos de mandar un texto de confirmación y le contactaremos para fijar la hora exacta. ¿Lo necesita antes?
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            <a href={SITE.phoneHref}><Phone className="h-4 w-4 mr-2" />Llamar {SITE.phone}</a>
          </Button>
        </div>
      </EsLayout>
    );
  }

  return (
    <EsLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Reservar en línea — Hablamos español</div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">Elija un día. Elija un horario. Listo.</h1>
          <p className="text-primary-foreground/85 max-w-2xl">Sin llamadas ni esperas. Elija el día y el horario que le convenga y le confirmamos por mensaje de texto.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="es-bk-name">Nombre *</label>
              <input id="es-bk-name" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="es-bk-phone">Teléfono celular *</label>
              <input id="es-bk-phone" type="tel" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(914) 555-1234" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="es-bk-email">Correo (opcional)</label>
              <input id="es-bk-email" type="email" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1" htmlFor="es-bk-address">Dirección (opcional)</label>
              <input id="es-bk-address" className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Ciudad o dirección" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">¿Qué necesita? *</label>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS.map((s) => (
                <button key={s} type="button" onClick={() => update("service", s)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${form.service === s ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Día *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {days.map((d) => (
                <button key={d.iso} type="button" onClick={() => update("date", d.iso)}
                  className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${form.date === d.iso ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">¿Lo necesita hoy? Llame al <a href={SITE.phoneHref} className="font-semibold text-accent">{SITE.phone}</a> — las emergencias se atienden por teléfono.</p>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Horario *</label>
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
            <label className="text-sm font-bold block mb-1" htmlFor="es-bk-message">¿Algo que debamos saber?</label>
            <textarea id="es-bk-message" rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="¿Qué hace el sistema? Marca, edad, notas de acceso…" />
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

          <Button size="lg" disabled={!valid || submitting} onClick={submit} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            {submitting ? "Reservando…" : "Reservar Mi Visita"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Al presionar "Reservar Mi Visita" usted acepta que Bravo Mechanical LLC le contacte por teléfono, mensaje de texto y correo electrónico sobre su solicitud, incluso mediante mensajes automáticos. Le confirmamos la hora exacta por texto desde el {SITE.smsPhone}. El consentimiento no es condición para recibir servicio. La frecuencia de mensajes varía; pueden aplicar tarifas de mensajes y datos. Responda STOP para cancelar, HELP para ayuda. Vea nuestra <Link to="/privacy-policy" className="underline hover:text-accent">Política de Privacidad</Link> y <Link to="/terms-and-conditions" className="underline hover:text-accent">Términos de SMS</Link>.
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Prefiere hablar? <a href={SITE.phoneHref} className="text-accent font-semibold hover:underline">Llame al {SITE.phone}</a> o <a href={SITE.smsHref} className="text-accent font-semibold hover:underline"><MessageSquare className="inline h-3.5 w-3.5" /> mande un texto al {SITE.smsPhone}</a>.
        </div>
        <div className="mt-2 text-center text-sm">
          <Link to="/es/contacto" className="text-accent font-semibold hover:underline">¿Solo quiere un presupuesto? Use el formulario →</Link>
        </div>
      </section>
    </EsLayout>
  );
};

export default EsBook;
