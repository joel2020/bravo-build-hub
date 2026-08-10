import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

const DEFAULT_MESSAGE =
  "You have an unfinished service request. Leave this page and discard it?";

export const useUnsavedChangesGuard = (
  isDirty: boolean,
  message = DEFAULT_MESSAGE,
): void => {
  const hasBrowserNavigation = typeof window !== "undefined";
  const blocker = useBlocker(hasBrowserNavigation && isDirty);

  useEffect(() => {
    if (!hasBrowserNavigation || blocker.state !== "blocked") return;

    if (window.confirm(message)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, hasBrowserNavigation, message]);

  useEffect(() => {
    if (!hasBrowserNavigation || !isDirty) return;

    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [hasBrowserNavigation, isDirty]);
};
