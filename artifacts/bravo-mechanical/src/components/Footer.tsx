import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE, SERVICES } from "@/lib/site";
import logo from "@/assets/logo-bravo.webp";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded bg-primary-foreground flex items-center justify-center p-1">
              <img src={logo} alt="Bravo Mechanical logo" width={40} height={40} loading="lazy" decoding="async" className="h-full w-full object-contain" />
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
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Service Areas</h3>
          <ul className="space-y-2 text-sm">
            {[
              { name: "Yonkers", slug: "yonkers" },
              { name: "White Plains", slug: "white-plains" },
              { name: "New Rochelle", slug: "new-rochelle" },
              { name: "Mount Vernon", slug: "mount-vernon" },
              { name: "Scarsdale", slug: "scarsdale" },
            ].map((c) => (
              <li key={c.slug}>
                <Link to={`/service-areas/${c.slug}`} className="text-primary-foreground/80 hover:text-primary-foreground">
                  HVAC {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/service-areas" className="text-primary-foreground font-semibold hover:underline">
                View all areas →
              </Link>
            </li>
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
        <div className="container mx-auto px-4 py-5 flex flex-col gap-3 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <div>© {year} {SITE.legalName}. All rights reserved.</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link to="/privacy-policy" className="hover:text-primary-foreground hover:underline">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-primary-foreground hover:underline">Terms & Conditions</Link>
            <span>Licensed & insured HVAC contractor serving Westchester County, NY.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
