import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

const DEFAULT_MESSAGE =
  "You have an unfinished service request. Leave this page and discard it?";

export const useUnsavedChangesGuard = (
  isDirty: boolean,
  message = DEFAULT_MESSAGE,
): void => {
  // Static SEO rendering has no navigation lifecycle to protect.
  if (typeof window === "undefined") return;

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    if (window.confirm(message)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message]);

  useEffect(() => {
    if (!isDirty) return;

    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [isDirty]);
};
