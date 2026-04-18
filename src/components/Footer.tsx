import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE, SERVICES } from "@/lib/site";
import logo from "@/assets/logo-bravo.webp";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded bg-primary-foreground flex items-center justify-center p-1">
              <img src={logo} alt="Bravo Mechanical logo" className="h-full w-full object-contain" />
            </div>
            <div className="font-extrabold text-lg">Bravo Mechanical</div>
          </div>
          <p className="text-sm text-primary-foreground/80">Serving all of Westchester County, NY.</p>
          <p className="text-sm text-primary-foreground/80 mt-2">Reliable HVAC service for homes and businesses.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to="/services" className="text-primary-foreground/80 hover:text-primary-foreground">{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" />
              <a href={SITE.phoneHref} className="hover:underline">{SITE.phone}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" />
              <a href={SITE.emailHref} className="hover:underline break-all">{SITE.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Westchester County, NY</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Hours</h3>
          <ul className="space-y-2 text-sm">
            {SITE.hours.map((h) => (
              <li key={h.day} className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <span><span className="font-semibold">{h.day}:</span> {h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-primary-foreground/70">
          <div>© {year} {SITE.legalName}. All rights reserved.</div>
          <div>Licensed & insured HVAC contractor serving Westchester County, NY.</div>
        </div>
      </div>
    </footer>
  );
};
