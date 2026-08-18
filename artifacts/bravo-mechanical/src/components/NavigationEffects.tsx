import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

const isVisible = (element: HTMLElement) => {
  let current: HTMLElement | null = element;

  while (current) {
    const style = window.getComputedStyle(current);
    if (current.hidden || style.display === "none" || style.visibility === "hidden") return false;
    current = current.parentElement;
  }

  return element.isConnected;
};

export const NavigationEffects = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      trackPageView();
      return;
    }

    if (hash) return;
    trackPageView();

    if (navigationType === "POP") return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    let observer: MutationObserver | undefined;
    let deadline: number | undefined;
    const focusMain = () => {
      const main = Array.from(document.querySelectorAll<HTMLElement>("#main-content")).find(
        isVisible,
      );
      if (!main) return false;

      main.focus({ preventScroll: true });
      observer?.disconnect();
      if (deadline !== undefined) window.clearTimeout(deadline);
      return true;
    };

    const frame = requestAnimationFrame(() => {
      if (focusMain()) return;

      observer = new MutationObserver(focusMain);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["hidden", "style"],
        childList: true,
        subtree: true,
      });
      deadline = window.setTimeout(() => observer?.disconnect(), 2000);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (deadline !== undefined) window.clearTimeout(deadline);
      observer?.disconnect();
    };
  }, [pathname, hash, navigationType]);

  return null;
};
