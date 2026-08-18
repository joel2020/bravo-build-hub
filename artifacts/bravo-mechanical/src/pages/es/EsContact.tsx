import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import { EsLayout } from "@/components/EsLayout";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick } from "@/lib/analytics";

const EsContact = () => {
  useSeo({
    title: "Contacto en Español | Bravo Mechanical — HVAC en Westchester, NY",
    description: "Pida servicio de aire acondicionado o calefacción en español. Bravo Mechanical atiende todo el condado de Westchester, NY. Llame al (914) 361-9142 o envíe el formulario.",
    canonical: `${SITE.siteUrl}/es/contacto`,
  });

  return (
    <EsLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Contacto — Hablamos español</div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">Solicite servicio o un presupuesto</h1>
          <p className="text-primary-foreground/85 max-w-2xl">Cuéntenos qué pasa con su calefacción o aire acondicionado y le contactamos en breve — en español. Para emergencias, llamar es lo más rápido.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="order-2 lg:order-none space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Llame — respuesta más rápida</div>
                <a href={SITE.phoneHref} data-call-tracked="true" onClick={() => trackCallClick("es_contact_primary")} className="font-bold text-lg hover:text-accent">{SITE.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Mándenos un texto</div>
                <a href={SITE.smsHref} className="font-bold text-lg hover:text-accent">{SITE.smsPhone}</a>
                <div className="text-sm text-muted-foreground">Mande una foto del equipo o del problema y le respondemos rápido.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Correo</div>
                <a href={SITE.emailHref} className="font-semibold hover:text-accent break-all">{SITE.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Dirección</div>
                <div className="font-semibold">{SITE.address.full}</div>
                <div className="text-sm text-muted-foreground">Servicio en todo el condado de Westchester, NY</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Horario</div>
                <div className="text-sm">Abierto 24 horas para emergencias</div>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1">¿Emergencia?</div>
                <p className="text-sm text-muted-foreground">
                  ¿Sin calefacción, sin aire, olor a quemado o fuga de agua en el equipo? Llame ahora al <a href={SITE.phoneHref} data-call-tracked="true" onClick={() => trackCallClick("es_contact_emergency")} className="font-semibold text-accent hover:underline">{SITE.phone}</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-none lg:col-span-2">
          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-bold">¿Prefiere no llamar?</div>
              <div className="text-sm text-muted-foreground">Elija día y horario en línea — le confirmamos por texto.</div>
            </div>
            <Link to="/es/reservar" className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90 shrink-0">Reservar en línea →</Link>
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Formulario de servicio</h2>
          <p className="text-muted-foreground mb-4">Puede escribir su mensaje en español — nuestro equipo le responderá en su idioma.</p>
          <LeadForm lang="es" />
        </div>
      </section>
    </EsLayout>
  );
};

export default EsContact;
