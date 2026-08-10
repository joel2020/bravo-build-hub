import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

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
      return;
    }

    if (navigationType === "POP" || hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    let observer: MutationObserver | undefined;
    const focusMain = () => {
      const main = Array.from(document.querySelectorAll<HTMLElement>("#main-content")).find(
        isVisible,
      );
      if (!main) return false;

      main.focus({ preventScroll: true });
      observer?.disconnect();
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
      focusMain();
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname, hash, navigationType]);

  return null;
};
