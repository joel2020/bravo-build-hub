import { Link } from "react-router-dom";
import { Phone, MessageSquare, CalendarCheck, ShieldCheck, Clock, Star, Wrench, Snowflake, Flame, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EsLayout } from "@/components/EsLayout";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick } from "@/lib/analytics";
import { APPROVED_SERVICE_AREAS } from "@/lib/localPageModel";
import heroTechnician from "@/assets/hero-technician.webp";

const SERVICIOS = [
  { icon: Snowflake, title: "Aire acondicionado", desc: "Reparación e instalación de aire central y mini-splits. Diagnóstico honesto y precio por escrito antes de empezar." },
  { icon: Flame, title: "Calefacción", desc: "Calderas (boilers), calefactores (furnaces) y bombas de calor. Servicio de emergencia cuando no hay calefacción." },
  { icon: Droplets, title: "Calentadores de agua", desc: "Opciones de reemplazo para equipos de tanque, sin tanque y con bomba de calor. El alcance y el horario dependen del proyecto." },
  { icon: Wrench, title: "Mantenimiento", desc: "Inspecciones y mantenimiento de temporada con recomendaciones por escrito para su equipo." },
];

const RAZONES = [
  { icon: ShieldCheck, title: "Contratista con licencia", desc: "Bravo Mechanical publica la licencia de HVAC de Westchester #8822. Confirme los requisitos de su proyecto antes de comenzar." },
  { icon: Star, title: "5.0 estrellas en Google", desc: "El Perfil de Empresa de Google muestra 5.0 con 16 reseñas al 17 de agosto de 2026." },
  { icon: Clock, title: "Solicitudes de emergencia 24/7", desc: "Llame para solicitar servicio urgente. El horario de despacho depende de las condiciones y la disponibilidad." },
  { icon: CalendarCheck, title: "Alcance por escrito", desc: "Solicite opciones y precio por escrito para el trabajo específico antes de autorizarlo." },
];

const FAQS = [
  { q: "¿Hablan español?", a: "Sí. Puede llamarnos, mandarnos un texto o llenar el formulario en español y le atenderemos en su idioma." },
  { q: "¿Cómo preparan el precio del trabajo?", a: "El alcance y el precio dependen del equipo, la falla y las condiciones del proyecto. Pida los cargos aplicables y las opciones por escrito antes de autorizar el trabajo." },
  { q: "¿Aceptan solicitudes de emergencia de noche o en fin de semana?", a: "Sí. Llame al (914) 361-9142 para solicitar servicio urgente. El despacho depende del clima, el volumen de llamadas, la ubicación y la disponibilidad del técnico." },
  { q: "¿Qué zonas atienden?", a: `Bravo Mechanical publica ${APPROVED_SERVICE_AREAS.length} comunidades de servicio en Westchester, NY. Confirme la disponibilidad para su dirección cuando solicite servicio.` },
  { q: "¿Hay opciones de financiamiento?", a: "Pregunte qué opciones están disponibles actualmente para su proyecto. La aprobación y los términos corresponden al proveedor de financiamiento." },
];

const EsHome = () => {
  useSeo({
    title: "Aire Acondicionado y Calefacción en Westchester, NY | Bravo Mechanical — Hablamos Español",
    description: "Reparación e instalación de aire acondicionado, calderas, calefacción y calentadores de agua en el condado de Westchester, NY. Hablamos español. Emergencias 24/7. Llame al (914) 361-9142.",
    canonical: `${SITE.siteUrl}/es`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: "es",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  });

  return (
    <EsLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block rounded-full bg-accent/20 px-3 py-1 text-sm font-bold text-accent mb-4">Hablamos español 🇺🇸 🇲🇽 🇬🇹 🇪🇨 🇩🇴</div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Aire acondicionado y calefacción en el condado de Westchester
            </h1>
            <p className="text-lg text-primary-foreground/85 mb-6">
              Reparación, instalación y mantenimiento por un contratista local con licencia. Solicite opciones por escrito y atención en español — llame, mande un texto o reserve en línea.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <a href={SITE.phoneHref} data-call-tracked="true" onClick={() => trackCallClick("es_hero")}><Phone className="h-4 w-4 mr-2" />Llamar {SITE.phone}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 font-bold">
                <Link to="/es/reservar">Reservar cita en línea</Link>
              </Button>
            </div>
            <a href={SITE.smsHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/85 hover:text-accent">
              <MessageSquare className="h-4 w-4" /> ¿Prefiere texto? Escríbanos al {SITE.smsPhone}
            </a>
          </div>
          <img src={heroTechnician} alt="Técnico de Bravo Mechanical trabajando en un sistema de aire acondicionado en Westchester" width={640} height={480} className="rounded-lg border border-primary-foreground/10 object-cover w-full" />
        </div>
      </section>

      {/* Servicios */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-2">¿En qué le podemos ayudar?</h2>
        <p className="text-muted-foreground mb-8">Solicitudes residenciales y comerciales ligeras en {APPROVED_SERVICE_AREAS.length} comunidades de Westchester enumeradas.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICIOS.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-lg p-6">
              <s.icon className="h-7 w-7 text-accent mb-3" />
              <h3 className="font-bold text-lg mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué nosotros */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-extrabold mb-8">Por qué las familias de Westchester nos eligen</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RAZONES.map((r) => (
              <div key={r.title} className="bg-card border border-border rounded-lg p-6">
                <r.icon className="h-6 w-6 text-accent mb-3" />
                <h3 className="font-bold mb-1">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold mb-8">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-2" data-faq-question>{f.q}</h3>
              <p className="text-sm text-muted-foreground" data-faq-answer>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">¿Listo para arreglar su calefacción o aire?</h2>
          <p className="text-primary-foreground/85 mb-6">Llámenos ahora o reserve su cita en línea — le confirmamos por mensaje de texto.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <a href={SITE.phoneHref} data-call-tracked="true" onClick={() => trackCallClick("es_cta_final")}><Phone className="h-4 w-4 mr-2" />{SITE.phone}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 font-bold">
              <Link to="/es/contacto">Solicitar presupuesto</Link>
            </Button>
          </div>
        </div>
      </section>
    </EsLayout>
  );
};

export default EsHome;
