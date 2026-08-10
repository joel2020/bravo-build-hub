import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Phone, ShieldCheck, Star, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { trackCallClick, trackRequestServiceClick } from "@/lib/analytics";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /**
   * Optional content rendered in the right column on lg+ screens.
   * If omitted, a default trust card is shown so the hero never has
   * a dead empty half on desktop.
   */
  rightSlot?: ReactNode;
  /** Set true to suppress the right-side card entirely (rare). */
  hideRightSlot?: boolean;
  /** Use tighter vertical spacing for task-focused pages. */
  compact?: boolean;
};

export const PageHero = ({ eyebrow, title, subtitle, rightSlot, hideRightSlot, compact }: PageHeroProps) => {
  const showRight = !hideRightSlot;
  const right = rightSlot ?? <DefaultHeroTrustCard />;

  return (
    <section className="bg-secondary border-b border-border">
      <div className={cn("container mx-auto px-4", compact ? "py-8 lg:py-14" : "py-14 lg:py-20")}>
        <div
          className={cn(
            "grid gap-10 items-start",
            showRight && "lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]"
          )}
        >
          <div>
            {eyebrow && (
              <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">{eyebrow}</div>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground max-w-3xl">{title}</h1>
            {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
          </div>
          {showRight && <div className="lg:sticky lg:top-24">{right}</div>}
        </div>
      </div>
    </section>
  );
};

const DefaultHeroTrustCard = () => (
  <aside
    aria-label="Bravo Mechanical trust signals"
    className="bg-card border border-border rounded-xl p-6 shadow-sm"
  >
    <a
      href={SITE.social.google}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 pb-4 border-b border-border hover:opacity-90 transition-opacity"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-2xl text-foreground leading-none">{SITE.rating.score.toFixed(1)}</span>
          <div className="flex gap-0.5 ml-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          Rated {SITE.rating.score.toFixed(1)} on {SITE.rating.source}
        </span>
      </div>
    </a>

    <ul className="mt-4 space-y-3 text-sm">
      <li className="flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <span className="text-foreground">Licensed &amp; insured in NY</span>
      </li>
      <li className="flex items-start gap-2">
        <FileText className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <span className="text-foreground">Free written estimates &middot; no obligation</span>
      </li>
      <li className="flex items-start gap-2">
        <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <span className="text-foreground">Same-day service when available</span>
      </li>
    </ul>

    <div className="mt-5 flex flex-col gap-2">
      <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        <Link to="/contact" onClick={() => trackRequestServiceClick("page_hero_card")}>
          Get a Free Estimate
        </Link>
      </Button>
      <a
        href={SITE.phoneHref}
        onClick={() => trackCallClick("page_hero_card")}
        className="inline-flex items-center justify-center gap-2 text-sm font-bold text-foreground hover:text-accent py-2"
      >
        <Phone className="h-4 w-4" />
        {SITE.phone}
      </a>
    </div>
  </aside>
);
