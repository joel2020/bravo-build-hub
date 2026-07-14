import { Link } from "react-router-dom";
import { Phone, MessageSquare, AlertTriangle, Clock, ShieldCheck, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EsLayout } from "@/components/EsLayout";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick, trackEmergencyCtaClick } from "@/lib/analytics";

const EMERGENCIAS = [
  "Sin calefacción con temperaturas bajo cero",
  "Sin aire acondicionado durante una ola de calor",
  "Olor a gas o a quemado — salga de la casa y llame",
  "Agua alrededor de la caldera o el calentador",
  "El sistema dispara el interruptor eléctrico (breaker)",
  "Ruidos fuertes de golpeteo o silbido en la caldera",
];

const PASOS = [
  { title: "1. Llámenos", desc: "Llamar es más rápido que cualquier formulario. Describa el problema — le hacemos preguntas de seguridad primero." },
  { title: "2. Despacho", desc: "Priorizamos emergencias reales: sin calefacción, sin aire, fugas y riesgos de seguridad." },
  { title: "3. Diagnóstico seguro", desc: "El técnico revisa la seguridad del sistema, encuentra la causa y le explica las opciones con precio antes de reparar." },
];

const EsEmergency = () => {
  useSeo({
    title: "Emergencias de Calefacción y Aire 24/7 en Westchester, NY | Bravo Mechanical",
    description: "Servicio de emergencia de HVAC 24/7 en el condado de Westchester, NY — en español. Sin calefacción, sin aire, fugas de gas. Llame ahora al (914) 361-9142.",
    canonical: `${SITE.siteUrl}/es/emergencia`,
  });

  return (
    <EsLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-bold text-accent mb-4">
            <Clock className="h-4 w-4" /> Abierto 24 horas, 7 días — Hablamos español
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">¿Emergencia de calefacción o aire acondicionado?</h1>
          <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto mb-6">
            No espere hasta mañana. Llame ahora y le atendemos en español — las emergencias se despachan por teléfono, a cualquier hora.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8">
            <a href={SITE.phoneHref} onClick={() => { trackCallClick("es_emergency_hero"); trackEmergencyCtaClick("es_emergency_hero"); }}>
              <Phone className="h-5 w-5 mr-2" />Llamar {SITE.phone}
            </a>
          </Button>
          <div className="mt-4">
            <a href={SITE.smsHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/85 hover:text-accent">
              <MessageSquare className="h-4 w-4" /> ¿No puede llamar? Texto al {SITE.smsPhone}
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-accent" />¿Qué cuenta como emergencia?</h2>
            <ul className="space-y-3">
              {EMERGENCIAS.map((e) => (
                <li key={e} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                  <Thermometer className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">{e}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Si huele a gas:</strong> salga de la casa de inmediato, no encienda ni apague luces, y llame al 911 y a Con Edison (1-800-752-6633) antes de llamarnos.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-accent" />Cómo funciona</h2>
            <div className="space-y-4">
              {PASOS.map((p) => (
                <div key={p.title} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              El tiempo de respuesta depende del clima, el volumen de llamadas, la disponibilidad de técnicos y su ubicación dentro del condado.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-accent/30 bg-accent/10 p-6 text-center">
          <h2 className="text-xl font-extrabold mb-1">¿No es urgente?</h2>
          <p className="text-sm text-muted-foreground mb-4">Reserve una visita normal en línea y le confirmamos por texto.</p>
          <Link to="/es/reservar" className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90">Reservar cita →</Link>
        </div>
      </section>
    </EsLayout>
  );
};

export default EsEmergency;
