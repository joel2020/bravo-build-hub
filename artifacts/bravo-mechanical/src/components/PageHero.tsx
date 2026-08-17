import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";
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
  /** Non-PII service context for the default request and call actions. */
  trackingContext?: string;
};

export const PageHero = ({ eyebrow, title, subtitle, rightSlot, hideRightSlot, compact, trackingContext }: PageHeroProps) => {
  const showRight = !hideRightSlot;
  const right = rightSlot ?? <DefaultHeroTrustCard trackingContext={trackingContext} />;

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

const DefaultHeroTrustCard = ({ trackingContext }: Pick<PageHeroProps, "trackingContext">) => (
  <aside
    aria-label="Bravo Mechanical trust signals"
    className="bg-card border border-border rounded-xl p-6 shadow-sm"
  >
    <ul className="mt-4 space-y-3 text-sm">
      <li className="flex items-start gap-2">
        <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <span className="text-foreground">Request service online or call the team</span>
      </li>
    </ul>

    <div className="mt-5 flex flex-col gap-2">
      <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
        <Link to="/contact" onClick={() => trackRequestServiceClick("page_hero_card", trackingContext ? { service: trackingContext } : {})}>
          Get a Free Estimate
        </Link>
      </Button>
      <a
        href={SITE.phoneHref}
        onClick={() => trackCallClick("page_hero_card", trackingContext ? { service: trackingContext } : {})}
        className="inline-flex items-center justify-center gap-2 text-sm font-bold text-foreground hover:text-accent py-2"
      >
        <Phone className="h-4 w-4" />
        {SITE.phone}
      </a>
    </div>
  </aside>
);
