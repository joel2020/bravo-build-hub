import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

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
    requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
  }, [pathname, hash, navigationType]);

  return null;
};
