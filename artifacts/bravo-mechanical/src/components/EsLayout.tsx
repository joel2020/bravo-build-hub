import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Phone, X, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { trackCallClick } from "@/lib/analytics";
import { useTelephoneAnalytics } from "@/lib/useTelephoneAnalytics";
import { APPROVED_SERVICE_AREAS } from "@/lib/localPageModel";
import logo from "@/assets/logo-bravo.webp";

// Lightweight Spanish shell for the /es pages: Spanish nav + footer with a
// clear path back to the full English site. Kept intentionally small — the
// Spanish site is the 4 pages that win jobs, not a full mirror.
const nav = [
  { to: "/es", label: "Inicio" },
  { to: "/es/emergencia", label: "Emergencias 24/7" },
  { to: "/es/reservar", label: "Reservar Cita" },
  { to: "/es/contacto", label: "Contacto" },
];

export const EsLayout = ({ children }: { children: ReactNode }) => {
  useTelephoneAnalytics();
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
            <Link to="/es" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
              <img src={logo} alt="Logotipo de Bravo Mechanical" width={40} height={40} fetchPriority="high" className="h-10 w-10 object-contain" />
              <div className="leading-tight">
                <div className="font-extrabold text-lg text-foreground">Bravo Mechanical</div>
                <div className="text-[11px] text-muted-foreground hidden sm:block uppercase tracking-wider">Calefacción y Aire • Westchester</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/es"}
                  className={({ isActive }) => cn("px-3 py-2 text-sm font-semibold rounded-md transition-colors", isActive ? "text-accent" : "text-foreground hover:text-accent")}>
                  {item.label}
                </NavLink>
              ))}
              <Link to="/" className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-accent">English</Link>
            </nav>

            <div className="flex items-center gap-2">
              <a href={SITE.phoneHref} data-call-tracked="true" onClick={() => trackCallClick("es_header_desktop")} className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-accent">
                <Phone className="h-4 w-4" />{SITE.phone}
              </a>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <Link to="/es/contacto">Solicitar Presupuesto</Link>
              </Button>
              <a href={SITE.phoneHref} data-call-tracked="true" onClick={() => trackCallClick("es_header_mobile_icon")} className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-md bg-accent text-accent-foreground" aria-label="Llamar ahora">
                <Phone className="h-5 w-5" />
              </a>
              <button className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border" onClick={() => setOpen(!open)} aria-label="Abrir menú">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {open && (
            <div className="lg:hidden pb-4 border-t border-border -mx-4 px-4">
              <nav className="flex flex-col pt-3">
                {nav.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === "/es"} onClick={() => setOpen(false)}
                    className={({ isActive }) => cn("py-3 text-base font-semibold border-b border-border last:border-0", isActive ? "text-accent" : "text-foreground")}>
                    {item.label}
                  </NavLink>
                ))}
                <Link to="/" onClick={() => setOpen(false)} className="py-3 text-base font-semibold text-muted-foreground">English</Link>
                <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                  <Link to="/es/contacto" onClick={() => setOpen(false)}>Solicitar Presupuesto</Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-extrabold text-lg mb-2">Bravo Mechanical</div>
            <p className="text-sm text-primary-foreground/80">Servicio de calefacción y aire acondicionado en {APPROVED_SERVICE_AREAS.length} comunidades enumeradas de Westchester, NY. Hablamos español.</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Páginas</h3>
            <ul className="space-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.to}><Link to={item.to} className="text-primary-foreground/80 hover:text-primary-foreground">{item.label}</Link></li>
              ))}
              <li><Link to="/" className="text-primary-foreground font-semibold hover:underline">Sitio en inglés →</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /><a href={SITE.phoneHref} className="hover:underline">{SITE.phone}</a></li>
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /><a href={SITE.emailHref} className="hover:underline break-all">{SITE.email}</a></li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>{SITE.address.full}</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="container mx-auto px-4 py-4 text-xs text-primary-foreground/70">
            © {year} {SITE.legalName}. Licencia de HVAC de Westchester #8822.
          </div>
        </div>
      </footer>
    </div>
  );
};
