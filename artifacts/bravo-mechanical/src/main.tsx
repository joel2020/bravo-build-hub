import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initializeMonitoring } from "./lib/monitoring";
import "./index.css";

initializeMonitoring();

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Bravo Mechanical app failed to render", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error.message || "Unknown frontend error";
    const isSupabaseConfig = message.includes("VITE_SUPABASE") || message.includes("Supabase");

    return (
      <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: "32px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <section style={{ maxWidth: "760px", margin: "0 auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)" }}>
          <p style={{ margin: "0 0 8px", color: "#2563eb", fontSize: "13px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Bravo Mechanical App Setup Required
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: "30px", lineHeight: 1.15 }}>The app could not load.</h1>
          <p style={{ margin: "0 0 18px", color: "#475569", lineHeight: 1.6 }}>
            {isSupabaseConfig
              ? "The CRM is deployed, but the browser Supabase configuration is missing or pointing to the wrong project."
              : "A frontend runtime error stopped the app from rendering."}
          </p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#0f172a", color: "#e2e8f0", borderRadius: "12px", padding: "16px", overflowX: "auto", fontSize: "13px" }}>{message}</pre>
          {isSupabaseConfig && (
            <div style={{ marginTop: "18px", padding: "16px", borderRadius: "12px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <strong>Fix in Vercel Production Environment Variables:</strong>
              <ul style={{ margin: "10px 0 0", paddingLeft: "20px", lineHeight: 1.7 }}>
                <li><code>VITE_SUPABASE_URL=https://tzczkcvavudoyuuetwcr.supabase.co</code></li>
                <li><code>VITE_SUPABASE_PUBLISHABLE_KEY=&lt;Bravo Supabase publishable key&gt;</code></li>
              </ul>
              <p style={{ margin: "10px 0 0", color: "#334155" }}>After saving the variables, redeploy the Vercel production deployment.</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: "20px", border: 0, borderRadius: "10px", background: "#0f172a", color: "white", padding: "12px 16px", fontWeight: 800, cursor: "pointer" }}
          >
            Reload app
          </button>
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
