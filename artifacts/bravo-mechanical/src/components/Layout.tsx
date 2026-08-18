import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useTelephoneAnalytics } from "@/lib/useTelephoneAnalytics";

const isAppSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("app.");

export const Layout = ({ children }: { children: ReactNode }) => {
  useTelephoneAnalytics();

  if (isAppSubdomain) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-0">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
