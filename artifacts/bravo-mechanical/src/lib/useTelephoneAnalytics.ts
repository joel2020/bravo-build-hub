import { useEffect } from "react";
import { trackCallClick } from "./analytics";

export function useTelephoneAnalytics() {
  useEffect(() => {
    const trackUninstrumentedTelephoneLink = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="tel:"]') : null;
      if (!target || target.dataset.callTracked === "true") return;
      trackCallClick(target.dataset.callLocation || "sitewide_tel");
    };
    document.addEventListener("click", trackUninstrumentedTelephoneLink);
    return () => document.removeEventListener("click", trackUninstrumentedTelephoneLink);
  }, []);
}
