import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-bravo.webp";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/service-areas", label: "Service Areas" },
  { to: "/reviews", label: "Reviews" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
            <img src={logo} alt="Bravo Mechanical logo" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <div className="font-extrabold text-lg text-foreground">Bravo Mechanical</div>
              <div className="text-[11px] text-muted-foreground hidden sm:block uppercase tracking-wider">HVAC • Westchester County</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                    isActive ? "text-accent" : "text-foreground hover:text-accent"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={SITE.phoneHref}
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-accent"
            >
              <Phone className="h-4 w-4" />
              {SITE.phone}
            </a>
            <Button asChild size="sm" className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Link to="/contact">Request Estimate</Link>
            </Button>
            <a
              href={SITE.phoneHref}
              className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-md bg-accent text-accent-foreground"
              aria-label="Call now"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-border -mx-4 px-4">
            <nav className="flex flex-col pt-3">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "py-3 text-base font-semibold border-b border-border last:border-0",
                      isActive ? "text-accent" : "text-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <Link to="/contact" onClick={() => setOpen(false)}>Request Estimate</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
