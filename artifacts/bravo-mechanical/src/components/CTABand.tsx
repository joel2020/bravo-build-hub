import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

type CTABandProps = {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  phoneLabel?: string;
  onPrimaryClick?: () => void;
  onPhoneClick?: () => void;
};

export const CTABand = ({
  title = "Ready to get started?",
  subtitle = "Get a fast, no-pressure estimate from Bravo Mechanical.",
  primaryLabel = "Get a Free Estimate",
  primaryHref = "/contact",
  phoneLabel = `Call ${SITE.phone}`,
  onPrimaryClick,
  onPhoneClick,
}: CTABandProps) => (
  <section className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-14 lg:py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{title}</h2>
      <p className="text-primary-foreground/85 max-w-2xl mx-auto mb-8">{subtitle}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
          <Link to={primaryHref} onClick={onPrimaryClick}>{primaryLabel}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold">
          <a href={SITE.phoneHref} onClick={onPhoneClick}><Phone className="h-4 w-4 mr-2" />{phoneLabel}</a>
        </Button>
      </div>
    </div>
  </section>
);
