import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-bravo.webp";
import { trackCallClick } from "@/lib/analytics";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/service-areas", label: "Service Areas" },
  { to: "/reviews", label: "Reviews" },
  { to: "/blog", label: "Blog" },
  { to: "/book", label: "Book Online" },
  { to: "/contact", label: "Contact" },
  { to: "/es", label: "Español" },
];

const primaryNav = [
  { to: "/services", label: "Services" },
  { to: "/service-areas", label: "Service Areas" },
  { to: "/projects", label: "Projects" },
  { to: "/reviews", label: "Reviews" },
  { to: "/book", label: "Book Online" },
  { to: "/contact", label: "Contact" },
];

const secondaryNav = [
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/es", label: "Español" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const xlBreakpointRef = useRef<MediaQueryList | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const xlBreakpoint = window.matchMedia("(min-width: 1280px)");
    xlBreakpointRef.current = xlBreakpoint;
    const closeMobileMenuAtXl = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    xlBreakpoint.addEventListener("change", closeMobileMenuAtXl);
    return () => {
      xlBreakpoint.removeEventListener("change", closeMobileMenuAtXl);
      if (xlBreakpointRef.current === xlBreakpoint) xlBreakpointRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const dismissMenu = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      if (!xlBreakpointRef.current?.matches) menuTriggerRef.current?.focus();
    };

    window.addEventListener("keydown", dismissMenu);
    return () => window.removeEventListener("keydown", dismissMenu);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 xl:h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
            <img
              src={logo}
              alt="Bravo Mechanical logo"
              width={40}
              height={40}
              fetchPriority="high"
              className="h-10 w-10 object-contain"
            />
            <div className="leading-tight">
              <div className="font-extrabold text-lg text-foreground">Bravo Mechanical</div>
              <div className="text-[11px] text-muted-foreground hidden sm:block uppercase tracking-wider">HVAC • Westchester County</div>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden xl:flex items-center gap-1">
            {primaryNav.map((item) => (
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  More
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondaryNav.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <NavLink to={item.to}>{item.label}</NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={SITE.phoneHref}
              onClick={() => trackCallClick("header_desktop")}
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-accent"
            >
              <Phone className="h-4 w-4" />
              {SITE.phone}
            </a>
            <Button asChild size="sm" className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Link to="/contact">Get a Free Estimate</Link>
            </Button>
            <a
              href={SITE.phoneHref}
              onClick={() => trackCallClick("header_mobile_icon")}
              className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-md bg-accent text-accent-foreground"
              aria-label="Call now"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              ref={menuTriggerRef}
              type="button"
              className="xl:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="xl:hidden pb-4 border-t border-border -mx-4 px-4">
            <nav id="mobile-navigation" aria-label="Mobile navigation" className="flex flex-col pt-3">
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
                <Link to="/contact" onClick={() => setOpen(false)}>Get a Free Estimate</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
