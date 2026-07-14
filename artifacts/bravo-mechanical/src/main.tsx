import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initializeMonitoring } from "./lib/monitoring";
import "./index.css";

initializeMonitoring();

// After a redeploy, hashed chunk filenames change and a user with an old tab
// can hit a 404 loading a lazy route ("Failed to fetch dynamically imported
// module"). Vite fires vite:preloadError for exactly this — reload once to
// pick up the new build instead of showing an error screen.
window.addEventListener("vite:preloadError", (event) => {
  const lastReload = Number(sessionStorage.getItem("bravo-chunk-reload") || 0);
  if (Date.now() - lastReload < 30_000) return; // avoid a reload loop
  sessionStorage.setItem("bravo-chunk-reload", String(Date.now()));
  event.preventDefault();
  window.location.reload();
});

// A failed dynamic import after a redeploy usually surfaces through
// vite:preloadError above, but not always — Safari and some in-app browsers
// throw straight into React instead. Catch it here too rather than showing an
// error screen for what is really just a stale tab.
function isStaleChunkError(error: Error) {
  const message = `${error.message} ${error.name}`;
  return /dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(
    message,
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Bravo Mechanical app failed to render", error, info);

    if (isStaleChunkError(error)) {
      const lastReload = Number(sessionStorage.getItem("bravo-chunk-reload") || 0);
      if (Date.now() - lastReload > 30_000) {
        sessionStorage.setItem("bravo-chunk-reload", String(Date.now()));
        window.location.reload();
      }
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    // This screen is seen by homeowners, not engineers. It used to print the
    // Supabase env var names and a "Setup Required" banner at them, which is
    // both useless and a config leak. Give them the phone number instead; the
    // diagnostic detail stays in the console and in dev builds.
    return (
      <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: "32px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <section style={{ maxWidth: "560px", margin: "0 auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)" }}>
          <h1 style={{ margin: "0 0 12px", fontSize: "28px", lineHeight: 1.15 }}>Something went wrong on our end.</h1>
          <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.6 }}>
            Sorry — this page didn't load properly. If you need HVAC service right now, call us and we'll pick up.
          </p>
          <a
            href="tel:+19143619142"
            style={{ display: "inline-block", borderRadius: "10px", background: "#b91c1c", color: "white", padding: "14px 20px", fontWeight: 800, textDecoration: "none" }}
          >
            Call (914) 361-9142
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginLeft: "12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", padding: "14px 20px", fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap", background: "#0f172a", color: "#e2e8f0", borderRadius: "12px", padding: "16px", overflowX: "auto", fontSize: "13px" }}>
              {this.state.error.message}
            </pre>
          )}
        </section>
      </main>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
