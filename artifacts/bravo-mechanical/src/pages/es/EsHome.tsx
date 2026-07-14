import { Link } from "react-router-dom";
import { Phone, MessageSquare, CalendarCheck, ShieldCheck, Clock, Star, Wrench, Snowflake, Flame, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EsLayout } from "@/components/EsLayout";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { trackCallClick } from "@/lib/analytics";
import heroTechnician from "@/assets/hero-technician.webp";

const SERVICIOS = [
  { icon: Snowflake, title: "Aire acondicionado", desc: "Reparación e instalación de aire central y mini-splits. Diagnóstico honesto y precio por escrito antes de empezar." },
  { icon: Flame, title: "Calefacción", desc: "Calderas (boilers), calefactores (furnaces) y bombas de calor. Servicio de emergencia cuando no hay calefacción." },
  { icon: Droplets, title: "Calentadores de agua", desc: "Reemplazo de calentadores de tanque y sin tanque, muchas veces el mismo día. Instalación según el código." },
  { icon: Wrench, title: "Mantenimiento", desc: "Afinaciones de temporada que evitan averías costosas y mantienen su garantía válida." },
];

const RAZONES = [
  { icon: ShieldCheck, title: "Con licencia y seguro", desc: "Licencia #8822 del condado de Westchester. Técnicos propios, no subcontratistas." },
  { icon: Star, title: "5.0 estrellas en Google", desc: "Calificación perfecta de nuestros clientes en Westchester." },
  { icon: Clock, title: "Emergencias 24/7", desc: "¿Sin calefacción o sin aire? Contestamos el teléfono a cualquier hora." },
  { icon: CalendarCheck, title: "Precio fijo por escrito", desc: "Presupuesto gratis y por escrito antes de comenzar cualquier trabajo. Sin sorpresas." },
];

const FAQS = [
  { q: "¿Hablan español?", a: "Sí. Puede llamarnos, mandarnos un texto o llenar el formulario en español y le atenderemos en su idioma." },
  { q: "¿Cobran por venir a ver el trabajo?", a: "El presupuesto para instalaciones y reemplazos es gratis y por escrito. Para reparaciones aplicamos una tarifa de diagnóstico que le informamos antes de agendar." },
  { q: "¿Atienden emergencias de noche o en fin de semana?", a: "Sí. Ofrecemos servicio de emergencia 24/7 para casos sin calefacción, sin aire acondicionado o fugas. Llame al (914) 361-9142 — es la forma más rápida." },
  { q: "¿Qué zonas atienden?", a: "Todo el condado de Westchester, NY: Yonkers, White Plains, New Rochelle, Mount Vernon, Port Chester, Ossining, Peekskill y más de 30 municipios." },
  { q: "¿Puedo pagar en pagos?", a: "Sí, hay opciones de financiamiento para clientes que califican en reemplazos grandes como calderas, calefactores y aire central. Pregunte al pedir su presupuesto." },
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
              Reparación, instalación y mantenimiento por técnicos locales con licencia. Presupuesto gratis por escrito y atención en español — llame, mande un texto o reserve en línea.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <a href={SITE.phoneHref} onClick={() => trackCallClick("es_hero")}><Phone className="h-4 w-4 mr-2" />Llamar {SITE.phone}</a>
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
        <p className="text-muted-foreground mb-8">Servicio residencial y comercial ligero en todo Westchester.</p>
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
              <a href={SITE.phoneHref} onClick={() => trackCallClick("es_cta_final")}><Phone className="h-4 w-4 mr-2" />{SITE.phone}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 font-bold">
              <Link to="/es/contacto">Pedir presupuesto gratis</Link>
            </Button>
          </div>
        </div>
      </section>
    </EsLayout>
  );
};

export default EsHome;
