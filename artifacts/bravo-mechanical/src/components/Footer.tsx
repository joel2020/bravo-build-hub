import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Lock } from "lucide-react";
import { SITE, FEATURED_SERVICE_LINKS } from "@/lib/site";
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
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground hover:underline">
              About Bravo
            </Link>
            <Link to="/blog" className="text-primary-foreground/80 hover:text-primary-foreground hover:underline">
              HVAC Resources
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Services</h2>
          <ul className="space-y-2 text-sm">
            {FEATURED_SERVICE_LINKS.map((s) => (
              <li key={s.path}>
                <Link to={s.path} className="text-primary-foreground/80 hover:text-primary-foreground">{s.title}</Link>
              </li>
            ))}
            <li>
              <Link to="/services/emergency-hvac-repair-westchester-county-ny" className="text-primary-foreground font-semibold hover:underline">
                Emergency HVAC →
              </Link>
            </li>
            <li>
              <Link to="/book" className="text-primary-foreground font-semibold hover:underline">Book online →</Link>
            </li>
            <li>
              <Link to="/projects" className="text-primary-foreground/80 hover:text-primary-foreground">Recent Projects</Link>
            </li>
            <li>
              <Link to="/es" className="text-primary-foreground/80 hover:text-primary-foreground">Hablamos español →</Link>
            </li>
            <li>
              <Link to="/financing" className="text-primary-foreground/80 hover:text-primary-foreground">Financing</Link>
            </li>
            <li>
              <Link to="/maintenance-plans" className="text-primary-foreground/80 hover:text-primary-foreground">Maintenance Plans</Link>
            </li>
            <li>
              <Link to="/services" className="text-primary-foreground font-semibold hover:underline">
                All services →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Service Areas</h2>
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
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Contact</h2>
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
              <span>{SITE.address.full}<br />Serving all of Westchester County</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container mx-auto px-4 py-5 flex flex-col gap-3 text-xs text-primary-foreground/90 sm:flex-row sm:items-center sm:justify-between">
          <div>© {year} {SITE.legalName}. All rights reserved.</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link to="/privacy-policy" className="hover:text-primary-foreground hover:underline">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-primary-foreground hover:underline">Terms & Conditions</Link>
            <Link to="/auth" rel="nofollow" className="inline-flex items-center gap-1 hover:text-primary-foreground hover:underline">
              <Lock className="h-3 w-3" /> CRM Login
            </Link>
            <span>Serving {SITE.area}.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
