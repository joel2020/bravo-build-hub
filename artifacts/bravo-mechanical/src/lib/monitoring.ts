const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

export function initializeMonitoring(): void {
  // TODO: Wire Sentry (or another provider) here once Bravo Mechanical has a production DSN.
  // This placeholder intentionally does nothing so builds and local development never require
  // monitoring secrets.
  if (!sentryDsn) return;
}
