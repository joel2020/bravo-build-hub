import { Phone, MessageSquare, Siren } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SITE } from "@/lib/site";

// Sticky mobile bottom bar: Call + Text. Hidden on desktop and on the emergency page itself.
export const StickyMobileCTA = () => {
  const { pathname } = useLocation();
  const isEmergency = pathname.startsWith("/emergency-hvac-westchester");

  const smsHref = `sms:${SITE.phoneHref.replace("tel:", "")}`;

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_12px_-4px_hsl(var(--foreground)/0.15)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Quick contact"
    >
      <div className="grid grid-cols-2 gap-2 p-2">
        <a
          href={SITE.phoneHref}
          className="flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-bold py-3 text-sm active:scale-[0.98] transition"
          aria-label={`Call ${SITE.name}`}
        >
          {isEmergency ? <Siren className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          {isEmergency ? "Emergency Call" : "Call Now"}
        </a>
        <a
          href={smsHref}
          className="flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground font-bold py-3 text-sm active:scale-[0.98] transition"
          aria-label={`Text ${SITE.name}`}
        >
          <MessageSquare className="h-4 w-4" />
          Text Us
        </a>
      </div>
    </div>
  );
};
